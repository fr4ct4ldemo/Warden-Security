'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massban').setDescription('Ban multiple users by ID (space-separated)')
    .addStringOption(o => o.setName('userids').setDescription('Space-separated user IDs').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['BanMembers']);
      if (!ok) return;
      const ids = interaction.options.getString('userids', true).split(/[\s,]+/).filter(Boolean);
      const reason = interaction.options.getString('reason') || 'Mass ban';
      let success = 0, fail = 0;
      for (const id of ids) {
      try { await interaction.guild.members.ban(id, { reason }); success++; } catch { fail++; }
      }
      const embed = successEmbed('🔨 Mass Ban Complete', `Banned **${success}** user(s). Failed: **${fail}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
