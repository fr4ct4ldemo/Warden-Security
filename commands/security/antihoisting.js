'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antihoisting')
    .setDescription('Strip hoisting characters (!, @, etc.) from usernames on join')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      settings.antiHoisting = { enabled };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('🔤 Anti-Hoisting Enabled', 'Usernames starting with `!`, `@`, `.`, `,`, `_` etc. will be auto-renamed on join.')
      : errorEmbed('Anti-Hoisting Disabled', 'Anti-hoisting has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
