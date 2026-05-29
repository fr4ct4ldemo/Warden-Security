'use strict';
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');

const COLOR = 0x2D0057;

function buildEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage the automatic role assigned to new members')
    .addSubcommand(sub => sub
      .setName('set')
      .setDescription('Set the role to assign automatically when new members join')
      .addRoleOption(option => option
        .setName('role')
        .setDescription('Role to assign to new members')
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName('remove')
      .setDescription('Remove the currently configured autorole'))
    .addSubcommand(sub => sub
      .setName('info')
      .setDescription('Show the currently configured autorole')),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === 'set' || subcommand === 'remove') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
          return interaction.editReply({ embeds: [buildEmbed('❌ Missing Permissions', 'You need the Manage Roles permission to use this command.')] });
        }
      }

      if (subcommand === 'set') {
        const role = interaction.options.getRole('role', true);
        db.setAutorole(guildId, role.id);
        return interaction.editReply({ embeds: [buildEmbed('✅ Autorole Set', `New members will now receive ${role} when they join.`)] });
      }

      if (subcommand === 'remove') {
        const current = db.getAutorole(guildId);
        if (!current) {
          return interaction.editReply({ embeds: [buildEmbed('ℹ️ No Autorole Configured', 'There is no autorole configured for this server.')] });
        }
        db.removeAutorole(guildId);
        return interaction.editReply({ embeds: [buildEmbed('✅ Autorole Removed', 'The autorole configuration has been removed.')] });
      }

      if (subcommand === 'info') {
        const autoroleId = db.getAutorole(guildId);
        if (!autoroleId) {
          return interaction.editReply({ embeds: [buildEmbed('📘 Autorole Info', 'No autorole is currently configured for this server.')] });
        }

        const role = interaction.guild.roles.cache.get(autoroleId);
        const description = role
          ? `Current autorole: ${role} (${autoroleId})`
          : `A role is configured (${autoroleId}), but it no longer exists in this server.`;

        return interaction.editReply({ embeds: [buildEmbed('📘 Autorole Info', description)] });
      }
    } catch (err) {
      console.error('[Autorole Command] Error handling interaction:', err);
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({ embeds: [buildEmbed('❌ Error', 'An unexpected error occurred while processing the autorole command.')] });
      }
      return interaction.reply({ embeds: [buildEmbed('❌ Error', 'An unexpected error occurred while processing the autorole command.')], ephemeral: true });
    }
  }
};
