'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raidmode')
    .setDescription('Manually toggle raid mode (locks/unlocks all channels)')
    .addStringOption(o => o.setName('action').setDescription('on or off').setRequired(true).addChoices({ name: 'On', value: 'on' }, { name: 'Off', value: 'off' })),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const action = interaction.options.getString('action', true);
      const everyone = interaction.guild.roles.everyone;
      let count = 0;
      if (action === 'on') {
        db.setRaidMode(interaction.guild.id, true);
        for (const [, ch] of interaction.guild.channels.cache.filter(c => c.isTextBased && c.isTextBased())) {
          try { await ch.permissionOverwrites.edit(everyone, { SendMessages: false }); count++; } catch {}
        }
        const embed = errorEmbed('🚨 Raid Mode ACTIVATED', `Manual raid mode is now **ON**. **${count}** channels locked.\nModerator: ${interaction.user.tag}`);
        await interaction.editReply({ embeds: [embed] });
        await logAction(client, interaction.guild.id, embed);
      } else {
        db.setRaidMode(interaction.guild.id, false);
        for (const [, ch] of interaction.guild.channels.cache.filter(c => c.isTextBased && c.isTextBased())) {
          try { await ch.permissionOverwrites.edit(everyone, { SendMessages: null }); count++; } catch {}
        }
        const embed = successEmbed('✅ Raid Mode Deactivated', `Raid mode is now **OFF**. **${count}** channels restored.\nModerator: ${interaction.user.tag}`);
        await interaction.editReply({ embeds: [embed] });
        await logAction(client, interaction.guild.id, embed);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
