'use strict';
const db = require('./database');
const ms = require('ms');
const { successEmbed, errorEmbed } = require('./embedBuilder');

function formatDate(ts) { return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function startScheduler(client) {
  setInterval(async () => {
    try {
      const expiredBans = db.getExpiredTempBans();
      for (const row of expiredBans) {
        try {
          const guild = await client.guilds.fetch(row.guild_id).catch(() => null);
          if (!guild) { db.removeTempBan(row.guild_id, row.user_id); continue; }
          await guild.members.unban(row.user_id, 'Temporary ban expired').catch(() => null);
          db.removeTempBan(row.guild_id, row.user_id);
          const embed = successEmbed('✅ Temp Ban Lifted', `User <@${row.user_id}> was unbanned (temporary ban expired).`, [{ name: 'User ID', value: row.user_id }]);
          const logger = require('./logger');
          await logger.logAction(client, row.guild_id, embed);
        } catch (err) { console.error(err); }
      }

      const expiredMutes = db.getExpiredTempMutes();
      for (const row of expiredMutes) {
        try {
          const guild = await client.guilds.fetch(row.guild_id).catch(() => null);
          if (!guild) { db.removeTempMute(row.guild_id, row.user_id); continue; }
          const roleId = db.getMutedRole(row.guild_id);
          if (roleId) {
            const member = await guild.members.fetch(row.user_id).catch(() => null);
            if (member && member.roles.cache.has(roleId)) await member.roles.remove(roleId, 'Temporary mute expired').catch(() => null);
          }
          db.removeTempMute(row.guild_id, row.user_id);
          const embed = successEmbed('✅ Temp Mute Lifted', `User <@${row.user_id}> was unmuted (temporary mute expired).`, [{ name: 'User ID', value: row.user_id }]);
          const logger = require('./logger');
          await logger.logAction(client, row.guild_id, embed);
        } catch (err) { console.error(err); }
      }
    } catch (err) { console.error(err); }
  }, 30 * 1000);
}

module.exports = { startScheduler };
