'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unbanmatch').setDescription('Unban all users whose ban reason matches a keyword')
    .addStringOption(o => o.setName('keyword').setDescription('Keyword to match in ban reason').setRequired(true))
    .addStringOption(o => o.setName('confirm').setDescription('Type CONFIRM to proceed').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const keyword = interaction.options.getString('keyword', true).toLowerCase();
      const confirm = interaction.options.getString('confirm', true);
      if (confirm !== 'CONFIRM') return interaction.editReply({ embeds: [errorEmbed('❌ Aborted', 'You must type CONFIRM to proceed.')] });
      const ok = await checkPermissions(interaction, ['BanMembers', 'Administrator']);
      if (!ok) return;
      const bans = await interaction.guild.bans.fetch();
      const matched = bans.filter(b => (b.reason ?? '').toLowerCase().includes(keyword));
      let count = 0;
      for (const [id] of matched) { try { await interaction.guild.members.unban(id, `Unban match: ${keyword}`); count++; } catch {} }
      const embed = successEmbed('✅ Unban Match', `Unbanned **${count}** user(s) whose ban reason contained \`${keyword}\`.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
