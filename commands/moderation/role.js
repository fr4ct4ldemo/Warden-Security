'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a user')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true).addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to add/remove').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const action = interaction.options.getString('action', true);
      const user = interaction.options.getUser('user', true);
      const role = interaction.options.getRole('role', true);
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Member not found.')] });
      const ok = await checkPermissions(interaction, ['ManageRoles'], member);
      if (!ok) return;
      if (role.position >= interaction.guild.members.me.roles.highest.position)
        return interaction.editReply({ embeds: [errorEmbed('❌ Hierarchy Error', 'That role is equal to or higher than my highest role.')] });
      if (action === 'add') {
        await member.roles.add(role, `Added by ${interaction.user.tag}`);
      } else {
        await member.roles.remove(role, `Removed by ${interaction.user.tag}`);
      }
      const embed = successEmbed(`✅ Role ${action === 'add' ? 'Added' : 'Removed'}`, `Role ${role} was ${action === 'add' ? 'added to' : 'removed from'} **${user.tag}**.`, [
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
