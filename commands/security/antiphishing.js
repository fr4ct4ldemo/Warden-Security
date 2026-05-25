'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiphishing')
    .setDescription('Configure anti-phishing/scam link detection')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const settings = db.getSettings(interaction.guild.id);
      settings.antiPhishing = { enabled };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('🎣 Anti-Phishing Enabled', 'Detects and removes known phishing/scam links instantly. Offenders are timed out for 10 minutes.')
        : errorEmbed('Anti-Phishing Disabled', 'Anti-phishing protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
