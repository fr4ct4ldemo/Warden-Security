'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Set the channel for moderation logs')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send logs to').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      db.setLogChannel(interaction.guild.id, channel.id);
      const embed = successEmbed('📋 Log Channel Set', `Moderation logs will be sent to <#${channel.id}>.`);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
