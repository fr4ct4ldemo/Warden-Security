'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickall').setDescription('Set a nickname for all members with a specific role')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('Nickname to apply (leave blank to reset)'))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageNicknames', 'Administrator']);
      if (!ok) return;
      const role = interaction.options.getRole('role', true);
      const nickname = interaction.options.getString('nickname') ?? null;
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const members = await interaction.guild.members.fetch();
      const targets = members.filter(m => m.roles.cache.has(role.id) && m.manageable);
      let count = 0;
      for (const [, m] of targets) {
      try { await m.setNickname(nickname, reason); count++; } catch {}
      }
      const embed = successEmbed('✏️ Nick All', `${nickname ? `Set nickname to **${nickname}**` : 'Reset nicknames'} for **${count}** member(s) with **${role.name}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
