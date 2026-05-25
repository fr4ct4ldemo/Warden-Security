'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recentbans').setDescription('Show the most recent bans in this server')
    .addIntegerOption(o => o.setName('limit').setDescription('How many to show (default 10, max 25)').setMinValue(1).setMaxValue(25))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const ok = await checkPermissions(interaction, ['BanMembers']);
      if (!ok) return;
      const limit = interaction.options.getInteger('limit') ?? 10;
      const bans = await interaction.guild.bans.fetch({ limit });
      if (!bans.size) return interaction.editReply({ embeds: [successEmbed('📋 Recent Bans', 'No bans found.')] });
      const list = bans.map((b, i) => `**${b.user.tag}** (\`${b.user.id}\`) — ${b.reason ?? 'No reason'}`).join('\n').slice(0, 4000);
      return interaction.editReply({ embeds: [successEmbed(`📋 Recent Bans (${bans.size})`, list)] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
