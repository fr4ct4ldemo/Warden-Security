'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletenote').setDescription('Delete a specific staff note by ID')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption(o => o.setName('noteid').setDescription('Note ID to delete').setRequired(true).setMinValue(1))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const user = interaction.options.getUser('user', true);
      const noteId = interaction.options.getInteger('noteid', true);
      const deleted = db.deleteNote ? db.deleteNote(guildId, user.id, noteId) : false;
      const embed = deleted
      ? successEmbed('🗑️ Note Deleted', `Note **#${noteId}** for **${user.tag}** was deleted.`)
      : errorEmbed('❌ Not Found', `Note **#${noteId}** was not found for **${user.tag}**.`);
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
