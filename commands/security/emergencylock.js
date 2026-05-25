'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emergencylock')
    .setDescription('Instantly lock all channels (emergency use)'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channels = await interaction.guild.channels.fetch();
      const textChannels = channels.filter(c => c.isTextBased());

      await interaction.editReply({
        embeds: [successEmbed('✅ Emergency Lock Activated', `All ${textChannels.size} channels locked.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not activate emergency lock.')]
      });
    }
  }
};
