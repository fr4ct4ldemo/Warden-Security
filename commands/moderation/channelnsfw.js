'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelnsfw').setDescription('Toggle NSFW flag on a text channel')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable NSFW').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const enabled = interaction.options.getBoolean('enabled', true);
      await channel.setNSFW(enabled);
      const embed = successEmbed(`🔞 NSFW ${enabled ? 'Enabled' : 'Disabled'}`, `${channel} NSFW flag is now **${enabled ? 'on' : 'off'}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
