'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const { automodLog } = require('./automodLogger');

const map = new Map(); // key = guildId_userId -> timestamps[]

module.exports = async function antiSpamHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id;
    if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member;
    if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiSpam || !settings.antiSpam.enabled) return;
    const key = `${guildId}_${member.id}`;
    const now = Date.now();
    const arr = map.get(key) || [];
    const window = settings.antiSpam.interval || 5000;
    const limit = settings.antiSpam.limit || 5;
    // remove old
    const recent = arr.filter(t => t > now - window);
    recent.push(now);
    map.set(key, recent);
    if (recent.length > limit) {
      await message.delete().catch(()=>null);
      try { await member.timeout(60 * 1000, 'Auto anti-spam'); } catch {}
      const embed = errorEmbed('🚨 Auto Action — Anti-Spam', `${member.user.tag} was timed out for spamming.`);
      const ch = message.channel;
      ch.send({ embeds: [embed] }).then(m => setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
      automodLog(client, guildId, embed);
    }
  } catch (err) { console.error(err); }
};
