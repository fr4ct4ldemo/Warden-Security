'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemove').setDescription('Move a member to a different voice channel')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Destination voice channel').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const channel = interaction.options.getChannel('channel', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member?.voice?.channel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'User is not in a voice channel.')] });
      const ok = await checkPermissions(interaction, ['MoveMembers'], member);
      if (!ok) return;
      await member.voice.setChannel(channel, reason);
      const embed = successEmbed('🔀 Member Moved', `**${user.tag}** moved to **${channel.name}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
