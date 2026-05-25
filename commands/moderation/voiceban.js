'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voiceban')
    .setDescription('Ban or unban a user from all voice channels')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true).addChoices({ name: 'Add (ban)', value: 'add' }, { name: 'Remove (unban)', value: 'remove' }))
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const action = interaction.options.getString('action', true);
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const ok = await checkPermissions(interaction, ['MuteMembers', 'ManageChannels'], member);
      if (!ok) return;
      const guildId = interaction.guild.id;
      if (action === 'add') {
        db.addVoiceBan(guildId, user.id);
        interaction.guild.channels.cache.filter(c => c.isVoiceBased()).forEach(ch => {
          ch.permissionOverwrites.edit(user.id, { Connect: false }).catch(() => null);
        });
        if (member && member.voice.channel) await member.voice.disconnect('Voice banned').catch(() => null);
        const embed = errorEmbed('🔇 Voice Banned', `**${user.tag}** is banned from all voice channels.`, [
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        ]);
        await interaction.editReply({ embeds: [embed] });
        await logAction(client, guildId, embed);
      } else {
        db.removeVoiceBan(guildId, user.id);
        interaction.guild.channels.cache.filter(c => c.isVoiceBased()).forEach(ch => {
          const overwrite = ch.permissionOverwrites.cache.get(user.id);
          if (overwrite) overwrite.delete('Voice ban removed').catch(() => null);
        });
        const embed = successEmbed('✅ Voice Ban Removed', `**${user.tag}** can now join voice channels again.`, [
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        ]);
        await interaction.editReply({ embeds: [embed] });
        await logAction(client, guildId, embed);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
