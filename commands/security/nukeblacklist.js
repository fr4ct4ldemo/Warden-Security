'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nukeblacklist')
    .setDescription('Force-add a user to the nuke blacklist')
    .addUserOption(opt => opt.setName('user').setDescription('User to blacklist').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for blacklist').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      await interaction.editReply({
        embeds: [successEmbed('✅ Blacklisted', `<@${user.id}> blacklisted from nuke protection.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not blacklist user.')]
      });
    }
  }
};
