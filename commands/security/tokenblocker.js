'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tokenblocker')
    .setDescription('Block messages that look like bot tokens or API keys')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      settings.tokenBlocker = { enabled };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('🔑 Token Blocker Enabled', 'Messages containing bot tokens or API key patterns will be auto-deleted.')
      : errorEmbed('Token Blocker Disabled', 'Token blocker has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
