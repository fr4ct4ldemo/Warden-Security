'use strict';
const { errorEmbed } = require('../utils/embedBuilder');
const { logAction } = require('../utils/logger');

module.exports = {
  name: 'guildBanAdd',
  once: false,
  async execute(gan, client) {
    try {
      const guild = gan.guild;
      const user = gan.user;
      const audit = await guild.fetchAuditLogs({ limit: 1, type: 22 }).catch(()=>null);
      const entry = audit?.entries?.first();
      const mod = entry?.executor?.tag || 'Unknown';
      const reason = entry?.reason || 'No reason';
      const embed = errorEmbed('🚫 User Banned', `${user.tag} (${user.id}) was banned.\nModerator: ${mod}\nReason: ${reason}`);
      await logAction(client, guild.id, embed);
    } catch (err) { console.error(err); }
  }
};
