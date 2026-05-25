'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolecreate').setDescription('Create a new role')
    .addStringOption(o => o.setName('name').setDescription('Role name').setRequired(true))
    .addStringOption(o => o.setName('color').setDescription('Hex color e.g. #FF5733'))
    .addBooleanOption(o => o.setName('hoist').setDescription('Show separately in member list'))
    .addBooleanOption(o => o.setName('mentionable').setDescription('Allow everyone to mention this role'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageRoles']);
      if (!ok) return;
      const name = interaction.options.getString('name', true);
      const color = interaction.options.getString('color') ?? null;
      const hoist = interaction.options.getBoolean('hoist') ?? false;
      const mentionable = interaction.options.getBoolean('mentionable') ?? false;
      const role = await interaction.guild.roles.create({ name, color, hoist, mentionable });
      const embed = successEmbed('✅ Role Created', `**${role.name}** was created.`, [
      { name: 'ID', value: role.id, inline: true },
      { name: 'Color', value: color ?? 'Default', inline: true },
      { name: 'Hoisted', value: hoist ? 'Yes' : 'No', inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
