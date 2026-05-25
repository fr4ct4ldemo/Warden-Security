'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages with optional filters')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1–100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user'))
    .addStringOption(o => o.setName('contains').setDescription('Only delete messages containing this text'))
    .addBooleanOption(o => o.setName('bots').setDescription('Only delete bot messages')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const ok = await checkPermissions(interaction, ['ManageMessages']);
      if (!ok) return;
      const amount = interaction.options.getInteger('amount', true);
      const filterUser = interaction.options.getUser('user');
      const filterContains = interaction.options.getString('contains');
      const filterBots = interaction.options.getBoolean('bots');
      let messages = await interaction.channel.messages.fetch({ limit: 100 });
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
      messages = messages.filter(m => m.createdTimestamp > cutoff);
      if (filterUser) messages = messages.filter(m => m.author.id === filterUser.id);
      if (filterContains) messages = messages.filter(m => m.content.toLowerCase().includes(filterContains.toLowerCase()));
      if (filterBots) messages = messages.filter(m => m.author.bot);
      const toDelete = messages.first(amount);
      if (!toDelete.length) return interaction.editReply({ embeds: [errorEmbed('❌ No Messages', 'No messages matched your filters or all are older than 14 days.')] });
      const deleted = await interaction.channel.bulkDelete(toDelete, true).catch(() => null);
      const count = deleted ? deleted.size : toDelete.length;
      const filters = [];
      if (filterUser) filters.push(`User: ${filterUser.tag}`);
      if (filterContains) filters.push(`Contains: "${filterContains}"`);
      if (filterBots) filters.push('Bots only');
      const embed = successEmbed('🗑️ Messages Deleted', `Deleted **${count}** message(s).`, [
        { name: 'Filters Applied', value: filters.length ? filters.join('\n') : 'None', inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
