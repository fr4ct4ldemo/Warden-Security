'use strict';
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel so @everyone cannot send messages')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock (defaults to current)'))
    .addStringOption(o => o.setName('reason').setDescription('Reason for locking')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const everyone = interaction.guild.roles.everyone;
      await channel.permissionOverwrites.edit(everyone, { SendMessages: false }, { reason: `Locked by ${interaction.user.tag}: ${reason}` });
      const embed = errorEmbed('🔒 Channel Locked', `${channel} has been locked.`, [
        { name: 'Reason', value: reason, inline: false },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
