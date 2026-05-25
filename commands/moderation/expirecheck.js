'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('expirecheck').setDescription('Manually trigger a check and lift expired temp-bans and temp-mutes')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['Administrator']);
      if (!ok) return;
      const now = Date.now();
      const tempBans = db.getTempBans ? db.getTempBans(guildId).filter(b => b.expiresAt <= now) : [];
      const tempMutes = db.getTempMutes ? db.getTempMutes(guildId).filter(m => m.expiresAt <= now) : [];
      let unbanned = 0, unmuted = 0;
      for (const b of tempBans) {
      try { await interaction.guild.members.unban(b.userId, 'Temp ban expired'); db.removeTempBan(guildId, b.userId); unbanned++; } catch {}
      }
      const mutedRoleId = db.getMutedRole(guildId);
      for (const m of tempMutes) {
      try {
      const member = await interaction.guild.members.fetch(m.userId).catch(() => null);
      if (member && mutedRoleId) await member.roles.remove(mutedRoleId, 'Temp mute expired');
      db.removeTempMute(guildId, m.userId); unmuted++;
      } catch {}
      }
      const embed = successEmbed('✅ Expire Check Complete', `Lifted **${unbanned}** expired temp-ban(s) and **${unmuted}** expired temp-mute(s).`);
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
