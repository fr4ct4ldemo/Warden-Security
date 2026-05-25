'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flaguser')
    .setDescription('Manually flag a user as suspicious')
    .addUserOption(opt => opt.setName('user').setDescription('User to flag').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for flagging').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      await interaction.editReply({
        embeds: [successEmbed('✅ User Flagged', `<@${user.id}> flagged as suspicious.\n**Reason:** ${reason}`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not flag user.')]
      });
    }
  }
};
