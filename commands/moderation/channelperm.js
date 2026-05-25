'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelperm').setDescription('Edit a role or member permission override in a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to edit (or use member)'))
    .addUserOption(o => o.setName('member').setDescription('Member to edit (or use role)'))
    .addStringOption(o => o.setName('permission').setDescription('Permission name e.g. SendMessages').setRequired(true))
    .addStringOption(o => o.setName('state').setDescription('Allow, Deny, or Neutral').setRequired(true)
    .addChoices({ name: 'Allow', value: 'allow' }, { name: 'Deny', value: 'deny' }, { name: 'Neutral (reset)', value: 'neutral' }))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels', 'ManageRoles']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const role = interaction.options.getRole('role');
      const member = interaction.options.getMember('member');
      const target = role || member;
      if (!target) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Provide a role or member.')] });
      const perm = interaction.options.getString('permission', true);
      const state = interaction.options.getString('state', true);
      const overwrite = { [perm]: state === 'allow' ? true : state === 'deny' ? false : null };
      await channel.permissionOverwrites.edit(target, overwrite);
      const embed = successEmbed('🔐 Permission Updated', `\`${perm}\` → **${state}** for **${role?.name ?? member?.user?.tag}** in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
