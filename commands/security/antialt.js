'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antialt')
    .setDescription('Kick accounts newer than a minimum age')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('minage').setDescription('Minimum account age in days (default 7)').setMinValue(1).setMaxValue(365)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const minAge = interaction.options.getInteger('minage') ?? 7;
      const settings = db.getSettings(interaction.guild.id);
      settings.antiAlt = { enabled, minAge };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('🔞 Anti-Alt Enabled', `Accounts younger than **${minAge} days** will be kicked on join.`)
        : errorEmbed('Anti-Alt Disabled', 'Anti-alt protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
