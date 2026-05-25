'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiword')
    .setDescription('Manage blocked words list')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
      .addChoices(
        { name: 'Enable', value: 'enable' },
        { name: 'Disable', value: 'disable' },
        { name: 'Add word', value: 'add' },
        { name: 'Remove word', value: 'remove' },
        { name: 'List words', value: 'list' }
      ))
    .addStringOption(o => o.setName('word').setDescription('Word to add/remove')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const action = interaction.options.getString('action', true);
      const word = interaction.options.getString('word')?.toLowerCase();
      const settings = db.getSettings(interaction.guild.id);
      if (!settings.antiWord) settings.antiWord = { enabled: false, words: [] };
      if (action === 'enable') {
        settings.antiWord.enabled = true;
        db.saveSettings(interaction.guild.id, settings);
        return interaction.editReply({ embeds: [successEmbed('🚫 Anti-Word Enabled', 'Blocked word filter is now active.')] });
      }
      if (action === 'disable') {
        settings.antiWord.enabled = false;
        db.saveSettings(interaction.guild.id, settings);
        return interaction.editReply({ embeds: [errorEmbed('Anti-Word Disabled', 'Blocked word filter has been turned off.')] });
      }
      if (action === 'add') {
        if (!word) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Provide a word to add.')] });
        if (!settings.antiWord.words.includes(word)) settings.antiWord.words.push(word);
        db.saveSettings(interaction.guild.id, settings);
        return interaction.editReply({ embeds: [successEmbed('✅ Word Added', `\`${word}\` added to the blocked words list.`)] });
      }
      if (action === 'remove') {
        if (!word) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Provide a word to remove.')] });
        settings.antiWord.words = settings.antiWord.words.filter(w => w !== word);
        db.saveSettings(interaction.guild.id, settings);
        return interaction.editReply({ embeds: [successEmbed('✅ Word Removed', `\`${word}\` removed from the blocked words list.`)] });
      }
      if (action === 'list') {
        const words = settings.antiWord.words;
        return interaction.editReply({ embeds: [successEmbed('📋 Blocked Words', words.length ? words.map(w => `\`${w}\``).join(', ') : 'No words blocked.')] });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
