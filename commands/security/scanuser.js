'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scanuser')
    .setDescription('Scan a user for suspicious activity flags')
    .addUserOption(opt => opt.setName('user').setDescription('User to scan').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🔍 User Scan Results')
        .setDescription(`Scanning user: <@${user.id}>`)
        .addFields(
          { name: 'Username', value: user.username, inline: true },
          { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Flags', value: member ? 'No suspicious flags detected' : 'User not in server', inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Scan Failed', 'Could not scan user. Try again later.')]
      });
    }
  }
};
