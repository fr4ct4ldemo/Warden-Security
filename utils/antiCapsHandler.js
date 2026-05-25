'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const { automodLog } = require('./automodLogger');

module.exports = async function antiCapsHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id; if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member; if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiCaps || !settings.antiCaps.enabled) return;
    const content = message.content || '';
    if (content.length < (settings.antiCaps.minLength || 10)) return;
    const letters = content.replace(/[^A-Za-z]/g, '');
    if (!letters.length) return;
    const caps = letters.split('').filter(c=>c === c.toUpperCase()).length;
    const percent = (caps / letters.length) * 100;
    if (percent >= (settings.antiCaps.percent || 70)) {
      await message.delete().catch(()=>null);
      db.addWarning(guildId, member.id, 'Excessive caps', 'AutoMod');
      const embed = errorEmbed('🚨 Auto Action — Caps', `${member.user.tag} message removed due to excessive capitalization.`);
      message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
      automodLog(client, guildId, embed);
    }
  } catch (err) { console.error(err); }
};
