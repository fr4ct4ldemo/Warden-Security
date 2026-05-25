'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('List warnings for a user')
    .addUserOption(o=>o.setName('user').setDescription('Target user').setRequired(true)),
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user', true);
      const rows = db.getWarnings(interaction.guild.id, user.id);
      if (!rows.length) return interaction.editReply({ embeds: [successEmbed('Warnings', `${user.tag} has no warnings.`)] });
      const desc = rows.map((r,i)=>`${i+1}. ${r.reason} — ${r.moderator_tag} — ${new Date(r.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`).join('\n');
      await interaction.editReply({ embeds: [successEmbed(`Warnings for ${user.tag}`, desc)] });
    } catch (err) { console.error(err); await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] }); }
  }
};
