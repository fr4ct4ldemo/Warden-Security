'use strict';
const { errorEmbed } = require('./embedBuilder');
const { automodLog } = require('./automodLogger');
const db = require('./database');

const phishingDomains = [
  'discord-nitro.com','discordgift.com','discord-gifts.com','discordapp.gift','discordnitro.com','discord-gift.com',
  'discordgift.xyz','discorduser.com','discordverify.com','nitro-discord.com','free-nitro.com','nitro-gift.com',
  'discord-gift.net','discordnitro.gifts','discord-promotions.com','discordgiftcard.com','discordlogin.com','dlscord.com',
  'steamcommunity.gifts','steamgift.net','steam-gifts.com','free-steam.com','csgo-skins-free.com','csgo-gifts.com',
  'nitro-claim.com','nitro-box.com','discord-nitro.claim','discord.gift','discord.gifts','discord-official.gift','discordclaim.com',
  'discordverify.gift','discordpromo.com','discord-prizes.com','discordreward.com','discord-rewards.com','discordfree.com',
  'free-discord-nitro.com','discord-auth.com','discord-security.com','account-discord.com','discord-verify.com','discord-login.net',
  'discordappx.com','discordapp.gifts','discordcx.com','discord-server.gift','discordlogin.xyz','gift-discord.com'
];

module.exports = async function antiPhishingHandler(message, client) {
  try {
    if (message.author.bot) return;
    const guildId = message.guild?.id; if (!guildId) return;
    if (db.isChannelIgnored(guildId, message.channel.id)) return;
    const member = message.member; if (!member) return;
    if (require('./permissionCheck').isWhitelisted(guildId, member.id, member.roles.cache.map(r=>r.id))) return;
    const settings = db.getSettings(guildId);
    if (!settings.antiPhishing || !settings.antiPhishing.enabled) return;
    const content = (message.content || '').toLowerCase();
    for (const d of phishingDomains) {
      if (content.includes(d)) {
        await message.delete().catch(()=>null);
        try { await member.timeout(10 * 60 * 1000, 'Anti-phishing detected'); } catch {}
        const embed = errorEmbed('🚨 Anti-Phishing — Removed', `${member.user.tag} posted a phishing link and was timed out.`);
        message.channel.send({ embeds: [embed] }).then(m=>setTimeout(()=>m.delete().catch(()=>null),5000)).catch(()=>null);
        automodLog(client, guildId, embed);
        return;
      }
    }
  } catch (err) { console.error(err); }
};
