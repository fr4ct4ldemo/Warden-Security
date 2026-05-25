'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removebypass')
    .setDescription('Remove a user\'s verification bypass')
    .addUserOption(opt => opt.setName('user').setDescription('User to remove bypass from').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');

      await interaction.editReply({
        embeds: [successEmbed('✅ Bypass Removed', `Verification bypass removed from <@${user.id}>.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not remove bypass.')]
      });
    }
  }
};
