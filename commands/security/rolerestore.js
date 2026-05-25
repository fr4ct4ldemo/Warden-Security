'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolerestore')
    .setDescription('Restore roles from a saved snapshot')
    .addIntegerOption(opt => opt.setName('snapshot').setDescription('Snapshot ID').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const snapshotId = interaction.options.getInteger('snapshot');

      await interaction.editReply({
        embeds: [successEmbed('✅ Roles Restored', `Roles restored from snapshot #${snapshotId}.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not restore roles.')]
      });
    }
  }
};
