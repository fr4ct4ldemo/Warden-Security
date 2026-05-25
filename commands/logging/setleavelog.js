'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setleavelog')
    .setDescription('Set the leave log channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for leave logs').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const settings = db.getSettings(interaction.guild.id);
      settings.leaveLogChannel = channel.id;
      db.saveSettings(interaction.guild.id, settings);
      const embed = successEmbed('📋 Leave Log Set', `Leave logs will be sent to <#${channel.id}>.`);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
