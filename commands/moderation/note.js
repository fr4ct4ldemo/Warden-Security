'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Add a moderator note to a user')
    .addUserOption(o => o.setName('user').setDescription('User to note').setRequired(true))
    .addStringOption(o => o.setName('text').setDescription('Note text').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user', true);
      const text = interaction.options.getString('text', true);
      db.addWarning(interaction.guild.id, user.id, `[NOTE] ${text}`, interaction.user.tag);
      const embed = successEmbed('📝 Note Added', `A note has been saved for **${user.tag}**.`, [
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'User', value: user.tag, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
