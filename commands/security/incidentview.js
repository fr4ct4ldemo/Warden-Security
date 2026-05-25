'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('incidentview')
    .setDescription('View a logged security incident by ID')
    .addIntegerOption(opt => opt.setName('id').setDescription('Incident ID').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const id = interaction.options.getInteger('id');

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('📝 Incident Details')
        .setDescription(`Incident #${id}`)
        .addFields(
          { name: 'Type', value: 'Unknown', inline: true },
          { name: 'Date', value: 'N/A', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve incident.')]
      });
    }
  }
};
