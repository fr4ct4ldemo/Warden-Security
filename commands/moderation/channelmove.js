'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelmove').setDescription('Move a channel to a different category')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to move').setRequired(true))
    .addChannelOption(o => o.setName('category').setDescription('Destination category').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const category = interaction.options.getChannel('category', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      await channel.setParent(category.id, { lockPermissions: false, reason });
      const embed = successEmbed('📦 Channel Moved', `${channel} moved to **${category.name}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
