'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newaccountfilter')
    .setDescription('Kick or flag accounts newer than a minimum age')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('minage').setDescription('Minimum account age in days (default 7)').setMinValue(1).setMaxValue(365))
    .addStringOption(o => o.setName('action').setDescription('Action to take')
    .addChoices({ name: 'Kick', value: 'kick' }, { name: 'Ban', value: 'ban' }, { name: 'Flag (log only)', value: 'flag' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const minAge = interaction.options.getInteger('minage') ?? 7;
      const action = interaction.options.getString('action') ?? 'kick';
      settings.newAccountFilter = { enabled, minAge, action };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('🆕 New Account Filter Enabled', `Accounts newer than **${minAge} day(s)** will be **${action}**ed on join.`)
      : errorEmbed('New Account Filter Disabled', 'New account filter has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
