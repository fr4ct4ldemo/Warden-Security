'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Show total member, human, and bot counts'),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const guild = interaction.guild;
      const total = guild.memberCount;
      const humans = guild.members.cache.filter(m => !m.user.bot).size;
      const bots = guild.members.cache.filter(m => m.user.bot).size;
      const embed = successEmbed('👥 Member Count', 'Current server membership totals.', [
        { name: 'Total', value: `${total}`, inline: true },
        { name: 'Humans', value: `${humans}`, inline: true },
        { name: 'Bots', value: `${bots}`, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
