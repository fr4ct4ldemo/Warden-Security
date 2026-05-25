'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channeldelete').setDescription('Delete a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to delete').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const name = channel.name;
      await channel.delete(reason);
      const embed = successEmbed('🗑️ Channel Deleted', `**#${name}** was deleted.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
