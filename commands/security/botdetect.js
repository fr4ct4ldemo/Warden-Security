'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botdetect')
    .setDescription('Scan for unverified or suspicious bots'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🤖 Bot Detection Scan')
        .setDescription('Scanning for suspicious bots...')
        .addFields(
          { name: 'Unverified Bots', value: '0', inline: true },
          { name: 'Suspicious Bots', value: '0', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not scan for bots.')]
      });
    }
  }
};
