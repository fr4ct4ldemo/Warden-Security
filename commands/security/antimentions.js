'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antimentions')
    .setDescription('Limit user/role mentions per message')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addIntegerOption(o => o.setName('limit').setDescription('Max mentions per message (default 5)').setMinValue(1).setMaxValue(50)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const limit = interaction.options.getInteger('limit') ?? 5;
      const settings = db.getSettings(interaction.guild.id);
      settings.antiMentions = { enabled, limit };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('📢 Anti-Mentions Enabled', `Messages with more than **${limit}** mentions will be deleted.`)
        : errorEmbed('Anti-Mentions Disabled', 'Anti-mention protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
