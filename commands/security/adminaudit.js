'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adminaudit')
    .setDescription('Audit all users with admin-level permissions'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const members = await interaction.guild.members.fetch();
      const admins = members.filter(m => m.permissions.has('Administrator'));

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('👑 Admin Audit')
        .setDescription('Users with administrator permissions')
        .addFields(
          { name: 'Total Admins', value: `${admins.size}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not audit admins.')]
      });
    }
  }
};
