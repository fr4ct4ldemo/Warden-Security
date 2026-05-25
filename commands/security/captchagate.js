'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('captchagate')
    .setDescription('Enable or disable a CAPTCHA gate for new members')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable captcha gate').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel used for captcha verification'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const settings = db.getSettings(guildId);
      settings.captchaGate = { enabled, channelId: channel?.id ?? settings.captchaGate?.channelId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🔐 CAPTCHA Gate Updated', enabled ? `CAPTCHA gate is enabled${channel ? ` in ${channel}` : ``}.` : 'CAPTCHA gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
