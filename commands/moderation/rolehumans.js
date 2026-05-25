'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolehumans').setDescription('Add or remove a role from all human members')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true)
    .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageRoles']);
      if (!ok) return;
      const role = interaction.options.getRole('role', true);
      const action = interaction.options.getString('action', true);
      const members = await interaction.guild.members.fetch();
      const humans = members.filter(m => !m.user.bot);
      let count = 0;
      for (const [, m] of humans) {
      try {
      if (action === 'add') await m.roles.add(role);
      else await m.roles.remove(role);
      count++;
      } catch {}
      }
      const embed = successEmbed(`👥 Role ${action === 'add' ? 'Added to' : 'Removed from'} Humans`, `**${role.name}** ${action === 'add' ? 'added to' : 'removed from'} **${count}** member(s).`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
