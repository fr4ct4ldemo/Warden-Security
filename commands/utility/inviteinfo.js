'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inviteinfo')
    .setDescription('Inspect a Discord invite link or code')
    .addStringOption(o => o.setName('code').setDescription('Invite code or full URL').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      let code = interaction.options.getString('code', true).trim();
      const match = code.match(/discord(?:\.gg|app\.com\/invite|\.com\/invite)\/([a-zA-Z0-9-]+)/);
      if (match) code = match[1];
      const invite = await client.fetchInvite(code).catch(() => null);
      if (!invite) return interaction.editReply({ embeds: [errorEmbed('❌ Invalid Invite', 'That invite code is invalid or has expired.')] });
      const expiresAt = invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
      const createdAt = invite.createdAt ? new Date(invite.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown';
      const embed = successEmbed('🔗 Invite Info', `Code: \`${invite.code}\``, [
        { name: 'Guild', value: invite.guild?.name || 'Unknown', inline: true },
        { name: 'Channel', value: invite.channel?.name || 'Unknown', inline: true },
        { name: 'Inviter', value: invite.inviter?.tag || 'Unknown', inline: true },
        { name: 'Uses', value: `${invite.uses ?? '?'} / ${invite.maxUses || '∞'}`, inline: true },
        { name: 'Expires', value: expiresAt, inline: true },
        { name: 'Created At', value: createdAt, inline: true },
        { name: 'Temporary', value: invite.temporary ? '✅ Yes' : '❌ No', inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
