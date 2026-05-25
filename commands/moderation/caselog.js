'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('caselog')
    .setDescription('Show warning case history for a user')
    .addUserOption(o => o.setName('user').setDescription('User whose case log to view').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const user = interaction.options.getUser('user', true);
      const warnings = db.getWarnings(guildId, user.id);
      if (!warnings.length) return interaction.editReply({ embeds: [errorEmbed('❌ Error', `No cases found for ${user.tag}.`)] });
      const list = warnings.map((w, i) => `**#${i + 1}** — <t:${Math.floor(w.timestamp / 1000)}:f> — ${w.reason} (${w.moderator_tag})`).join(`\n`).slice(0, 4000);
      const embed = successEmbed(`📚 Case Log — ${user.tag}`, list);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
