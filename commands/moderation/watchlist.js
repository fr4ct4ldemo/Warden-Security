'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('watchlist').setDescription('Add or remove a user from the moderator watchlist')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true)
    .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
    .addStringOption(o => o.setName('reason').setDescription('Reason for watching'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ModerateMembers']);
      if (!ok) return;
      const user = interaction.options.getUser('user', true);
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      if (action === 'add') {
      db.addWatchlist ? db.addWatchlist(guildId, user.id, reason) : null;
      } else {
      db.removeWatchlist ? db.removeWatchlist(guildId, user.id) : null;
      }
      const embed = successEmbed(`👁️ Watchlist — ${action === 'add' ? 'Added' : 'Removed'}`, `**${user.tag}** was ${action === 'add' ? 'added to' : 'removed from'} the watchlist.\n${action === 'add' ? `Reason: ${reason}` : ''}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
