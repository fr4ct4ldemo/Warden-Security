'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('honeypot')
    .setDescription('Configure a honeypot channel for security monitoring')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable honeypot').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Honeypot channel to monitor'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const settings = db.getSettings(guildId);
      if (enabled && !channel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'A honeypot channel must be provided when enabling.')] });
      settings.honeypot = { enabled, channelId: channel?.id ?? settings.honeypot?.channelId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🐝 Honeypot Updated', enabled ? `Honeypot channel set to ${channel}.` : 'Honeypot monitoring disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
