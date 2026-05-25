'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channeltopic').setDescription('Set a channel\'s topic')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
    .addStringOption(o => o.setName('topic').setDescription('New topic (leave blank to clear)'))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const topic = interaction.options.getString('topic') ?? '';
      const reason = interaction.options.getString('reason') || 'No reason provided';
      await channel.setTopic(topic, reason);
      const embed = successEmbed('📝 Topic Updated', `${channel} topic set to: ${topic || '*(none)*'}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
