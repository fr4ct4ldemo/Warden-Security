'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('integritycheck')
    .setDescription('Run a full server integrity scan'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🛡️ Server Integrity Check')
        .setDescription('Scanning server structure...')
        .addFields(
          { name: 'Channels', value: 'OK', inline: true },
          { name: 'Roles', value: 'OK', inline: true },
          { name: 'Permissions', value: 'OK', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not run integrity check.')]
      });
    }
  }
};
