'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages with optional filters')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1–10000)').setRequired(true).setMinValue(1).setMaxValue(10000))
    .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user'))
    .addStringOption(o => o.setName('contains').setDescription('Only delete messages containing this text'))
    .addBooleanOption(o => o.setName('bots').setDescription('Only delete bot messages')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const ok = await checkPermissions(interaction, ['ManageMessages']);
      if (!ok) return;

      const amount      = interaction.options.getInteger('amount', true);
      const filterUser  = interaction.options.getUser('user');
      const filterText  = interaction.options.getString('contains');
      const filterBots  = interaction.options.getBoolean('bots');
      const cutoff      = Date.now() - 14 * 24 * 60 * 60 * 1000; // 14-day Discord limit

      let totalDeleted = 0;
      let remaining    = amount;
      let lastId       = null;

      while (remaining > 0) {
        const fetchLimit = Math.min(100, remaining);
        const options    = { limit: 100 }; // always fetch 100 to account for filtering
        if (lastId) options.before = lastId;

        const fetched = await interaction.channel.messages.fetch(options);
        if (!fetched.size) break; // no more messages

        lastId = fetched.last().id;

        // Apply filters + 14-day cutoff
        let filtered = fetched.filter(m => m.createdTimestamp > cutoff);
        if (filterUser) filtered = filtered.filter(m => m.author.id === filterUser.id);
        if (filterText) filtered = filtered.filter(m => m.content.toLowerCase().includes(filterText.toLowerCase()));
        if (filterBots) filtered = filtered.filter(m => m.author.bot);

        if (!filtered.size) {
          // If we hit messages older than 14 days, stop — nothing left to bulk delete
          if (fetched.every(m => m.createdTimestamp <= cutoff)) break;
          continue;
        }

        const batch   = filtered.first(fetchLimit);
        const deleted = await interaction.channel.bulkDelete(batch, true).catch(() => null);
        const count   = deleted ? deleted.size : 0;

        totalDeleted += count;
        remaining    -= count;

        // Small delay to avoid rate limits on large purges
        if (remaining > 0 && count > 0) await new Promise(r => setTimeout(r, 1000));

        // If bulkDelete returned fewer than expected, we've hit the 14-day wall
        if (count === 0) break;
      }

      if (!totalDeleted) {
        return interaction.editReply({ embeds: [errorEmbed('❌ No Messages', 'No messages matched your filters or all are older than 14 days.')] });
      }

      const filters = [];
      if (filterUser) filters.push(`User: ${filterUser.tag}`);
      if (filterText)  filters.push(`Contains: "${filterText}"`);
      if (filterBots)  filters.push('Bots only');

      await interaction.editReply({
        embeds: [successEmbed('🗑️ Messages Deleted', `Deleted **${totalDeleted}** message(s).`, [
          { name: 'Filters Applied', value: filters.length ? filters.join('\n') : 'None', inline: false },
          { name: '⚠️ Note',         value: 'Only messages newer than 14 days can be bulk deleted (Discord limit).', inline: false }
        ])]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
