'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmodechannel')
    .setDescription('Set slowmode on a specific channel')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode delay in seconds (0 = off)').setRequired(true).setMinValue(0).setMaxValue(21600))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel', true);
      const seconds = interaction.options.getInteger('seconds', true);
      if (!channel.isTextBased || !channel.isTextBased()) {
      return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That is not a text-based channel.')] });
      }
      await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);
      const embed = seconds > 0
      ? successEmbed('🐌 Slowmode Set', `${channel} slowmode set to **${seconds}s**.`)
      : successEmbed('✅ Slowmode Removed', `Slowmode removed from ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
