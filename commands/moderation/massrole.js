'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('massrole').setDescription('Add or remove a role from all members with another specific role')
    .addRoleOption(o => o.setName('targetrole').setDescription('Members who have this role').setRequired(true))
    .addRoleOption(o => o.setName('giverole').setDescription('Role to add or remove').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true)
    .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageRoles']);
      if (!ok) return;
      const targetRole = interaction.options.getRole('targetrole', true);
      const giveRole = interaction.options.getRole('giverole', true);
      const action = interaction.options.getString('action', true);
      const members = await interaction.guild.members.fetch();
      const targets = members.filter(m => m.roles.cache.has(targetRole.id));
      let count = 0;
      for (const [, m] of targets) {
      try {
      if (action === 'add') await m.roles.add(giveRole);
      else await m.roles.remove(giveRole);
      count++;
      } catch {}
      }
      const embed = successEmbed(`✅ Mass Role — ${action === 'add' ? 'Added' : 'Removed'}`, `**${giveRole.name}** ${action === 'add' ? 'added to' : 'removed from'} **${count}** member(s) with **${targetRole.name}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
