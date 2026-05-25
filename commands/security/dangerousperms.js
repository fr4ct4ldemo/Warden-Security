'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dangerousperms')
    .setDescription('List all roles with dangerous permissions'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const roles = await interaction.guild.roles.fetch();
      const dangerousPerms = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'BanMembers', 'KickMembers'];
      const dangerous = roles.filter(r => dangerousPerms.some(p => r.permissions.has(p)));

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('⚠️ Dangerous Permissions')
        .setDescription('Roles with elevated permissions')
        .addFields(
          { name: 'At-Risk Roles', value: dangerous.size > 0 ? dangerous.first().name : 'None', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not scan permissions.')]
      });
    }
  }
};
