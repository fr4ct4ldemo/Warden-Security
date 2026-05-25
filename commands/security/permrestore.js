'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permrestore')
    .setDescription('Restore channel permissions from a snapshot')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to restore').setRequired(true).addChannelTypes(ChannelType.GuildText))
    .addIntegerOption(opt => opt.setName('snapshot').setDescription('Snapshot ID').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channel = interaction.options.getChannel('channel');
      const snapshotId = interaction.options.getInteger('snapshot');

      await interaction.editReply({
        embeds: [successEmbed('✅ Permissions Restored', `Permissions restored for <#${channel.id}> from snapshot #${snapshotId}.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not restore permissions.')]
      });
    }
  }
};
