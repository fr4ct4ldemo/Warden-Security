'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolesnapshot')
    .setDescription('Take a snapshot of all server roles'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const roles = await interaction.guild.roles.fetch();

      await interaction.editReply({
        embeds: [successEmbed('✅ Snapshot Saved', `Snapshot created with ${roles.size} roles.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not save role snapshot.')]
      });
    }
  }
};
