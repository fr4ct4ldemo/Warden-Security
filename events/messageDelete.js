'use strict';
const snipeStore = require('../utils/snipeStore');
const { errorEmbed } = require('../utils/embedBuilder');
const db = require('../utils/database');
const { logAction } = require('../utils/logger');

module.exports = {
  name: 'messageDelete',
  once: false,
  async execute(message, client) {
    try {
      if (message.author?.bot) return;
      const channelId = message.channel?.id;
      const data = {
        content: message.content ?? '[Message not cached]',
        authorTag: message.author?.tag ?? 'Unknown',
        authorId: message.author?.id ?? 'Unknown',
        timestamp: Date.now()
      };
      if (channelId) snipeStore.set(channelId, data);
      if (!message.guild) return;
      const embed = errorEmbed('🗑️ Message Deleted', `Author: ${data.authorTag}\nChannel: <#${channelId}>\nContent: ${data.content}`);
      await logAction(client, message.guild.id, embed);
    } catch (err) { console.error(err); }
  }
};
