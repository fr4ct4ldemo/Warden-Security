'use strict';
const { SlashCommandBuilder, version: djsVersion } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('View bot statistics and info'),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
      const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const avatarURL = client.user.displayAvatarURL({ size: 256, extension: client.user.avatar?.startsWith('a_') ? 'gif' : 'png' });
      const embed = successEmbed(`🤖 ${client.user.tag}`, 'Security & Moderation Bot v2.0', [
        { name: 'Developer', value: 'Bot Owner', inline: true },
        { name: 'Library', value: `Discord.js v${djsVersion}`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Commands', value: `${client.commands.size}`, inline: true },
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${totalUsers}`, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime || 0), inline: true },
        { name: 'Memory Usage', value: `${memMB} MB`, inline: true }
      ]);
      embed.setThumbnail(avatarURL);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
