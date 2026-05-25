'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

const CHANNEL_TYPES = {
  0: 'Text', 2: 'Voice', 4: 'Category', 5: 'Announcement',
  10: 'Announcement Thread', 11: 'Public Thread', 12: 'Private Thread',
  13: 'Stage Voice', 15: 'Forum'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('View information about a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to inspect (defaults to current)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const createdAt = new Date(channel.createdTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const typeStr = CHANNEL_TYPES[channel.type] || `Type ${channel.type}`;
      const category = channel.parent ? channel.parent.name : 'None';
      const topic = channel.topic || 'None';
      const nsfw = channel.nsfw ? '✅ Yes' : '❌ No';
      const slowmode = channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'Off';
      const embed = successEmbed(`#${channel.name}`, `ID: ${channel.id}`, [
        { name: 'Type', value: typeStr, inline: true },
        { name: 'Category', value: category, inline: true },
        { name: 'Position', value: `${channel.position ?? 'N/A'}`, inline: true },
        { name: 'NSFW', value: nsfw, inline: true },
        { name: 'Slowmode', value: slowmode, inline: true },
        { name: 'Created At', value: createdAt, inline: true },
        { name: 'Topic', value: topic, inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
