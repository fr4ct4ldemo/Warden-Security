'use strict';
const { successEmbed } = require('../utils/embedBuilder');
const db = require('../utils/database');
const { logAction } = require('../utils/logger');

const joinMap = new Map(); // userId -> joinTimestamp per guild

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState, client) {
    try {
      const guild = newState.guild || oldState.guild;
      if (!guild) return;
      const gid = guild.id;
      const userId = newState.member?.id || oldState.member?.id;
      if (!userId) return;
      // join
      if (!oldState.channel && newState.channel) {
        joinMap.set(`${gid}_${userId}`, Date.now());
        const embed = successEmbed('🔊 Voice Join', `${newState.member.user.tag} joined ${newState.channel.name}`);
        await logAction(client, gid, embed);
        if (db.isVoiceBanned(gid, userId)) {
          try { await newState.disconnect(); } catch {}
        }
      }
      // leave
      else if (oldState.channel && !newState.channel) {
        const ts = joinMap.get(`${gid}_${userId}`) || oldState.channelId ? Date.now() : Date.now();
        const duration = ts ? Math.floor((Date.now() - ts)/1000) : 0;
        joinMap.delete(`${gid}_${userId}`);
        const embed = successEmbed('🔈 Voice Leave', `${oldState.member.user.tag} left ${oldState.channel.name} — Duration: ${duration}s`);
        await logAction(client, gid, embed);
      }
      // move
      else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) {
        const embed = successEmbed('🔀 Voice Move', `${newState.member.user.tag} moved from ${oldState.channel.name} to ${newState.channel.name}`);
        await logAction(client, gid, embed);
      }
    } catch (err) { console.error(err); }
  }
};
