'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('floodgate')
    .setDescription('Auto-enable slowmode guild-wide when message flood is detected')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('threshold').setDescription('Messages per 5s across server to trigger (default 50)').setMinValue(10).setMaxValue(500))
    .addIntegerOption(o => o.setName('slowmode').setDescription('Slowmode seconds to apply when triggered (default 10)').setMinValue(1).setMaxValue(120))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const threshold = interaction.options.getInteger('threshold') ?? 50;
      const slowmode = interaction.options.getInteger('slowmode') ?? 10;
      settings.floodgate = { enabled, threshold, slowmode };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('🌊 Floodgate Enabled', `If **${threshold}** messages are sent server-wide within 5s, all channels will be set to **${slowmode}s** slowmode.`)
      : errorEmbed('Floodgate Disabled', 'Floodgate auto-slowmode has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
