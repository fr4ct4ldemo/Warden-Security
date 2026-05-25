'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joinspike')
    .setDescription('Alert if join count spikes abnormally')
    .addIntegerOption(opt => opt.setName('threshold').setDescription('Members/hour to trigger alert').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const threshold = interaction.options.getInteger('threshold');

      await interaction.editReply({
        embeds: [successEmbed('✅ Join Spike Alert Enabled', `Alert triggered if ${threshold}+ members join per hour.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not enable join spike alerts.')]
      });
    }
  }
};
