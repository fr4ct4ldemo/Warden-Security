'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botroleaudit')
    .setDescription('Audit all roles assigned to bots'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const members = await interaction.guild.members.fetch();
      const bots = members.filter(m => m.user.bot);

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🤖 Bot Role Audit')
        .setDescription('Roles assigned to bot accounts')
        .addFields(
          { name: 'Total Bots', value: `${bots.size}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not audit bot roles.')]
      });
    }
  }
};
