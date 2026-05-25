'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joinscan')
    .setDescription('Scan recent joins for suspicious patterns'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🔍 Join Pattern Scan')
        .setDescription('Analyzing recent join patterns...')
        .addFields(
          { name: 'Suspicious Patterns', value: '0', inline: true },
          { name: 'Scan Time', value: 'Complete', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not scan joins.')]
      });
    }
  }
};
