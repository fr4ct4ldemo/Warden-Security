'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkcooldown')
    .setDescription('Rate-limit how often a user can post links')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('seconds').setDescription('Cooldown in seconds between link posts (default 30)').setMinValue(5).setMaxValue(3600))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const seconds = interaction.options.getInteger('seconds') ?? 30;
      settings.linkCooldown = { enabled, seconds };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('⏱️ Link Cooldown Enabled', `Users must wait **${seconds}s** between posting links.`)
      : errorEmbed('Link Cooldown Disabled', 'Link cooldown has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
