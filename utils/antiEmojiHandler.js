'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const { automodLog } = require('./automodLogger');

module.exports = async function antiEmojiHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id; if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member; if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiEmoji || !settings.antiEmoji.enabled) return;
    const content = message.content || '';
    const custom = (content.match(/<a?:\w+:\d+>/g) || []).length;
    const unicode = Array.from(content).filter(ch => /\p{Emoji}/u.test(ch)).length;
    const total = custom + unicode;
    if (total > (settings.antiEmoji.limit || 10)) {
      await message.delete().catch(()=>null);
      db.addWarning(guildId, member.id, `Too many emoji (${total})`, 'AutoMod');
      const embed = errorEmbed('🚨 Auto Action — Emoji Flood', `${member.user.tag} message removed for emoji flood.`);
      message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
      automodLog(client, guildId, embed);
    }
  } catch (err) { console.error(err); }
};
