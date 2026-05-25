'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelclone')
    .setDescription('Clone a channel (nukes messages while keeping topic & perms)')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to clone').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel', true);
      const reason = interaction.options.getString('reason') || `Cloned by ${interaction.user.tag}`;
      const cloned = await channel.clone({ reason });
      await cloned.setPosition(channel.position + 1).catch(() => null);
      await channel.delete(reason).catch(() => null);
      const embed = successEmbed('📋 Channel Cloned', `**#${channel.name}** was cloned (messages purged, permissions kept).\nNew channel: ${cloned}\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
