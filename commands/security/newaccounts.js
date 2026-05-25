'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newaccounts')
    .setDescription('List accounts that joined in the last 24h'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const members = await interaction.guild.members.fetch();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const newAccounts = members.filter(m => m.joinedTimestamp > oneDayAgo);

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🆕 New Accounts (24h)')
        .setDescription('Members who joined in the last 24 hours')
        .addFields(
          { name: 'Total', value: `${newAccounts.size}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve new accounts.')]
      });
    }
  }
};
