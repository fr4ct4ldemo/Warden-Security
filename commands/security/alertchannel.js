'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alertchannel')
    .setDescription('Set a dedicated security alert channel')
    .addChannelOption(opt => opt.setName('channel').setDescription('Alert channel').setRequired(true).addChannelTypes(ChannelType.GuildText)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channel = interaction.options.getChannel('channel');

      await interaction.editReply({
        embeds: [successEmbed('✅ Alert Channel Set', `Security alerts will be sent to <#${channel.id}>.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not set alert channel.')]
      });
    }
  }
};
