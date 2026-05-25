'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetconfig')
    .setDescription('Reset all automod settings to defaults for this server'),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['Administrator']);
      if (!ok) return;
      const config = require('../../config.json');
      db.saveSettings(interaction.guild.id, JSON.parse(JSON.stringify(config.automodDefaults)));
      const embed = successEmbed('🔄 Settings Reset', 'All automod settings have been reset to their defaults.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
