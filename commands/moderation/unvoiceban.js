'use strict';
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unvoiceban')
    .setDescription('Remove voice ban and clear voice channel denies')
    .addUserOption(o => o.setName('user').setDescription('User to unvoiceban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for unvoiceban')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const ok = await checkPermissions(interaction, ['MuteMembers'], member);
      if (!ok) return;
      if (!db.isVoiceBanned(interaction.guild.id, user.id)) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Not Voice Banned', `**${user.tag}** is not currently voice banned.`)] });
      }
      db.removeVoiceBan(interaction.guild.id, user.id);
      const voiceChannels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice);
      let cleaned = 0;
      for (const channel of voiceChannels.values()) {
        const overwrite = channel.permissionOverwrites.cache.get(user.id);
        if (overwrite && overwrite.deny.has(PermissionFlagsBits.Connect)) {
          await overwrite.delete().catch(() => null);
          cleaned += 1;
        }
      }
      const embed = successEmbed('🔊 Voice Ban Removed', `Removed voice ban for **${user.tag}**.
Reason: ${reason}`, [
        { name: 'Voice Overrides Cleared', value: `${cleaned}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
