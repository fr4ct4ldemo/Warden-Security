'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('suspiciouslink')
    .setDescription('Configure suspicious link reporting behavior')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable suspicious link reporter').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Action for suspicious links').setRequired(true).addChoices({ name: 'Delete', value: 'delete' }, { name: 'Flag', value: 'flag' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const action = interaction.options.getString('action', true);
      const settings = db.getSettings(guildId);
      settings.suspiciousLink = { enabled, action };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🔗 Suspicious Link Updated', enabled ? `Reporter set to **${action}**.` : 'Suspicious link reporting disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
