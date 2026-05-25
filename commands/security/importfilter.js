'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('importfilter')
    .setDescription('Block messages containing external server invite patterns beyond /antiinvite')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addStringOption(o => o.setName('whitelist').setDescription('Comma-separated guild IDs to allow'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const raw = interaction.options.getString('whitelist') || '';
      const whitelist = raw ? raw.split(',').map(id => id.trim()).filter(Boolean) : [];
      settings.importFilter = { enabled, whitelist };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('🚫 Import Filter Enabled', `Cross-server invite patterns will be blocked.\n**Whitelisted guild IDs:** ${whitelist.length ? whitelist.join(', ') : 'None'}`)
      : errorEmbed('Import Filter Disabled', 'Import filter has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
