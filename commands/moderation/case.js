'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View a warning case by ID')
    .addIntegerOption(o => o.setName('number').setDescription('Case number').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const caseId = interaction.options.getInteger('number', true);
      const warning = db.getWarningById(interaction.guild.id, caseId);
      if (!warning) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Case Not Found', `No warning was found for case **${caseId}**.`)] });
      }
      const timestamp = new Date(warning.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const embed = successEmbed(`📄 Case #${warning.id}`, `User: <@${warning.user_id}>`, [
        { name: 'Reason', value: warning.reason, inline: false },
        { name: 'Moderator', value: warning.moderator_tag, inline: true },
        { name: 'Timestamp', value: timestamp, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
