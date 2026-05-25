'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiinvite')
    .setDescription('Enable or disable invite link protection')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const settings = db.getSettings(interaction.guild.id);
      settings.antiInvite = { enabled };
      db.saveSettings(interaction.guild.id, settings);
      const embed = successEmbed(enabled ? '🛡️ Anti-Invite Enabled' : 'Anti-Invite Disabled', enabled ? 'Invite links will now be blocked.' : 'Invite link detection has been disabled.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
