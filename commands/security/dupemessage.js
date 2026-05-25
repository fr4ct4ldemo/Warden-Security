'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dupemessage')
    .setDescription('Delete repeated identical messages from the same user')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('limit').setDescription('How many dupes before action (default 3)').setMinValue(2).setMaxValue(20))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const limit = interaction.options.getInteger('limit') ?? 3;
      settings.dupMessage = { enabled, limit };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('📋 Duplicate Message Filter Enabled', `Repeated identical messages will be deleted after **${limit}** occurrences.`)
      : errorEmbed('Duplicate Filter Disabled', 'Duplicate message filter has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
