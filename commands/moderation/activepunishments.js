'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activepunishments').setDescription('List all active temp-bans and temp-mutes in this server')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ModerateMembers']);
      if (!ok) return;
      const tempBans = db.getTempBans ? db.getTempBans(guildId) : [];
      const tempMutes = db.getTempMutes ? db.getTempMutes(guildId) : [];
      const banList = tempBans.map(b => `**TempBan** — <@${b.userId}> — expires <t:${Math.floor(b.expiresAt / 1000)}:R>`).join('\n') || 'None';
      const muteList = tempMutes.map(m => `**TempMute** — <@${m.userId}> — expires <t:${Math.floor(m.expiresAt / 1000)}:R>`).join('\n') || 'None';
      return interaction.editReply({ embeds: [successEmbed('⏳ Active Punishments', '', [
      { name: `Temp Bans (${tempBans.length})`, value: banList.slice(0, 1024), inline: false },
      { name: `Temp Mutes (${tempMutes.length})`, value: muteList.slice(0, 1024), inline: false },
      ])] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
