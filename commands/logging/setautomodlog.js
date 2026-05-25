'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setautomodlog')
    .setDescription('Set a separate channel for automod logs (falls back to setlog if unset)')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send automod logs to').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      db.setAutomodLogChannel(interaction.guild.id, channel.id);
      const embed = successEmbed('🛡️ Automod Log Channel Set', `Automod logs will be sent to <#${channel.id}>.`);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
