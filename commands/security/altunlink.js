'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('altunlink')
    .setDescription('Remove an alt link between two accounts')
    .addUserOption(opt => opt.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption(opt => opt.setName('user2').setDescription('Second user').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user1 = interaction.options.getUser('user1');
      const user2 = interaction.options.getUser('user2');

      await interaction.editReply({
        embeds: [successEmbed('✅ Alt Link Removed', `Alt link removed between <@${user1.id}> and <@${user2.id}>.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not remove alt link.')]
      });
    }
  }
};
