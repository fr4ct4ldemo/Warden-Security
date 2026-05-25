'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist').setDescription('View the server ban list (first 20)')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const ok = await checkPermissions(interaction, ['BanMembers']);
      if (!ok) return;
      const bans = await interaction.guild.bans.fetch();
      if (!bans.size) return interaction.editReply({ embeds: [successEmbed('📋 Ban List', 'No users are currently banned.')] });
      const list = bans.first(20).map((b, i) => `${i + 1}. **${b.user.tag}** (\`${b.user.id}\`) — ${b.reason || 'No reason'}`).join('\n');
      return interaction.editReply({ embeds: [successEmbed(`📋 Ban List (${bans.size} total)`, list.slice(0, 4000))] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
