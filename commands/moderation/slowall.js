'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowall').setDescription('Set slowmode on all text channels at once')
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const seconds = interaction.options.getInteger('seconds', true);
      let count = 0;
      for (const [, ch] of interaction.guild.channels.cache.filter(c => c.isTextBased && c.isTextBased())) {
      try { await ch.setRateLimitPerUser(seconds); count++; } catch {}
      }
      const embed = successEmbed('🐌 Slowmode Applied', `Set **${seconds}s** slowmode on **${count}** text channel(s).`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
