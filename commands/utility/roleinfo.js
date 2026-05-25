'use strict';
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

const KEY_PERMS = [
  'Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'ManageMessages',
  'ManageNicknames', 'KickMembers', 'BanMembers', 'MuteMembers', 'DeafenMembers',
  'MoveMembers', 'MentionEveryone', 'ModerateMembers'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('View detailed information about a role')
    .addRoleOption(o => o.setName('role').setDescription('Role to inspect').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const role = interaction.options.getRole('role', true);
      const memberCount = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;
      const createdAt = new Date(role.createdTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const keyPerms = KEY_PERMS.filter(p => role.permissions.has(p)).join(', ') || 'None';
      const embed = successEmbed(`🎭 Role: ${role.name}`, `ID: ${role.id}`, [
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Members', value: `${memberCount}`, inline: true },
        { name: 'Mentionable', value: role.mentionable ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Hoisted', value: role.hoist ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Managed', value: role.managed ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Created At', value: createdAt, inline: false },
        { name: 'Key Permissions', value: keyPerms, inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
