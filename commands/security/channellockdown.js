'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('channellockdown')
    .setDescription('Lock or unlock a single channel for everyone')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock or unlock').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Lock or unlock').setRequired(true).addChoices({ name: 'Lock', value: 'lock' }, { name: 'Unlock', value: 'unlock' }))
    .addStringOption(o => o.setName('reason').setDescription('Reason for action'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel', true);
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const everyone = interaction.guild.roles.everyone;
      await channel.permissionOverwrites.edit(everyone, { SendMessages: action === 'lock' ? false : null }, { reason: `${action === 'lock' ? 'Lock' : 'Unlock'} by ${interaction.user.tag}: ${reason}` });
      const embed = successEmbed(action === 'lock' ? '🔒 Channel Locked' : '🔓 Channel Unlocked', `${channel} has been ${action === 'lock' ? 'locked' : 'unlocked'}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
