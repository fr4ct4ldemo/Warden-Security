'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View detailed information about a user')
    .addUserOption(o => o.setName('user').setDescription('User to inspect (defaults to you)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const joinedAt = member ? new Date(member.joinedTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
      const createdAt = new Date(user.createdTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const ageDays = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));
      const roles = member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position) : null;
      const roleList = roles && roles.size ? roles.first(10).map(r => r.toString()).join(', ') : 'None';
      const highestRole = roles && roles.size ? roles.first().toString() : 'None';
      const warnCount = db.countWarnings(interaction.guild.id, user.id);
      const mutedRoleId = db.getMutedRole(interaction.guild.id);
      const isMuted = mutedRoleId && member ? member.roles.cache.has(mutedRoleId) : false;
      const isTimedOut = member ? !!member.communicationDisabledUntilTimestamp : false;
      const isVoiceBanned = db.isVoiceBanned(interaction.guild.id, user.id);
      const avatarURL = user.displayAvatarURL({ size: 256, extension: user.avatar?.startsWith('a_') ? 'gif' : 'png' });
      const embed = successEmbed(`👤 ${user.tag}`, `ID: ${user.id}`, [
        { name: 'Nickname', value: member?.nickname || 'None', inline: true },
        { name: 'Joined Server', value: joinedAt, inline: true },
        { name: 'Account Created', value: createdAt, inline: true },
        { name: 'Account Age', value: `${ageDays} days`, inline: true },
        { name: 'Highest Role', value: highestRole, inline: true },
        { name: 'Warnings', value: `${warnCount}`, inline: true },
        { name: 'Timed Out', value: isTimedOut ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Muted', value: isMuted ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Voice Banned', value: isVoiceBanned ? '✅ Yes' : '❌ No', inline: true },
        { name: `Roles (${roles ? roles.size : 0})`, value: roleList, inline: false }
      ]);
      embed.setThumbnail(avatarURL);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
