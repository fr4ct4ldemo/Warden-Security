'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('securityreport')
    .setDescription('Generate a security overview of this server\'s current automod settings')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const s = settings;
      const bool = v => v?.enabled ? '✅ On' : '❌ Off';
      const fields = [
      { name: 'Anti-Spam',         value: bool(s.antiSpam),           inline: true },
      { name: 'Anti-Link',          value: bool(s.antiLink),            inline: true },
      { name: 'Anti-Invite',        value: bool(s.antiInvite),          inline: true },
      { name: 'Anti-Caps',          value: bool(s.antiCaps),            inline: true },
      { name: 'Anti-Emoji',         value: bool(s.antiEmoji),           inline: true },
      { name: 'Anti-Mentions',      value: bool(s.antiMentions),        inline: true },
      { name: 'Anti-Word',          value: bool(s.antiWord),            inline: true },
      { name: 'Anti-Zalgo',         value: bool(s.antiZalgo),           inline: true },
      { name: 'Anti-Phishing',      value: bool(s.antiPhishing),        inline: true },
      { name: 'Anti-Alt',           value: bool(s.antiAlt),             inline: true },
      { name: 'Anti-Nuke',          value: bool(s.antiNuke),            inline: true },
      { name: 'Anti-Raid',          value: bool(s.antiRaid),            inline: true },
      { name: 'Token Blocker',      value: bool(s.tokenBlocker),        inline: true },
      { name: 'Link Cooldown',      value: bool(s.linkCooldown),        inline: true },
      { name: 'New Acct Filter',    value: bool(s.newAccountFilter),    inline: true },
      { name: 'Mention Spam',       value: bool(s.mentionSpam),         inline: true },
      { name: 'Dupe Message',       value: bool(s.dupMessage),          inline: true },
      { name: 'Sticky Mute',        value: bool(s.stickyMute),          inline: true },
      { name: 'Ghost Ping',         value: bool(s.ghostPing),           inline: true },
      { name: 'Attachment Filter',  value: bool(s.attachmentFilter),    inline: true },
      { name: 'Floodgate',          value: bool(s.floodgate),           inline: true },
      { name: 'Anti-Hoisting',      value: bool(s.antiHoisting),        inline: true },
      { name: 'Import Filter',      value: bool(s.importFilter),        inline: true },
      { name: 'Raid Mode',          value: s.raidMode ? '🚨 Active' : '✅ Inactive', inline: true },
      ];
      const embed = successEmbed('🛡️ Security Report', `Current automod & security status for **${interaction.guild.name}**:`, fields);
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
