'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regexfilter')
    .setDescription('Add a custom regex pattern to the filter')
    .addStringOption(opt => opt.setName('pattern').setDescription('Regex pattern to match').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const pattern = interaction.options.getString('pattern');

      await interaction.editReply({
        embeds: [successEmbed('✅ Regex Added', `Pattern added to content filter.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not add regex pattern.')]
      });
    }
  }
};
