'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setafk').setDescription('Set the AFK channel and timeout')
    .addChannelOption(o => o.setName('channel').setDescription('AFK voice channel (leave blank to remove)'))
    .addIntegerOption(o => o.setName('timeout').setDescription('AFK timeout in seconds (60, 300, 900, 1800, 3600)')
    .addChoices(
    { name: '1 minute', value: 60 },
    { name: '5 minutes', value: 300 },
    { name: '15 minutes', value: 900 },
    { name: '30 minutes', value: 1800 },
    { name: '1 hour', value: 3600 }
    ))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel');
      const timeout = interaction.options.getInteger('timeout') ?? 300;
      await interaction.guild.setAFKChannel(channel ?? null);
      if (channel) await interaction.guild.setAFKTimeout(timeout);
      const embed = successEmbed('💤 AFK Updated', channel
      ? `AFK channel: ${channel}, timeout: **${timeout}s**.`
      : 'AFK channel cleared.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
