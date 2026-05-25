'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the current channel')
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0 to disable, max 21600)').setRequired(true).setMinValue(0).setMaxValue(21600)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const seconds = interaction.options.getInteger('seconds', true);
      await interaction.channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);
      const embed = successEmbed(
        seconds === 0 ? '✅ Slowmode Disabled' : '🐌 Slowmode Set',
        seconds === 0 ? `Slowmode disabled in ${interaction.channel}.` : `Slowmode set to **${seconds}s** in ${interaction.channel}.`,
        [{ name: 'Moderator', value: interaction.user.tag, inline: true }]
      );
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
