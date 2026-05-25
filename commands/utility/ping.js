'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Shows bot latency'),
  async execute(interaction, client) {
    try {
      const before = Date.now();
      await interaction.deferReply({ ephemeral: false });
      const latency = Date.now() - before;
      await interaction.editReply({ embeds: [successEmbed('Pong!', `Bot Latency: \`${latency}ms\`\nAPI Latency: \`${Math.round(client.ws.ping)}ms\``)] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
