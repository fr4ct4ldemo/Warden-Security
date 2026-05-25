'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forceban').setDescription('Force-ban even if user is not in server')
    .addStringOption(o => o.setName('userid').setDescription('User ID').setRequired(true))
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
      catch { return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Could not force-ban this user.')] }); }
      const embed = successEmbed('🔨 Force Banned', `User \`${userId}\` was force-banned.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
