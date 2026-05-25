'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo').setDescription('Show detailed info about a role')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const role = interaction.options.getRole('role', true);
      const members = await interaction.guild.members.fetch();
      const count = members.filter(m => m.roles.cache.has(role.id)).size;
      const embed = successEmbed(`ℹ️ Role: ${role.name}`, `<@&${role.id}>`, [
      { name: 'ID', value: role.id, inline: true },
      { name: 'Color', value: role.hexColor, inline: true },
      { name: 'Members', value: `${count}`, inline: true },
      { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
      { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
      { name: 'Position', value: `${role.position}`, inline: true },
      { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
      ]);
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
