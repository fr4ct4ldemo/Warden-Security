'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send a server announcement to a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for announcement').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const message = interaction.options.getString('message', true);
      if (!channel.isTextBased()) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel does not support messages.')] });
      await channel.send({ content: message });
      const embed = successEmbed('📣 Announcement Sent', `Announcement posted in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
