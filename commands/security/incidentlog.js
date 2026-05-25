'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('incidentlog')
    .setDescription('Log a manual security incident')
    .addStringOption(opt => opt.setName('type').setDescription('Incident type').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Incident details').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const type = interaction.options.getString('type');
      const description = interaction.options.getString('description');

      await interaction.editReply({
        embeds: [successEmbed('✅ Incident Logged', `Security incident logged: **${type}**`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not log incident.')]
      });
    }
  }
};
