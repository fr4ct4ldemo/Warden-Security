'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('caseview')
    .setDescription('View a specific moderation case by warning case ID')
    .addIntegerOption(o => o.setName('caseid').setDescription('Warning case ID').setRequired(true).setMinValue(1))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const caseId = interaction.options.getInteger('caseid', true);
      const entry = db.getWarningById(guildId, caseId);
      if (!entry) return interaction.editReply({ embeds: [errorEmbed('❌ Error', `Case #${caseId} was not found.`)] });
      const embed = successEmbed(`📁 Case #${caseId}`, entry.reason, [
        { name: 'User ID', value: entry.user_id, inline: true },
        { name: 'Moderator', value: entry.moderator_tag, inline: true },
        { name: 'Timestamp', value: `<t:${Math.floor(entry.timestamp / 1000)}:f>`, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
