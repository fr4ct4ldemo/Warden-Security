'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('pinmessage')
    .setDescription('Pin a message by ID in a channel')
    .addStringOption(o => o.setName('messageid').setDescription('Message ID to pin').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel containing the message'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const messageId = interaction.options.getString('messageid', true);
      if (!channel?.isTextBased?.()) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel cannot contain messages.')] });
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Message not found.')] });
      await message.pin();
      const embed = successEmbed('📌 Message Pinned', `Message **${message.id}** in ${channel} was pinned.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
