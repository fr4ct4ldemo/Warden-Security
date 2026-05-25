'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anticaps')
    .setDescription('Delete messages with excessive capital letters')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('percent').setDescription('Caps % threshold (default 70)').setMinValue(10).setMaxValue(100))
    .addIntegerOption(o => o.setName('minlength').setDescription('Min message length to check (default 10)').setMinValue(1).setMaxValue(200)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const percent = interaction.options.getInteger('percent') ?? 70;
      const minLength = interaction.options.getInteger('minlength') ?? 10;
      const settings = db.getSettings(interaction.guild.id);
      settings.antiCaps = { enabled, percent, minLength };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('🔠 Anti-Caps Enabled', `Messages >${minLength} chars with >${percent}% caps will be deleted.`)
        : errorEmbed('Anti-Caps Disabled', 'Anti-caps protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
