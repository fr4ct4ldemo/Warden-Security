'use strict';
module.exports = {
  name: 'guildDelete',
  once: false,
  async execute(guild, client) {
    try {
      console.log(`Left guild: ${guild.name} (${guild.id}) — Total guilds: ${client.guilds.cache.size}`);
    } catch (err) { console.error(err); }
  }
};
