'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Manage the automod whitelist (users, roles, channels, links)')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
      .addChoices(
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' },
        { name: 'List', value: 'list' }
      ))
    .addStringOption(o => o.setName('type').setDescription('Type of entry').setRequired(true)
      .addChoices(
        { name: 'User', value: 'user' },
        { name: 'Role', value: 'role' },
        { name: 'Channel', value: 'channel' },
        { name: 'Link (domain)', value: 'link' }
      ))
    .addStringOption(o => o.setName('value').setDescription('ID or domain value (for list, leave blank)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const action = interaction.options.getString('action', true);
      const type = interaction.options.getString('type', true);
      const value = interaction.options.getString('value')?.trim();
      const guildId = interaction.guild.id;

      if (action === 'list') {
        const entries = db.getWhitelist(guildId, type);
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        const display = entries.length
          ? entries.map(e => type === 'user' ? `<@${e}>` : type === 'role' ? `<@&${e}>` : type === 'channel' ? `<#${e}>` : `\`${e}\``).join('\n')
          : `No ${label} whitelist entries.`;
        return interaction.editReply({ embeds: [successEmbed(`📋 Whitelist — ${label}`, display)] });
      }

      if (!value) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Provide a value (ID or domain).')] });

      if (action === 'add') {
        if (db.isWhitelistedEntry(guildId, type, value))
          return interaction.editReply({ embeds: [errorEmbed('❌ Already Whitelisted', `\`${value}\` is already in the ${type} whitelist.`)] });
        db.addWhitelist(guildId, type, value);
        return interaction.editReply({ embeds: [successEmbed('✅ Whitelisted', `\`${value}\` added to the **${type}** whitelist.`)] });
      }

      if (action === 'remove') {
        if (!db.isWhitelistedEntry(guildId, type, value))
          return interaction.editReply({ embeds: [errorEmbed('❌ Not Found', `\`${value}\` is not in the ${type} whitelist.`)] });
        db.removeWhitelist(guildId, type, value);
        return interaction.editReply({ embeds: [successEmbed('✅ Removed', `\`${value}\` removed from the **${type}** whitelist.`)] });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
