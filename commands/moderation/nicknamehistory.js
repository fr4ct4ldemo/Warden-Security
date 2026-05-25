'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('nicknamehistory')
    .setDescription('Show recent nickname changes for a user')
    .addUserOption(o => o.setName('user').setDescription('User to inspect nickname history'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user') || interaction.user;
      const logs = await interaction.guild.fetchAuditLogs({ limit: 50 });
      const changes = Array.from(logs.entries.values())
        .filter(entry => entry.targetId === user.id && entry.changes?.some(change => change.key === 'nick'))
        .map(entry => {
          const change = entry.changes.find(c => c.key === 'nick');
          return `**${entry.executor?.tag ?? 'Unknown'}** — ${change.old ?? 'None'} → ${change.new ?? 'None'} (<t:${Math.floor(entry.createdTimestamp / 1000)}:f>)`;
        });
      if (!changes.length) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'No nickname history found for that user.')] });
      const embed = successEmbed(`📝 Nickname History — ${user.tag}`, changes.join(`\n`).slice(0, 4000));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
