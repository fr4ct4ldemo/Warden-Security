'use strict';
const { successEmbed } = require('../utils/embedBuilder');
const db = require('../utils/database');

module.exports = {
  name: 'guildCreate',
  once: false,
  async execute(guild, client) {
    try {
      const settings = db.getSettings(guild.id);
      // if no row exists, save defaults
      db.saveSettings(guild.id, settings);
      console.log(`Joined guild: ${guild.name} (${guild.id}) — Total guilds: ${client.guilds.cache.size}`);
      const sys = guild.systemChannel;
      if (sys && sys.send) {
        const embed = successEmbed('👋 Thanks for adding Warden Security!', 'Use /help to get started and /setlog to configure logging.');
        sys.send({ embeds: [embed] }).catch(()=>null);
      }
    } catch (err) { console.error(err); }
  }
};
