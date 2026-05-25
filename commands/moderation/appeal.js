'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('appeal').setDescription('Look up or manage a punishment appeal by user')
    .addUserOption(o => o.setName('user').setDescription('User who appealed').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Accept or deny').setRequired(true)
    .addChoices({ name: 'Accept', value: 'accept' }, { name: 'Deny', value: 'deny' }, { name: 'View', value: 'view' }))
    .addStringOption(o => o.setName('reason').setDescription('Reason for decision'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const user = interaction.options.getUser('user', true);
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      if (action === 'view') {
      const appealData = db.getAppeal ? db.getAppeal(guildId, user.id) : null;
      if (!appealData) return interaction.editReply({ embeds: [errorEmbed('❌ No Appeal', `No appeal found for **${user.tag}**.`)] });
      return interaction.editReply({ embeds: [successEmbed(`📋 Appeal — ${user.tag}`, appealData.reason || 'No details', [
      { name: 'Status', value: appealData.status ?? 'Pending', inline: true },
      { name: 'Submitted', value: appealData.timestamp ? `<t:${Math.floor(appealData.timestamp / 1000)}:R>` : 'Unknown', inline: true }
      ])] });
      }
      if (db.updateAppeal) db.updateAppeal(guildId, user.id, action, reason);
      if (action === 'accept') {
      try { await interaction.guild.members.unban(user.id, `Appeal accepted: ${reason}`); } catch {}
      }
      const embed = successEmbed(`✅ Appeal ${action === 'accept' ? 'Accepted' : 'Denied'}`, `**${user.tag}**'s appeal has been **${action}ed**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
