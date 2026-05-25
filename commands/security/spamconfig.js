'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spamconfig')
    .setDescription('Configure antispam thresholds')
    .addIntegerOption(opt => opt.setName('messages').setDescription('Messages allowed per interval').setRequired(true))
    .addIntegerOption(opt => opt.setName('seconds').setDescription('Time interval in seconds').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const messages = interaction.options.getInteger('messages');
      const seconds = interaction.options.getInteger('seconds');

      await interaction.editReply({
        embeds: [successEmbed('✅ Antispam Configured', `${messages} messages per ${seconds}s allowed.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure antispam.')]
      });
    }
  }
};
