'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('joinreaction')
    .setDescription('Configure a reaction-based join gate')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable join reaction gate').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel containing the gate message'))
    .addStringOption(o => o.setName('messageid').setDescription('Message ID used for reaction gate'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const messageId = interaction.options.getString('messageid');
      const settings = db.getSettings(guildId);
      if (enabled && !channel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'A channel is required when enabling join reaction gate.')] });
      settings.joinReactionGate = { enabled, channelId: channel?.id ?? settings.joinReactionGate?.channelId, messageId: messageId ?? settings.joinReactionGate?.messageId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('✅ Join Reaction Updated', enabled ? `Join reaction gate configured for ${channel}.` : 'Join reaction gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
