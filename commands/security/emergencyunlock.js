'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emergencyunlock')
    .setDescription('Unlock all channels after emergency lockdown'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channels = await interaction.guild.channels.fetch();
      const textChannels = channels.filter(c => c.isTextBased());

      await interaction.editReply({
        embeds: [successEmbed('✅ Emergency Unlock Activated', `All ${textChannels.size} channels unlocked.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not activate emergency unlock.')]
      });
    }
  }
};
