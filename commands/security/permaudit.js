'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permaudit')
    .setDescription('List all roles that have Administrator or dangerous permissions')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const dangerous = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'BanMembers', 'KickMembers', 'MentionEveryone', 'ManageWebhooks'];
      const roles = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id);
      const findings = [];
      for (const [, role] of roles) {
      const flags = dangerous.filter(p => role.permissions.has(p));
      if (flags.length) findings.push(`**${role.name}**: ${flags.join(', ')}`);
      }
      const embed = successEmbed(
      '🔍 Permission Audit',
      findings.length
      ? `Found **${findings.length}** role(s) with elevated permissions:`
      : '✅ No roles with dangerous permissions found.',
      findings.length ? [{ name: 'Roles', value: findings.slice(0, 20).join('\n').slice(0, 1024), inline: false }] : []
      );
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
