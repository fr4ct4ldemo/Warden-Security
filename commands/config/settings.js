'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View all current automod and bot settings for this server'),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const guildId = interaction.guild.id;
      const s = db.getSettings(guildId);
      const logCh = db.getLogChannel(guildId);
      const automodCh = db.getAutomodLogChannel(guildId);
      const mutedRole = db.getMutedRole(guildId);
      const punishments = db.getWarnPunishments(guildId);
      const verification = db.getVerificationSettings(guildId);

      const bool = v => v ? '✅ Enabled' : '❌ Disabled';
      const lines = [
        `**Log Channel:** ${logCh ? `<#${logCh}>` : 'Not set'}`,
        `**Automod Log Channel:** ${automodCh ? `<#${automodCh}>` : 'Falls back to log channel'}`,
        `**Muted Role:** ${mutedRole ? `<@&${mutedRole}>` : 'Not set'}`,
        `**Verification:** ${verification.enabled ? `✅ (Role: <@&${verification.role_id}>, Panel: <#${verification.channel_id}>)` : '❌ Disabled'}`,
        '',
        `**Anti-Spam:** ${bool(s.antiSpam?.enabled)} — limit: ${s.antiSpam?.limit ?? 5}, interval: ${s.antiSpam?.interval ?? 5000}ms`,
        `**Anti-Link:** ${bool(s.antiLink?.enabled)} — whitelist: ${(s.antiLink?.whitelist || []).join(', ') || 'none'}`,
        `**Anti-Phishing:** ${bool(s.antiPhishing?.enabled)}`,
        `**Anti-Alt:** ${bool(s.antiAlt?.enabled)} — min age: ${s.antiAlt?.minAge ?? 7} days`,
        `**Anti-Raid:** ${bool(s.antiRaid?.enabled)} — threshold: ${s.antiRaid?.threshold ?? 5}/10s`,
        `**Anti-Mentions:** ${bool(s.antiMentions?.enabled)} — limit: ${s.antiMentions?.limit ?? 5}`,
        `**Anti-Caps:** ${bool(s.antiCaps?.enabled)} — ${s.antiCaps?.percent ?? 70}% caps, min length: ${s.antiCaps?.minLength ?? 10}`,
        `**Anti-Emoji:** ${bool(s.antiEmoji?.enabled)} — limit: ${s.antiEmoji?.limit ?? 10}`,
        `**Anti-Word:** ${bool(s.antiWord?.enabled)} — ${(s.antiWord?.words || []).length} custom word(s)`,
        `**Anti-Mass Mention:** ${bool(s.antiMassMention?.enabled)}`,
        '',
        `**Warn Punishments:** ${Object.entries(punishments).map(([k,v]) => `#${k}→${v}`).join(', ') || 'default'}`,
      ];

      const embed = successEmbed(`⚙️ Server Settings — ${interaction.guild.name}`, lines.join('\n'));
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
