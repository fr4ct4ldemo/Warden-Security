'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stickymute')
    .setDescription('Re-apply mute if a muted user rejoins the server')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      settings.stickyMute = { enabled };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('📌 Sticky Mute Enabled', 'Muted users will have their mute re-applied if they leave and rejoin.')
      : errorEmbed('Sticky Mute Disabled', 'Sticky mute has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
