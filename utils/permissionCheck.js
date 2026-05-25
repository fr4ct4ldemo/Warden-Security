'use strict';
const { errorEmbed } = require('./embedBuilder');
const { MessageFlags } = require('discord.js');
const db = require('./database');

function formatPerms(perms) { return perms.join(', '); }

async function checkPermissions(interaction, permissionsArray, targetMember = null) {
  const missing = [];
  for (const p of permissionsArray) if (!interaction.member.permissions.has(p)) missing.push(p);
  if (missing.length) {
    await interaction.editReply({ embeds: [errorEmbed('❌ Missing Permissions', `You need: ${formatPerms(missing)}`)], flags: MessageFlags.Ephemeral });
    return false;
  }
  if (targetMember && interaction.guild) {
    const botMember = interaction.guild.members.me;
    if (!botMember) {
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Bot member not cached')], flags: MessageFlags.Ephemeral });
      return false;
    }
    if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
      await interaction.editReply({ embeds: [errorEmbed('❌ Permission Denied', 'Target has equal or higher role than me.')], flags: MessageFlags.Ephemeral });
      return false;
    }
    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      await interaction.editReply({ embeds: [errorEmbed('❌ Permission Denied', 'Target has equal or higher role than you.')], flags: MessageFlags.Ephemeral });
      return false;
    }
  }
  return true;
}

function isWhitelisted(guildId, userId, roleIds = []) {
  try {
    const users = db.getWhitelist(guildId, 'user');
    const roles = db.getWhitelist(guildId, 'role');
    if (users.includes(userId)) return true;
    for (const r of roleIds) if (roles.includes(r)) return true;
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { checkPermissions, isWhitelisted };
