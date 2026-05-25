'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolecleanup')
    .setDescription('Remove a role from all members who currently have it')
    .addRoleOption(o => o.setName('role').setDescription('Role to remove from all members').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const role = interaction.options.getRole('role', true);
      const members = await interaction.guild.members.fetch();
      let count = 0;
      for (const [, member] of members.filter(m => m.roles.cache.has(role.id))) {
        try {
          await member.roles.remove(role, 'Role cleanup executed');
          count++;
        } catch {}
      }
      const embed = successEmbed('🧹 Role Cleanup Complete', `Removed **${role.name}** from **${count}** member(s).`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
