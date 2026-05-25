'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Configure auto-raid detection')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable anti-raid').setRequired(true))
    .addIntegerOption(o => o.setName('threshold').setDescription('Max joins per 10s before lockdown (default 5)').setMinValue(2).setMaxValue(50)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const threshold = interaction.options.getInteger('threshold') ?? 5;
      const settings = db.getSettings(interaction.guild.id);
      settings.antiRaid = { enabled, threshold };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('🛡️ Anti-Raid Enabled', `Auto-raid protection is now **active**.\nLockdown triggers at **${threshold}** joins in 10 seconds.`)
        : errorEmbed('🛡️ Anti-Raid Disabled', 'Auto-raid protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
