'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imageonlymode')
    .setDescription('Restrict a channel to image/attachment-only messages')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel', true);
      const enabled = interaction.options.getBoolean('enabled', true);
      if (!settings.imageOnlyChannels) settings.imageOnlyChannels = [];
      if (enabled) {
      if (!settings.imageOnlyChannels.includes(channel.id)) settings.imageOnlyChannels.push(channel.id);
      } else {
      settings.imageOnlyChannels = settings.imageOnlyChannels.filter(id => id !== channel.id);
      }
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('🖼️ Image-Only Mode Enabled', `${channel} is now restricted to image/attachment-only messages.`)
      : successEmbed('🖼️ Image-Only Mode Disabled', `${channel} is no longer restricted to images only.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
