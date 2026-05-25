'use strict';
const { successEmbed } = require('../utils/embedBuilder');
const { logAction } = require('../utils/logger');

module.exports = {
  name: 'guildBanRemove',
  once: false,
  async execute(gbr, client) {
    try {
      const guild = gbr.guild;
      const user = gbr.user;
      const audit = await guild.fetchAuditLogs({ limit: 1, type: 23 }).catch(()=>null);
      const entry = audit?.entries?.first();
      const mod = entry?.executor?.tag || 'Unknown';
      const embed = successEmbed('✅ User Unbanned', `${user.tag} (${user.id}) was unbanned.\nModerator: ${mod}`);
      await logAction(client, guild.id, embed);
    } catch (err) { console.error(err); }
  }
};
