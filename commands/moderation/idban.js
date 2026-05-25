'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('idban').setDescription('Ban multiple user IDs from a file-like list')
    .addStringOption(o => o.setName('userids').setDescription('Comma or space separated IDs').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['BanMembers']);
      if (!ok) return;
      const ids = interaction.options.getString('userids', true).split(/[\s,]+/).filter(Boolean);
      const reason = interaction.options.getString('reason') || 'ID ban';
      let success = 0, fail = 0;
      for (const id of ids) { try { await interaction.guild.members.ban(id, { reason }); success++; } catch { fail++; } }
      const embed = successEmbed('🚫 ID Ban', `Banned **${success}** / Failed **${fail}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
