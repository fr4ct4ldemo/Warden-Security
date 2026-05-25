'use strict';
const { errorEmbed } = require('./embedBuilder');
const db = require('./database');
const { automodLog } = require('./automodLogger');

module.exports = async function antiMentionHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id; if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member; if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiMentions || !settings.antiMentions.enabled) return;
    const mentionCount = (message.mentions.users.size || 0) + (message.mentions.roles.size || 0);
    if (mentionCount > (settings.antiMentions.limit || 5)) {
      await message.delete().catch(()=>null);
      db.addWarning(guildId, member.id, `Mass mentions (${mentionCount})`, 'AutoMod');
      try { await member.timeout(2 * 60 * 1000, 'Anti-mentions'); } catch {}
      const embed = errorEmbed('🚨 Auto Action — Mass Mentions', `${member.user.tag} was timed out for excessive mentions.`);
      message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
      automodLog(client, guildId, embed);
      return;
    }
    if (settings.antiMassMention && settings.antiMassMention.enabled && message.mentions.everyone && !member.permissions.has('MentionEveryone')) {
      await message.delete().catch(()=>null);
      try { await member.timeout(5 * 60 * 1000, 'Mass mention'); } catch {}
      const embed = errorEmbed('🚨 Auto Action — Mass Everyone Mention', `${member.user.tag} used @everyone without permission.`);
      message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
      automodLog(client, guildId, embed);
      return;
    }
  } catch (err) { console.error(err); }
};
