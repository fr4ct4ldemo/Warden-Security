'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('contentfilter')
    .setDescription('Configure word/phrase content filtering')
    .addStringOption(opt => opt.setName('action').setDescription('Add or remove').setRequired(true).addChoices(
      { name: 'Add', value: 'add' },
      { name: 'Remove', value: 'remove' }
    ))
    .addStringOption(opt => opt.setName('word').setDescription('Word or phrase to filter').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const action = interaction.options.getString('action');
      const word = interaction.options.getString('word');

      await interaction.editReply({
        embeds: [successEmbed('✅ Filter Updated', `"${word}" ${action === 'add' ? 'added to' : 'removed from'} content filter.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not update content filter.')]
      });
    }
  }
};
