'use strict';
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Configure member verification (button-based)')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
      .addChoices(
        { name: 'Enable', value: 'enable' },
        { name: 'Disable', value: 'disable' },
        { name: 'Setup (send verify panel)', value: 'setup' },
        { name: 'Status', value: 'status' }
      ))
    .addChannelOption(o => o.setName('channel').setDescription('Channel for verify panel (required for setup)'))
    .addRoleOption(o => o.setName('role').setDescription('Role granted on verification (required for enable/setup)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const action = interaction.options.getString('action', true);
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('role');
      const guildId = interaction.guild.id;
      const current = db.getVerificationSettings(guildId);

      if (action === 'status') {
        const ch = current.channel_id ? `<#${current.channel_id}>` : 'Not set';
        const rl = current.role_id ? `<@&${current.role_id}>` : 'Not set';
        return interaction.editReply({ embeds: [successEmbed('🔐 Verification Status',
          `**Enabled:** ${current.enabled ? 'Yes' : 'No'}\n**Channel:** ${ch}\n**Role:** ${rl}`)] });
      }

      if (action === 'enable') {
        if (!role) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Please specify a role to grant on verification.')] });
        db.saveVerificationSettings(guildId, true, current.channel_id, role.id);
        return interaction.editReply({ embeds: [successEmbed('✅ Verification Enabled', `Members will receive <@&${role.id}> after clicking verify.`)] });
      }

      if (action === 'disable') {
        db.saveVerificationSettings(guildId, false, current.channel_id, current.role_id);
        return interaction.editReply({ embeds: [successEmbed('Verification Disabled', 'Verification has been turned off.')] });
      }

      if (action === 'setup') {
        const targetChannel = channel || interaction.channel;
        const targetRole = role || (current.role_id ? interaction.guild.roles.cache.get(current.role_id) : null);
        if (!targetRole) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Please provide a verification role.')] });
        db.saveVerificationSettings(guildId, true, targetChannel.id, targetRole.id);
        const panelEmbed = successEmbed('✅ Verify Yourself',
          `Welcome to **${interaction.guild.name}**!\nClick the button below to verify and gain access.`);
        const button = new ButtonBuilder()
          .setCustomId('verify_button')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅');
        const row = new ActionRowBuilder().addComponents(button);
        await targetChannel.send({ embeds: [panelEmbed], components: [row] });
        return interaction.editReply({ embeds: [successEmbed('✅ Verification Panel Sent', `Panel posted in <#${targetChannel.id}>. Role: <@&${targetRole.id}>.`)] });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
