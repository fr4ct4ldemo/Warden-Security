'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('nukeprotection')
    .setDescription('Enable or disable basic nuke protection settings')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable nuke protection').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Action when nuke activity is detected').setRequired(true).addChoices({ name: 'Ban', value: 'ban' }, { name: 'Kick', value: 'kick' }, { name: 'Alert', value: 'alert' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const action = interaction.options.getString('action', true);
      const settings = db.getSettings(guildId);
      settings.nukeProtection = { enabled, action };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🚨 Nuke Protection Updated', enabled ? `Auto action set to **${action}**.` : 'Nuke protection disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
