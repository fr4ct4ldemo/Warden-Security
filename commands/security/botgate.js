'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('botgate')
    .setDescription('Require a role assignment for new bots or users to pass gate checks')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable bot gate').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role assigned when gate passes'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const role = interaction.options.getRole('role');
      const settings = db.getSettings(guildId);
      if (enabled && !role) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'A gate role must be provided when enabling bot gate.')] });
      settings.botGate = { enabled, roleId: role?.id ?? settings.botGate?.roleId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🤖 Bot Gate Updated', enabled ? `Gate role set to **${role.name}**.` : 'Bot gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
