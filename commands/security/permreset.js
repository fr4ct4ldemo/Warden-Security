'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permreset')
    .setDescription('Reset channel permissions to default')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to reset').setRequired(true).addChannelTypes(ChannelType.GuildText)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channel = interaction.options.getChannel('channel');

      await interaction.editReply({
        embeds: [successEmbed('✅ Permissions Reset', `Permissions reset for <#${channel.id}> to defaults.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not reset permissions.')]
      });
    }
  }
};
