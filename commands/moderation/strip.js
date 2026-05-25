'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('strip').setDescription('Remove all roles from a member')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'User not in server.')] });
      const ok = await checkPermissions(interaction, ['ManageRoles'], member);
      if (!ok) return;
      const removable = member.roles.cache.filter(r => r.id !== interaction.guild.id && r.position < interaction.guild.members.me.roles.highest.position);
      await member.roles.remove(removable, reason);
      const embed = successEmbed('🪄 Roles Stripped', `Removed **${removable.size}** role(s) from **${user.tag}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
