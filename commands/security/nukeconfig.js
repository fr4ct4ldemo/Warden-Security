'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nukeconfig')
    .setDescription('Configure anti-nuke thresholds and punishments')
    .addIntegerOption(opt => opt.setName('role-delete-limit').setDescription('Role deletes allowed per minute').setRequired(true))
    .addIntegerOption(opt => opt.setName('channel-delete-limit').setDescription('Channel deletes allowed per minute').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const roleLimit = interaction.options.getInteger('role-delete-limit');
      const channelLimit = interaction.options.getInteger('channel-delete-limit');

      await interaction.editReply({
        embeds: [successEmbed('✅ Anti-Nuke Configured', `Role limit: ${roleLimit}/min, Channel limit: ${channelLimit}/min`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure anti-nuke.')]
      });
    }
  }
};
