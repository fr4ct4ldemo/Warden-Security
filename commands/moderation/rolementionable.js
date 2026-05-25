'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolementionable').setDescription('Toggle whether a role is mentionable by everyone')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
    .addBooleanOption(o => o.setName('enabled').setDescription('Mentionable or not').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageRoles']);
      if (!ok) return;
      const role = interaction.options.getRole('role', true);
      const enabled = interaction.options.getBoolean('enabled', true);
      await role.setMentionable(enabled);
      const embed = successEmbed('🔔 Role Mentionable Updated', `**${role.name}** is now ${enabled ? 'mentionable' : 'not mentionable'}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
