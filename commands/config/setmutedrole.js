'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmutedrole')
    .setDescription('Set the role used for muting members')
    .addRoleOption(o => o.setName('role').setDescription('Muted role').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const role = interaction.options.getRole('role', true);
      db.setMutedRole(interaction.guild.id, role.id);
      const embed = successEmbed('🔇 Muted Role Set', `Members will be muted by assigning <@&${role.id}>.`);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
