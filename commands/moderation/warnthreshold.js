'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnthreshold')
    .setDescription('Configure auto punishment for warning thresholds')
    .addIntegerOption(o => o.setName('count').setDescription('Warning count threshold').setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName('punishment').setDescription('Punishment to apply').setRequired(true).addChoices({ name: 'Mute', value: 'mute' }, { name: 'Kick', value: 'kick' }, { name: 'Ban', value: 'ban' }, { name: 'None', value: 'none' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const count = interaction.options.getInteger('count', true);
      const punishment = interaction.options.getString('punishment', true);
      db.setWarnPunishment(guildId, count, punishment);
      const embed = successEmbed('⚙️ Warn Threshold Updated', `Set warning threshold **${count}** to apply **${punishment}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
