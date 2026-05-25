'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnpunishment')
    .setDescription('Set auto-punishment at a warning threshold')
    .addIntegerOption(o => o.setName('count').setDescription('Warning count that triggers punishment').setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName('punishment').setDescription('Punishment to apply').setRequired(true)
      .addChoices(
        { name: 'Mute', value: 'mute' },
        { name: 'Kick', value: 'kick' },
        { name: 'Ban', value: 'ban' },
        { name: 'None (remove)', value: 'none' }
      )),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const count = interaction.options.getInteger('count', true);
      const punishment = interaction.options.getString('punishment', true);
      if (punishment === 'none') {
        db.deleteWarnPunishment(interaction.guild.id, count);
      } else {
        db.setWarnPunishment(interaction.guild.id, count, punishment);
      }
      const punishments = db.getWarnPunishments(interaction.guild.id);
      const ladder = Object.keys(punishments).sort((a, b) => a - b)
        .map(k => `At **${k}** warns → **${punishments[k]}**`).join('\n') || 'No punishments configured.';
      const embed = successEmbed('⚙️ Warn Punishments Updated', punishment === 'none'
        ? `Removed punishment at **${count}** warnings.`
        : `Set **${punishment}** at **${count}** warnings.`, [
        { name: 'Current Punishment Ladder', value: ladder, inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
