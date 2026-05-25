'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissionlock')
    .setDescription('Lock or unlock channel permission changes for everyone')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable permission lock').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock permissions for'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const settings = db.getSettings(guildId);
      settings.permissionLock = { enabled, channelId: channel?.id ?? settings.permissionLock?.channelId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🔐 Permission Lock Updated', enabled ? `Permission lock enabled${channel ? ` for ${channel}` : ``}.` : 'Permission lock disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
