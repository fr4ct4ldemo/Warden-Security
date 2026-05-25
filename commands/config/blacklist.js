'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage the server blacklist (users, links, words)')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
      .addChoices(
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' },
        { name: 'List', value: 'list' }
      ))
    .addStringOption(o => o.setName('type').setDescription('Type of entry').setRequired(true)
      .addChoices(
        { name: 'User (auto-ban on join)', value: 'user' },
        { name: 'Link (domain)', value: 'link' },
        { name: 'Word', value: 'word' }
      ))
    .addStringOption(o => o.setName('value').setDescription('ID, domain, or word (leave blank for list)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const action = interaction.options.getString('action', true);
      const type = interaction.options.getString('type', true);
      const value = interaction.options.getString('value')?.trim().toLowerCase();
      const guildId = interaction.guild.id;

      if (action === 'list') {
        const entries = db.getBlacklist(guildId, type);
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        const display = entries.length
          ? entries.map(e => type === 'user' ? `<@${e}>` : `\`${e}\``).join('\n')
          : `No ${label} blacklist entries.`;
        return interaction.editReply({ embeds: [successEmbed(`📋 Blacklist — ${label}`, display)] });
      }

      if (!value) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Provide a value (ID, domain, or word).')] });

      if (action === 'add') {
        if (db.isBlacklisted(guildId, type, value))
          return interaction.editReply({ embeds: [errorEmbed('❌ Already Blacklisted', `\`${value}\` is already in the ${type} blacklist.`)] });
        db.addBlacklist(guildId, type, value);
        return interaction.editReply({ embeds: [successEmbed(`🚫 Blacklisted`, `\`${value}\` added to the **${type}** blacklist.`)] });
      }

      if (action === 'remove') {
        if (!db.isBlacklisted(guildId, type, value))
          return interaction.editReply({ embeds: [errorEmbed('❌ Not Found', `\`${value}\` is not in the ${type} blacklist.`)] });
        db.removeBlacklist(guildId, type, value);
        return interaction.editReply({ embeds: [successEmbed('✅ Removed', `\`${value}\` removed from the **${type}** blacklist.`)] });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
