'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('trustedroles')
    .setDescription('Add or remove a trusted role for security bypass checks')
    .addRoleOption(o => o.setName('role').setDescription('Trusted role to manage').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true).addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const role = interaction.options.getRole('role', true);
      const action = interaction.options.getString('action', true);
      const settings = db.getSettings(guildId);
      settings.trustedRoles = settings.trustedRoles || [];
      if (action === 'add') {
        if (!settings.trustedRoles.includes(role.id)) settings.trustedRoles.push(role.id);
      } else {
        settings.trustedRoles = settings.trustedRoles.filter(id => id !== role.id);
      }
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🛡️ Trusted Roles Updated', `Role **${role.name}** was ${action === 'add' ? 'added to' : 'removed from'} trusted roles.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
