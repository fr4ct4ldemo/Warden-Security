'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemembers').setDescription('List all members with a specific role')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const role = interaction.options.getRole('role', true);
      const members = await interaction.guild.members.fetch();
      const withRole = members.filter(m => m.roles.cache.has(role.id));
      if (!withRole.size) return interaction.editReply({ embeds: [errorEmbed('❌ No Members', `No members have the **${role.name}** role.`)] });
      const list = withRole.first(30).map(m => `${m.user.tag} (\`${m.id}\`)`).join('\n');
      const embed = successEmbed(`👥 Members with ${role.name} (${withRole.size})`, list.slice(0, 4000));
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
