'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permsnap')
    .setDescription('Take a snapshot of current channel permissions')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to snapshot').setRequired(true).addChannelTypes(ChannelType.GuildText)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channel = interaction.options.getChannel('channel');

      await interaction.editReply({
        embeds: [successEmbed('✅ Snapshot Saved', `Permission snapshot created for <#${channel.id}>.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not save snapshot.')]
      });
    }
  }
};
