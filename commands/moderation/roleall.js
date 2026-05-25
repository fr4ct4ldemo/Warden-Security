'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleall').setDescription('Add or remove a role from every member')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true)
    .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageRoles', 'Administrator']);
      if (!ok) return;
      const role = interaction.options.getRole('role', true);
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || `Mass role ${action} by ${interaction.user.tag}`;
      const members = await interaction.guild.members.fetch();
      let count = 0;
      for (const [, m] of members) {
      try {
      if (action === 'add') await m.roles.add(role, reason);
      else await m.roles.remove(role, reason);
      count++;
      } catch {}
      }
      const embed = successEmbed(`✅ Role ${action === 'add' ? 'Added' : 'Removed'} (All Members)`, `**${role.name}** ${action === 'add' ? 'added to' : 'removed from'} **${count}** member(s).`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
