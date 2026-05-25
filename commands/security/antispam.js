'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Configure anti-spam detection')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('limit').setDescription('Max messages before action (default 5)').setMinValue(2).setMaxValue(30))
    .addIntegerOption(o => o.setName('interval').setDescription('Time window in milliseconds (default 5000)').setMinValue(1000).setMaxValue(30000)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const limit = interaction.options.getInteger('limit') ?? 5;
      const interval = interaction.options.getInteger('interval') ?? 5000;
      const settings = db.getSettings(interaction.guild.id);
      settings.antiSpam = { enabled, limit, interval };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('🛡️ Anti-Spam Enabled', `Triggers at **${limit}** messages within **${interval}ms**.`)
        : errorEmbed('Anti-Spam Disabled', 'Anti-spam has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
