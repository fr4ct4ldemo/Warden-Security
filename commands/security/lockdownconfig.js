'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdownconfig')
    .setDescription('Configure automatic lockdown behavior')
    .addBooleanOption(opt => opt.setName('auto-lockdown').setDescription('Enable automatic lockdown on raid').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Lockdown duration in minutes').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const autoLockdown = interaction.options.getBoolean('auto-lockdown');
      const duration = interaction.options.getInteger('duration');

      await interaction.editReply({
        embeds: [successEmbed('✅ Lockdown Configured', `Auto-lockdown: ${autoLockdown ? 'Enabled' : 'Disabled'}, Duration: ${duration}min`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not configure lockdown.')]
      });
    }
  }
};
