'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display a user\'s full-size avatar')
    .addUserOption(o => o.setName('user').setDescription('User (defaults to you)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user') || interaction.user;
      const avatarURL = user.displayAvatarURL({ size: 4096, extension: user.avatar?.startsWith('a_') ? 'gif' : 'png' });
      const embed = successEmbed(`🖼️ ${user.tag}'s Avatar`, ' ', [
        { name: 'Avatar URL', value: `[Click to open](${avatarURL})`, inline: false }
      ]);
      embed.setImage(avatarURL);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
