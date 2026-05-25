'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempmute').setDescription('Temporarily mute a user via role')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const duration = interaction.options.getInteger('duration', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'User not in server.')] });
      const ok = await checkPermissions(interaction, ['ManageRoles'], member);
      if (!ok) return;
      let roleId = db.getMutedRole(guildId);
      let role = roleId ? interaction.guild.roles.cache.get(roleId) : null;
      if (!role) {
      role = await interaction.guild.roles.create({ name: 'Muted', reason: 'Auto-created muted role' });
      db.setMutedRole(guildId, role.id);
      }
      await member.roles.add(role, reason);
      db.addTempMute(guildId, user.id, Date.now() + duration * 60000);
      const embed = successEmbed('⏳ Temp Muted', `**${user.tag}** muted for **${duration} minute(s)**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
