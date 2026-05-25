'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiemoji')
    .setDescription('Limit excessive emoji usage in messages')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('limit').setDescription('Max emoji per message (default 10)').setMinValue(1).setMaxValue(50)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const limit = interaction.options.getInteger('limit') ?? 10;
      const settings = db.getSettings(interaction.guild.id);
      settings.antiEmoji = { enabled, limit };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('😂 Anti-Emoji Enabled', `Messages with more than **${limit}** emoji will be deleted.`)
        : errorEmbed('Anti-Emoji Disabled', 'Anti-emoji protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
