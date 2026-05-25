'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View warning history for a user')
    .addUserOption(o => o.setName('user').setDescription('User to inspect').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user', true);
      const warnings = db.getWarnings(interaction.guild.id, user.id);
      if (!warnings.length) {
        return interaction.editReply({ embeds: [errorEmbed('❌ No History Found', `No warnings or notes were found for **${user.tag}**.`)] });
      }
      const rows = warnings.map(w => {
        const date = new Date(w.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return `#${w.id} — ${w.reason} — ${w.moderator_tag} — ${date}`;
      }).join('\n');
      const content = rows.length > 1024 ? `${rows.slice(0, 1020)}...` : rows;
      const embed = successEmbed(`📚 History for ${user.tag}`, `Found ${warnings.length} entries.`, [
        { name: 'Cases', value: content, inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
