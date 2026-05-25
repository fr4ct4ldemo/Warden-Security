'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

const HOIST_CHARS = new Set(['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/']);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dehoist')
    .setDescription('Remove hoisting characters from member nicknames')
    .addUserOption(o => o.setName('user').setDescription('Specific user to dehoist')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const targetUser = interaction.options.getUser('user');
      if (targetUser) {
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        const ok = await checkPermissions(interaction, ['ManageNicknames'], member);
        if (!ok) return;
        if (!member) {
          return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Member not found.')] });
        }
        const firstChar = member.displayName.charAt(0);
        if (!HOIST_CHARS.has(firstChar)) {
          return interaction.editReply({ embeds: [errorEmbed('❌ Not Hoisted', `${targetUser.tag} does not have a hoisting character at the start of their nickname.`)] });
        }
        await member.setNickname(`ꜝ${member.user.username}`).catch(() => null);
        const embed = successEmbed('✅ Dehoisted User', `Updated nickname for **${targetUser.tag}**.`);
        await interaction.editReply({ embeds: [embed] });
        await logAction(client, interaction.guild.id, embed);
        return;
      }
      const members = interaction.guild.members.cache.filter(m => !m.user.bot && HOIST_CHARS.has(m.displayName.charAt(0)));
      const ok = await checkPermissions(interaction, ['ManageNicknames']);
      if (!ok) return;
      let count = 0;
      for (const member of members.values()) {
        if (!member.manageable) continue;
        await member.setNickname(`ꜝ${member.user.username}`).catch(() => null);
        count += 1;
      }
      const embed = successEmbed('✅ Dehoist Scan Complete', `Dehoisted ${count} member(s).`);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
