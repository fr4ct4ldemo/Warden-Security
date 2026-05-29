'use strict';
const db = require('../utils/database');
const antiRaid = require('../utils/antiRaidHandler');
const { errorEmbed, successEmbed } = require('../utils/embedBuilder');
const { logAction } = require('../utils/logger');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member, client) {
    try {
      antiRaid(member, client);
      const guildId = member.guild.id;
      const settings = db.getSettings(guildId);
      // antiAlt
      if (settings.antiAlt && settings.antiAlt.enabled) {
        const min = settings.antiAlt.minAge || 7;
        const created = member.user.createdTimestamp;
        const ageDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
        if (ageDays < min) {
          await member.kick('Account too new (anti-alt)').catch(()=>null);
          const embed = errorEmbed('🚨 Anti-Alt — Kicked', `${member.user.tag} was kicked due to account age (${ageDays} days).`);
          await logAction(client, guildId, embed);
          return;
        }
      }
      // raid mode check handled in antiRaid
      // voice ban
      if (db.isVoiceBanned(guildId, member.id)) {
        // apply connect deny for all voice channels via permission overwrites
        member.guild.channels.cache.filter(c=>c.isVoiceBased()).forEach(ch=>{
          try { ch.permissionOverwrites.edit(member.id, { Connect: false }).catch(()=>null); } catch {}
        });
      }
      // blacklist users
      if (db.isBlacklisted(guildId, 'user', member.id)) {
        await member.ban({ reason: 'Blacklisted user auto-ban' }).catch(()=>null);
        const embed = errorEmbed('🚨 Auto-Ban Blacklisted User', `${member.user.tag} was auto-banned (blacklist).`);
        await logAction(client, guildId, embed);
        return;
      }

      const autoroleId = db.getAutorole(guildId);
      if (autoroleId) {
        const role = member.guild.roles.cache.get(autoroleId);
        if (role) {
          const botMember = member.guild.members.me;
          if (botMember && botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            await member.roles.add(role).catch(err => {
              console.error(`[Autorole] Failed to assign role ${autoroleId} to ${member.id} in guild ${guildId}:`, err);
            });
          } else {
            console.error(`[Autorole] Missing Manage Roles permission for guild ${guildId}.`);
          }
        } else {
          console.error(`[Autorole] Configured role ${autoroleId} not found in guild ${guildId}.`);
        }
      }

      const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / (1000*60*60*24));
      const embed = successEmbed('✅ Member Joined', `Username: ${member.user.tag}\nID: ${member.id}\nAccount Created: ${new Date(member.user.createdTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\nAccount Age: ${accountAge} days\nServer Member Count: ${member.guild.memberCount}`);
      await logAction(client, guildId, embed);
    } catch (err) { console.error(err); }
  }
};
