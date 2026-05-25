'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban').setDescription('Ban then immediately unban to delete messages')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .addIntegerOption(o => o.setName('deletedays').setDescription('Days of messages to delete (1-7)').setMinValue(1).setMaxValue(7))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const days = interaction.options.getInteger('deletedays') ?? 7;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const ok = await checkPermissions(interaction, ['BanMembers'], member);
      if (!ok) return;
      await interaction.guild.members.ban(user.id, { deleteMessageSeconds: days * 86400, reason: `Softban: ${reason}` });
      await interaction.guild.members.unban(user.id, 'Softban unban');
      const embed = successEmbed('🧹 Softbanned', `**${user.tag}** was softbanned (messages deleted, then unbanned).\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
