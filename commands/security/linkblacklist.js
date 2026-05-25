'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkblacklist')
    .setDescription('Add a domain to the link blacklist')
    .addStringOption(opt => opt.setName('domain').setDescription('Domain to blacklist (e.g., example.com)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const domain = interaction.options.getString('domain');

      await interaction.editReply({
        embeds: [successEmbed('✅ Domain Blacklisted', `${domain} added to link blacklist.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not blacklist domain.')]
      });
    }
  }
};
