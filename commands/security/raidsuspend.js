'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidsuspend')
    .setDescription('Suspend server invites during an active raid'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await interaction.editReply({
        embeds: [successEmbed('✅ Invites Suspended', `Server invites suspended until raid ends.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not suspend invites.')]
      });
    }
  }
};
