'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('dmjoin')
    .setDescription('Configure welcome direct messages for new members')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable join DM').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Welcome DM message'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const message = interaction.options.getString('message') || '';
      const settings = db.getSettings(guildId);
      settings.joinDM = { enabled, message };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('📩 Join DM Updated', enabled ? 'New members will receive a DM on join.' : 'Join DMs have been disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
