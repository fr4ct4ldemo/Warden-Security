'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidlog')
    .setDescription('View the raid detection action log'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('📋 Raid Detection Log')
        .setDescription('Recent raid alerts')
        .addFields(
          { name: 'Total Raids Detected', value: '0', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve raid log.')]
      });
    }
  }
};
