'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupdateschannel').setDescription('Set the community updates channel')
    .addChannelOption(o => o.setName('channel').setDescription('Updates channel').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      await interaction.guild.setPublicUpdatesChannel(channel);
      const embed = successEmbed('📢 Updates Channel Set', `${channel} is now the community updates channel.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
