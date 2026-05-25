'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewnotes').setDescription('View all staff notes for a user')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ModerateMembers']);
      if (!ok) return;
      const user = interaction.options.getUser('user', true);
      const notes = db.getNotes ? db.getNotes(guildId, user.id) : [];
      if (!notes.length) return interaction.editReply({ embeds: [errorEmbed('❌ No Notes', `No notes found for **${user.tag}**.`)] });
      const list = notes.map((n, i) => `**#${i + 1}** — ${n.note} *(${n.moderator_tag})*`).join('\n').slice(0, 4000);
      return interaction.editReply({ embeds: [successEmbed(`📋 Notes — ${user.tag}`, list)] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
