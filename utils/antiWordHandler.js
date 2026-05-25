'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const { automodLog } = require('./automodLogger');

module.exports = async function antiWordHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id; if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member; if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiWord || !settings.antiWord.enabled) return;
    const content = (message.content || '').toLowerCase();
    const blacklist = (db.getBlacklist(guildId, 'word') || []).map(w=>w.toLowerCase());
    const merged = new Set([...(settings.antiWord.words || []).map(w=>w.toLowerCase()), ...blacklist]);
    for (const word of merged) {
      if (!word) continue;
      if (content.includes(word)) {
        await message.delete().catch(()=>null);
        db.addWarning(guildId, member.id, `Blacklisted word: ${word}`, 'AutoMod');
        const embed = errorEmbed('🚨 Auto Action — Blacklisted Word', `${member.user.tag} used a blacklisted word: **${word}**.`);
        message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
        automodLog(client, guildId, embed);
        return;
      }
    }
  } catch (err) { console.error(err); }
};
