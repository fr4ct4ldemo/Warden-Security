'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Show how long the bot has been online'),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ms = client.uptime ?? 0;
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / 1000 / 60) % 60);
      const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
      const days = Math.floor(ms / 1000 / 60 / 60 / 24);
      const uptime = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
      const embed = successEmbed('⏱️ Uptime', `The bot has been online for **${uptime}**.`);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
