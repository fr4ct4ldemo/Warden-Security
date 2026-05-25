'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const { automodLog } = require('./automodLogger');

const joins = new Map(); // guildId -> { count, resetAt }

module.exports = function antiRaidHandler(member, client) {
  try {
    const guildId = member.guild.id;
    if (!guildId) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiRaid || !settings.antiRaid.enabled) return;
    const threshold = settings.antiRaid.threshold || 5;
    const now = Date.now();
    const state = joins.get(guildId) || { count: 0, resetAt: now + 10000 };
    if (now > state.resetAt) { state.count = 0; state.resetAt = now + 10000; }
    state.count++;
    joins.set(guildId, state);
    if (state.count >= threshold) {
      // lock all text channels
      member.guild.channels.cache.filter(c=>c.isTextBased()).forEach(ch => {
        try { ch.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: false }).catch(()=>null); } catch {}
      });
      db.setRaidMode(guildId, true);
      const embed = errorEmbed('🚨 Anti-Raid Activated', `Raid threshold exceeded. Locked text channels.`);
      automodLog(client, guildId, embed);
      // schedule restore after 5 minutes
      setTimeout(async ()=>{
        try {
          db.setRaidMode(guildId, false);
          member.guild.channels.cache.filter(c=>c.isTextBased()).forEach(ch => {
            try { ch.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: null }).catch(()=>null); } catch {}
          });
          const embed2 = require('./embedBuilder').successEmbed('✅ Raid Mode Ended', `Channels restored after anti-raid.`);
          const logger = require('./logger');
          await logger.logAction(client, guildId, embed2);
        } catch (err) { console.error(err); }
      }, 5 * 60 * 1000);
    }
    // If raid mode is active, kick new member
    if (db.getRaidMode(guildId)) {
      member.kick('Raid mode active').catch(()=>null);
    }
  } catch (err) { console.error(err); }
};
