'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewwatchlist').setDescription('View all users currently on the watchlist')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ModerateMembers']);
      if (!ok) return;
      const list = db.getWatchlist ? db.getWatchlist(guildId) : [];
      if (!list.length) return interaction.editReply({ embeds: [successEmbed('👁️ Watchlist', 'No users are currently on the watchlist.')] });
      const display = list.map(w => `<@${w.userId}> — ${w.reason || 'No reason'}`).join('\n').slice(0, 4000);
      return interaction.editReply({ embeds: [successEmbed(`👁️ Watchlist (${list.length})`, display)] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
