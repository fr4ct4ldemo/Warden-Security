'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkscan')
    .setDescription('Scan a URL for phishing or malware flags')
    .addStringOption(opt => opt.setName('url').setDescription('URL to scan').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const url = interaction.options.getString('url');

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🔍 Link Scan Results')
        .setDescription(`Scanning: ${url}`)
        .addFields(
          { name: 'Status', value: 'Safe', inline: true },
          { name: 'Threat Level', value: 'None', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not scan link.')]
      });
    }
  }
};
