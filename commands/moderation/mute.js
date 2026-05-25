'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute').setDescription('Mute a user via role')
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
      let roleId = db.getMutedRole(guildId);
      let role = roleId ? interaction.guild.roles.cache.get(roleId) : null;
      if (!role) {
      role = await interaction.guild.roles.create({ name: 'Muted', reason: 'Auto-created muted role' });
      interaction.guild.channels.cache.forEach(ch => {
      ch.permissionOverwrites.edit(role, { SendMessages: false, AddReactions: false, Speak: false }).catch(() => null);
      });
      db.setMutedRole(guildId, role.id);
      }
      await member.roles.add(role, reason);
      const embed = successEmbed('🔇 Muted', `**${user.tag}** was muted.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
