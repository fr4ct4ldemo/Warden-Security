'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgematch').setDescription('Delete messages matching a keyword or phrase')
    .addStringOption(o => o.setName('text').setDescription('Text to match').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to scan (max 100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel (defaults to current)'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageMessages']);
      if (!ok) return;
      const text = interaction.options.getString('text', true).toLowerCase();
      const amount = interaction.options.getInteger('amount', true);
      const channel = interaction.options.getChannel('channel') ?? interaction.channel;
      const messages = await channel.messages.fetch({ limit: amount });
      const toDelete = messages.filter(m => m.content.toLowerCase().includes(text) && Date.now() - m.createdTimestamp < 1209600000);
      await channel.bulkDelete(toDelete, true);
      const embed = successEmbed('🔍 Matching Messages Purged', `Deleted **${toDelete.size}** message(s) matching \`${text}\` in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
