'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Configure anti-link detection')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addStringOption(o => o.setName('whitelist').setDescription('Comma-separated allowed domains e.g. youtube.com,twitch.tv')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const whitelistRaw = interaction.options.getString('whitelist') || '';
      const whitelist = whitelistRaw ? whitelistRaw.split(',').map(d => d.trim().toLowerCase()).filter(Boolean) : [];
      const settings = db.getSettings(interaction.guild.id);
      settings.antiLink = { enabled, whitelist };
      db.saveSettings(interaction.guild.id, settings);
      const embed = enabled
        ? successEmbed('🔗 Anti-Link Enabled', `Unauthorized links will be deleted.\n**Allowed domains:** ${whitelist.length ? whitelist.join(', ') : 'None'}`)
        : errorEmbed('Anti-Link Disabled', 'Anti-link protection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
