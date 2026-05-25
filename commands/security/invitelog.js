'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitelog')
    .setDescription('View the anti-invite action log'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('📋 Anti-Invite Log')
        .setDescription('Recent anti-invite detections')
        .addFields(
          { name: 'Total Actions', value: '0', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve invite log.')]
      });
    }
  }
};
