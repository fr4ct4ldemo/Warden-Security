'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reason')
    .setDescription('Update the reason for a warning case')
    .addIntegerOption(o => o.setName('case_number').setDescription('Case number').setRequired(true))
    .addStringOption(o => o.setName('new_reason').setDescription('Updated reason').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const caseNumber = interaction.options.getInteger('case_number', true);
      const newReason = interaction.options.getString('new_reason', true);
      const warning = db.getWarningById(interaction.guild.id, caseNumber);
      if (!warning) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Case Not Found', `No warning was found for case **${caseNumber}**.`)] });
      }
      db.updateWarningReason(interaction.guild.id, caseNumber, newReason);
      const timestamp = new Date(warning.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const embed = successEmbed(`✏️ Case Updated`, `Updated reason for case **${caseNumber}**.`, [
        { name: 'User', value: `<@${warning.user_id}>`, inline: true },
        { name: 'Moderator', value: warning.moderator_tag, inline: true },
        { name: 'Timestamp', value: timestamp, inline: true },
        { name: 'New Reason', value: newReason, inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
