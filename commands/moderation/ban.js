'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban').setDescription('Ban a user from the server')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .addIntegerOption(o => o.setName('deletedays').setDescription('Delete message history (0-7 days)').setMinValue(0).setMaxValue(7))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const days = interaction.options.getInteger('deletedays') ?? 0;
      if (user.id === client.user.id) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Cannot ban the bot.')] });
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const ok = await checkPermissions(interaction, ['BanMembers'], member);
      if (!ok) return;
      await interaction.guild.members.ban(user.id, { deleteMessageSeconds: days * 86400, reason });
      const embed = successEmbed('🚫 Banned', `**${user.tag}** was banned.\nReason: ${reason}`, [
      { name: 'User ID', value: user.id, inline: true },
      { name: 'Moderator', value: interaction.user.tag, inline: true },
      { name: 'Delete Days', value: `${days}`, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
