'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temprole').setDescription('Assign a role temporarily then auto-remove it')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const role = interaction.options.getRole('role', true);
      const duration = interaction.options.getInteger('duration', true);
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'User not in server.')] });
      const ok = await checkPermissions(interaction, ['ManageRoles']);
      if (!ok) return;
      await member.roles.add(role, `Temp role by ${interaction.user.tag}`);
      setTimeout(async () => {
      try { await member.roles.remove(role, 'Temp role expired'); } catch {}
      }, duration * 60000);
      const embed = successEmbed('⏳ Temp Role Assigned', `**${role.name}** given to **${user.tag}** for **${duration} minute(s)**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
