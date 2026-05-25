'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('agecheck')
    .setDescription('Check if a user meets account age requirements')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');
      const createdDaysAgo = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('📅 Account Age Check')
        .setDescription(`Checking <@${user.id}>`)
        .addFields(
          { name: 'Account Age', value: `${createdDaysAgo} days old`, inline: true },
          { name: 'Meets Requirements', value: createdDaysAgo >= 7 ? '✅ Yes' : '❌ No', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not check account age.')]
      });
    }
  }
};
