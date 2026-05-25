'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Enable or disable all automod modules at once')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable all automod').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const modules = ['antiSpam', 'antiLink', 'antiInvite', 'antiCaps', 'antiEmoji', 'antiMentions', 'antiWord', 'antiZalgo', 'antiPhishing', 'antiAlt'];
      for (const mod of modules) {
      if (settings[mod]) settings[mod].enabled = enabled;
      else settings[mod] = { enabled };
      }
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('✅ All Automod Enabled', 'All automod modules have been **enabled**.')
      : errorEmbed('⛔ All Automod Disabled', 'All automod modules have been **disabled**.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
