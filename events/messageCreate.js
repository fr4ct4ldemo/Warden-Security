'use strict';
const db = require('../utils/database');
const antiSpam = require('../utils/antiSpamHandler');
const antiLink = require('../utils/antiLinkHandler');
const antiPhishing = require('../utils/antiPhishingHandler');
const antiMention = require('../utils/antiMentionHandler');
const antiCaps = require('../utils/antiCapsHandler');
const antiEmoji = require('../utils/antiEmojiHandler');
const antiWord = require('../utils/antiWordHandler');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    try {
      if (message.author?.bot) return;
      const guildId = message.guild?.id; if (!guildId) return;
      if (db.isChannelIgnored(guildId, message.channel.id)) return;

      // Ping response
      if (message.mentions.users.has(client.user.id) && !message.mentions.everyone) {
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
          .setColor(0x2C2F6B)
          .setAuthor({ name: 'Warden', iconURL: client.user.displayAvatarURL({ size: 128, extension: 'png' }) })
          .setDescription(`👋 Hello ${message.author}!\nUse **/help** to explore everything I can do.`)
          .setFooter({ text: 'Warden Security' })
          .setTimestamp();
        await message.reply({ embeds: [embed] });
        return;
      }
      // Run handlers in sequence
      await antiSpam(message, client);
      await antiLink(message, client);
      await antiPhishing(message, client);
      await antiMention(message, client);
      await antiCaps(message, client);
      await antiEmoji(message, client);
      await antiWord(message, client);
    } catch (err) { console.error(err); }
  }
};
