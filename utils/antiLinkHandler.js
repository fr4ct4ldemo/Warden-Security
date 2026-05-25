'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const url = require('url');
const { automodLog } = require('./automodLogger');

const linkRegex = /https?:\/\/[\S]+/gi;

module.exports = async function antiLinkHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id; if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member; if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiLink || !settings.antiLink.enabled) return;
    const content = message.content || '';
    const matches = content.match(linkRegex);
    if (!matches) return;
    for (const m of matches) {
      let domain;
      try { domain = (new URL(m)).hostname.replace(/^www\./,'').toLowerCase(); } catch { continue; }
      // blacklisted domain check
      if (db.isBlacklisted(guildId, 'link', domain)) {
        await message.delete().catch(()=>null);
        db.addWarning(guildId, member.id, `Posted blacklisted link: ${domain}`, 'AutoMod');
        const embed = errorEmbed('🚨 Auto Action — Blacklisted Link', `${member.user.tag} posted a blacklisted link and was warned.`);
        message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
        automodLog(client, guildId, embed);
        return;
      }
      // whitelist check
      const wl = settings.antiLink.whitelist || [];
      const channelWl = db.getWhitelist(guildId, 'channel') || [];
      if (wl.includes(domain) || channelWl.includes(message.channel.id)) continue;
      // otherwise unauthorized
      await message.delete().catch(()=>null);
      db.addWarning(guildId, member.id, `Posted unauthorized link: ${domain}`, 'AutoMod');
      const embed = errorEmbed('🚨 Auto Action — Links', `${member.user.tag} posted an unauthorized link and was warned.`);
      message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
      automodLog(client, guildId, embed);
      return;
    }
  } catch (err) { console.error(err); }
};
