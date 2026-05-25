'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('floodconfig')
    .setDescription('Configure flood detection settings')
    .addIntegerOption(opt => opt.setName('burst-size').setDescription('Messages to trigger flood').setRequired(true))
    .addIntegerOption(opt => opt.setName('burst-window').setDescription('Time window in seconds').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const burstSize = interaction.options.getInteger('burst-size');
      const burstWindow = interaction.options.getInteger('burst-window');

      await interaction.editReply({
        embeds: [successEmbed('✅ Flood Detection Configured', `${burstSize} messages in ${burstWindow}s triggers action.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure flood detection.')]
      });
    }
  }
};
