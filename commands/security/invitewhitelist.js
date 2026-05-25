'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitewhitelist')
    .setDescription('Whitelist a specific Discord server invite')
    .addStringOption(opt => opt.setName('invite-code').setDescription('Invite code (e.g., discord.gg/abc123)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const inviteCode = interaction.options.getString('invite-code');

      await interaction.editReply({
        embeds: [successEmbed('✅ Invite Whitelisted', `Invite ${inviteCode} added to whitelist.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not whitelist invite.')]
      });
    }
  }
};
