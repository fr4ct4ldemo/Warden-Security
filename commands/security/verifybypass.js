'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifybypass')
    .setDescription('Grant a user a verification bypass')
    .addUserOption(opt => opt.setName('user').setDescription('User to bypass').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for bypass').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      await interaction.editReply({
        embeds: [successEmbed('✅ Bypass Granted', `<@${user.id}> can bypass verification.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not grant bypass.')]
      });
    }
  }
};
