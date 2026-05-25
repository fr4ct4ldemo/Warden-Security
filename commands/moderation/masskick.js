'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('masskick').setDescription('Kick multiple members by role')
    .addRoleOption(o => o.setName('role').setDescription('Role to mass-kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['KickMembers']);
      if (!ok) return;
      const role = interaction.options.getRole('role', true);
      const reason = interaction.options.getString('reason') || 'Mass kick';
      const members = await interaction.guild.members.fetch();
      const targets = members.filter(m => m.roles.cache.has(role.id) && m.kickable);
      let success = 0;
      for (const [, m] of targets) { try { await m.kick(reason); success++; } catch {} }
      const embed = successEmbed('👢 Mass Kick Complete', `Kicked **${success}** member(s) with role **${role.name}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
