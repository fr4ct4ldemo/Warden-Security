'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionspam')
    .setDescription('Limit reaction spam per message')
    .addIntegerOption(opt => opt.setName('max-reactions').setDescription('Max different reactions per message').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const maxReactions = interaction.options.getInteger('max-reactions');

      await interaction.editReply({
        embeds: [successEmbed('✅ Reaction Spam Configured', `Max ${maxReactions} different reactions per message allowed.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure reaction spam limits.')]
      });
    }
  }
};
