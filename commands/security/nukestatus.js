'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nukestatus')
    .setDescription('View current anti-nuke configuration'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('💣 Anti-Nuke Status')
        .setDescription('Current anti-nuke configuration')
        .addFields(
          { name: 'Status', value: 'Enabled', inline: true },
          { name: 'Role Delete Limit', value: '5/min', inline: true },
          { name: 'Channel Delete Limit', value: '3/min', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve anti-nuke status.')]
      });
    }
  }
};
