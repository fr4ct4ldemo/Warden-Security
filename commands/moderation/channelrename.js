'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelrename').setDescription('Rename a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to rename').setRequired(true))
    .addStringOption(o => o.setName('name').setDescription('New name').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const name = interaction.options.getString('name', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const old = channel.name;
      await channel.setName(name, reason);
      const embed = successEmbed('✏️ Channel Renamed', `**#${old}** → **#${name}**\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
