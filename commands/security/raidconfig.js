'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidconfig')
    .setDescription('Configure raid detection thresholds')
    .addIntegerOption(opt => opt.setName('members-per-minute').setDescription('Members/min to trigger raid').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('How long to monitor (seconds)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const rate = interaction.options.getInteger('members-per-minute');
      const duration = interaction.options.getInteger('duration');

      await interaction.editReply({
        embeds: [successEmbed('✅ Raid Detection Configured', `Alert if ${rate}+ members join per minute within ${duration}s.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure raid detection.')]
      });
    }
  }
};
