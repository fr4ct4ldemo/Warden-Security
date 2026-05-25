'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massunban').setDescription('Unban all banned users from the server')
    .addStringOption(o => o.setName('confirm').setDescription('Type CONFIRM to proceed').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const confirm = interaction.options.getString('confirm', true);
      if (confirm !== 'CONFIRM') return interaction.editReply({ embeds: [errorEmbed('❌ Aborted', 'You must type CONFIRM to proceed.')] });
      const ok = await checkPermissions(interaction, ['BanMembers']);
      if (!ok) return;
      const bans = await interaction.guild.bans.fetch();
      let success = 0;
      for (const [id] of bans) { try { await interaction.guild.members.unban(id, 'Mass unban'); success++; } catch {} }
      const embed = successEmbed('✅ Mass Unban', `Unbanned **${success}** user(s).`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
