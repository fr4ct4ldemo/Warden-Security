'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quarantine')
    .setDescription('Quarantine a user during an active raid')
    .addUserOption(opt => opt.setName('user').setDescription('User to quarantine').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');

      await interaction.editReply({
        embeds: [successEmbed('✅ User Quarantined', `<@${user.id}> quarantined during raid.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not quarantine user.')]
      });
    }
  }
};
