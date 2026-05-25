'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('auditlog')
    .setDescription('View recent guild audit log entries')
    .addIntegerOption(o => o.setName('limit').setDescription('How many entries to show').setMinValue(1).setMaxValue(25))
    .addUserOption(o => o.setName('user').setDescription('Filter audit log by user'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const limit = interaction.options.getInteger('limit') ?? 10;
      const target = interaction.options.getUser('user');
      const logs = await interaction.guild.fetchAuditLogs({ limit });
      const entries = Array.from(logs.entries.values())
        .filter(entry => !target || entry.targetId === target.id)
        .slice(0, limit)
        .map((entry, index) => {
          const targetText = entry.target ? ` — ${entry.target}` : ``;
          const executor = entry.executor ? entry.executor.tag : `Unknown`;
          return `**${index + 1}.** ${entry.action}${targetText} — ${executor}`;
        });
      const text = entries.length ? entries.join(`\n`) : `No audit log entries found.`;
      const embed = successEmbed(`🧾 Audit Log`, text.slice(0, 4000));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
