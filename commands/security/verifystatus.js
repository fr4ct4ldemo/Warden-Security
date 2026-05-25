'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifystatus')
    .setDescription('Check verification status of a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('✔️ Verification Status')
        .setDescription(`Status for <@${user.id}>`)
        .addFields(
          { name: 'Verified', value: 'Unknown', inline: true },
          { name: 'Last Check', value: 'N/A', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not check verification status.')]
      });
    }
  }
};
