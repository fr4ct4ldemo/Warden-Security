'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn').setDescription('Issue a warning to a user')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason', true);
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const ok = await checkPermissions(interaction, ['ModerateMembers'], member);
      if (!ok) return;
      db.addWarning(guildId, user.id, reason, interaction.user.tag);
      const count = db.countWarnings(guildId, user.id);
      const punishments = db.getWarnPunishments(guildId);
      const auto = punishments[count] || null;
      const embed = successEmbed('⚠️ Warned', `**${user.tag}** warned. Warning #${count}.\nReason: ${reason}${auto ? `\nAuto-punishment: **${auto}**` : ''}`);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, guildId, embed);
      if (auto && member) {
      try {
      if (auto === 'mute') { const r = db.getMutedRole(guildId); if (r) await member.roles.add(r); }
      else if (auto === 'kick') await member.kick('Auto punishment');
      else if (auto === 'ban') await interaction.guild.members.ban(user.id, { reason: 'Auto punishment' });
      } catch {}
      }
      return;
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
