'use strict';
const { successEmbed } = require('../utils/embedBuilder');
const db = require('../utils/database');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      console.log(`✅ Online as ${client.user.tag} in ${client.guilds.cache.size} servers`);
      client.user.setActivity(`${client.guilds.cache.reduce((a,g)=>a+g.memberCount,0)} members across ${client.guilds.cache.size} servers`, { type: 3 });
    } catch (err) { console.error(err); }
  }
};
