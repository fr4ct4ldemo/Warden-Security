'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hackban').setDescription('Ban a user who is not in the server by ID')
    .addStringOption(o => o.setName('userid').setDescription('User ID to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const userId = interaction.options.getString('userid', true).trim();
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const ok = await checkPermissions(interaction, ['BanMembers']);
      if (!ok) return;
      try { await interaction.guild.members.ban(userId, { reason }); }
      catch { return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Could not ban. Invalid ID or insufficient permissions.')] }); }
      const embed = successEmbed('🚫 Hackban', `User \`${userId}\` was banned (not in server).\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
