'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mentionspam')
    .setDescription('Punish users who mass-mention others in one message')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('limit').setDescription('Max unique mentions allowed (default 5)').setMinValue(2).setMaxValue(50))
    .addStringOption(o => o.setName('action').setDescription('Action to take')
    .addChoices({ name: 'Delete', value: 'delete' }, { name: 'Mute', value: 'mute' }, { name: 'Kick', value: 'kick' }, { name: 'Ban', value: 'ban' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const limit = interaction.options.getInteger('limit') ?? 5;
      const action = interaction.options.getString('action') ?? 'delete';
      settings.mentionSpam = { enabled, limit, action };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('📢 Mention Spam Filter Enabled', `Messages with **>${limit}** unique mentions will trigger **${action}**.`)
      : errorEmbed('Mention Spam Disabled', 'Mention spam filter has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
