'use strict';
const db = require('./database');

async function logAction(client, guildId, embed) {
  try {
    const channelId = db.getLogChannel(guildId);
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.send) return;
    await channel.send({ embeds: [embed] }).catch(() => null);
  } catch (err) {
    console.error(err);
  }
}

module.exports = { logAction };
