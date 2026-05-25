'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock or unlock all text channels for @everyone')
    .addStringOption(o => o.setName('action').setDescription('Lock or unlock').setRequired(true)
    .addChoices({ name: 'Lock', value: 'lock' }, { name: 'Unlock', value: 'unlock' }))
    .addStringOption(o => o.setName('reason').setDescription('Reason for lockdown'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || (action === 'lock' ? 'Server lockdown' : 'Lockdown lifted');
      const everyone = interaction.guild.roles.everyone;
      let count = 0;
      for (const [, ch] of interaction.guild.channels.cache.filter(c => c.isTextBased && c.isTextBased())) {
      try {
      await ch.permissionOverwrites.edit(everyone, { SendMessages: action === 'lock' ? false : null });
      count++;
      } catch {}
      }
      db.setLockdown(guildId, action === 'lock');
      const embed = action === 'lock'
      ? errorEmbed('🔒 Server Locked Down', `**${count}** channels locked.\nReason: ${reason}\nModerator: ${interaction.user.tag}`)
      : successEmbed('🔓 Lockdown Lifted', `**${count}** channels unlocked.\nReason: ${reason}\nModerator: ${interaction.user.tag}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
