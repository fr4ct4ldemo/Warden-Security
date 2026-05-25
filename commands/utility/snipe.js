'use strict';
const { SlashCommandBuilder } = require('discord.js');
const snipeStore = require('../../utils/snipeStore');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder().setName('snipe').setDescription('Show last deleted message in a channel').addChannelOption(o=>o.setName('channel').setDescription('Channel to snipe')),
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const data = snipeStore.get(channel.id);
      if (!data) return interaction.editReply({ embeds: [errorEmbed('❌ Nothing to snipe', 'No recent deleted message in that channel.')] });
      const embed = successEmbed('🪄 Sniped Message', `Author: ${data.authorTag}\nContent: ${data.content}\nDeleted: ${new Date(data.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) { console.error(err); await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] }); }
  }
};
