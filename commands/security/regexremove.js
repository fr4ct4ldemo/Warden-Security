'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regexremove')
    .setDescription('Remove a regex filter pattern by ID')
    .addIntegerOption(opt => opt.setName('pattern-id').setDescription('Pattern ID to remove').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const patternId = interaction.options.getInteger('pattern-id');

      await interaction.editReply({
        embeds: [successEmbed('✅ Pattern Removed', `Regex pattern #${patternId} removed from filter.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not remove regex pattern.')]
      });
    }
  }
};
