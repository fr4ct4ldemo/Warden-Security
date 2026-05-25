'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channellist').setDescription('List all channels and their types in the server')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const channels = interaction.guild.channels.cache
      .filter(c => c.type !== ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position);
      const list = channels.map(c => `${c} — \`${ChannelType[c.type]}\``).join('\n').slice(0, 4000);
      const embed = successEmbed(`📋 Channels (${channels.size})`, list || 'No channels.');
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
