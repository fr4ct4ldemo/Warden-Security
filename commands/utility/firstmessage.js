'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('firstmessage')
    .setDescription('Show the first message in a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to inspect')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      if (!channel || !channel.messages) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Channel does not support message fetching.')] });
      }
      const messages = await channel.messages.fetch({ limit: 1, after: '0' });
      const message = messages.first();
      if (!message) {
        return interaction.editReply({ embeds: [errorEmbed('❌ No Messages', 'No messages were found in that channel.')] });
      }
      const content = message.content ? (message.content.length > 200 ? `${message.content.slice(0, 197)}...` : message.content) : '[Embed/Attachment]';
      const timestamp = new Date(message.createdTimestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const embed = successEmbed('📨 First Message', `First message in ${channel.toString()}.`, [
        { name: 'Author', value: message.author.tag, inline: true },
        { name: 'Timestamp', value: timestamp, inline: true },
        { name: 'Jump Link', value: message.url, inline: false },
        { name: 'Content', value: content, inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
