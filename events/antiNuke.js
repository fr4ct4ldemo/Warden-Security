'use strict';
const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const db = require('../utils/database');

const WINDOW_MS = 10_000;
const tracker = new Map();
const ACTIONS = ['channelDelete', 'channelCreate', 'roleDelete', 'roleCreate', 'ban', 'kick', 'webhookCreate'];

function getTrackedUser(guildId, userId) {
  if (!tracker.has(guildId)) tracker.set(guildId, new Map());
  const guildTracker = tracker.get(guildId);
  if (!guildTracker.has(userId)) {
    const entry = {};
    for (const action of ACTIONS) entry[action] = [];
    guildTracker.set(userId, entry);
  }
  return guildTracker.get(userId);
}

function recordAction(guildId, userId, action) {
  const userTrack = getTrackedUser(guildId, userId);
  const now = Date.now();
  userTrack[action] = userTrack[action].filter((timestamp) => now - timestamp < WINDOW_MS);
  userTrack[action].push(now);
  return userTrack[action].length;
}

function resetTracker(guildId, userId) {
  const guildTracker = tracker.get(guildId);
  if (guildTracker) guildTracker.delete(userId);
}

async function fetchAuditExecutor(guild, type, targetId = null) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const logs = await guild.fetchAuditLogs({ type, limit: 5 });
    const entry = targetId
      ? logs.entries.find((item) => item.target?.id === targetId)
      : logs.entries.first();
    if (!entry || Date.now() - entry.createdTimestamp > 5000) return null;
    return entry.executor;
  } catch {
    return null;
  }
}

async function punishExecutor(guild, executor, action, reason) {
  try {
    if (!executor || executor.id === guild.ownerId || executor.id === guild.client.user.id) return false;
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (!member) return false;

    if (action === 'ban') {
      await guild.bans.create(executor.id, { reason }).catch(() => null);
    } else if (action === 'kick') {
      await member.kick(reason).catch(() => null);
    } else if (action === 'strip') {
      const removable = member.roles.cache.filter((role) => role.id !== guild.id && role.editable);
      if (removable.size) await member.roles.remove(removable, reason).catch(() => null);
    }

    resetTracker(guild.id, executor.id);
    return true;
  } catch (error) {
    console.error('[antiNuke] punishExecutor failed', error);
    return false;
  }
}

async function logAntiNuke(guild, executor, action, reason) {
  const channelId = db.getLogChannel(guild.id);
  if (!channelId) return;
  const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased?.() || !channel.send) return;

  const embed = new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle('🛡️ Anti-Nuke Triggered')
    .setDescription(`**${executor.tag}** (${executor.id}) was detected by anti-nuke protection.`)
    .addFields(
      { name: 'Action', value: `\`${action}\``, inline: true },
      { name: 'Reason', value: reason, inline: false }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

async function evaluateAction(guild, auditType, action, targetId = null) {
  try {
    const settings = db.getSettings(guild.id);
    if (!settings.antiNuke?.enabled) return;
    const executor = await fetchAuditExecutor(guild, auditType, targetId);
    if (!executor) return;
    if (executor.id === guild.ownerId || executor.id === guild.client.user.id) return;
    if (db.isAntiNukeWhitelisted(guild.id, executor.id)) return;

    const count = recordAction(guild.id, executor.id, action);
    const threshold = settings.antiNuke.thresholds?.[action] ?? 5;
    if (count < threshold) return;

    const reason = `Anti-Nuke threshold exceeded for ${action} (${count}/${threshold} in ${WINDOW_MS / 1000}s)`;
    const punished = await punishExecutor(guild, executor, settings.antiNuke.action, reason);
    if (punished) await logAntiNuke(guild, executor, settings.antiNuke.action, reason);
  } catch (error) {
    console.error('[antiNuke] evaluateAction failed', error);
  }
}

module.exports = {
  name: 'antiNuke',
  register(client) {
    client.on('channelDelete', async (channel) => {
      if (!channel.guild) return;
      await evaluateAction(channel.guild, AuditLogEvent.ChannelDelete, 'channelDelete', channel.id);
    });
    client.on('channelCreate', async (channel) => {
      if (!channel.guild) return;
      await evaluateAction(channel.guild, AuditLogEvent.ChannelCreate, 'channelCreate', channel.id);
    });
    client.on('roleDelete', async (role) => {
      if (!role.guild) return;
      await evaluateAction(role.guild, AuditLogEvent.RoleDelete, 'roleDelete', role.id);
    });
    client.on('roleCreate', async (role) => {
      if (!role.guild) return;
      await evaluateAction(role.guild, AuditLogEvent.RoleCreate, 'roleCreate', role.id);
    });
    client.on('guildBanAdd', async (ban) => {
      if (!ban.guild) return;
      await evaluateAction(ban.guild, AuditLogEvent.MemberBanAdd, 'ban', ban.user.id);
    });
    client.on('guildMemberRemove', async (member) => {
      if (!member.guild) return;
      await evaluateAction(member.guild, AuditLogEvent.MemberKick, 'kick', member.id);
    });
    client.on('webhookUpdate', async (channel) => {
      if (!channel.guild) return;
      await evaluateAction(channel.guild, AuditLogEvent.WebhookCreate, 'webhookCreate', channel.id);
    });
    console.log('[antiNuke] listeners registered.');
  }
};
