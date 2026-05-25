'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imagespam')
    .setDescription('Configure image/attachment spam limits')
    .addIntegerOption(opt => opt.setName('max-per-minute').setDescription('Max images per minute').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const maxPerMin = interaction.options.getInteger('max-per-minute');

      await interaction.editReply({
        embeds: [successEmbed('✅ Image Spam Configured', `Max ${maxPerMin} images per minute allowed.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure image spam limits.')]
      });
    }
  }
};
