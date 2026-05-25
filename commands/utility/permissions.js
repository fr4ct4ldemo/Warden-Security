'use strict';
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Show a user\'s permissions in a channel')
    .addUserOption(o => o.setName('user').setDescription('User to inspect'))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to inspect')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user') || interaction.user;
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Member not found.')] });
      }
      if (!channel || !channel.permissionsFor) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Channel does not support permission checks.')] });
      }
      const perms = channel.permissionsFor(member);
      if (!perms) {
        return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Unable to determine permissions for that member.')] });
      }
      const allowed = perms.toArray();
      const denied = Object.keys(PermissionsBitField.Flags).filter(flag => !perms.has(flag));
      const embed = successEmbed(`🔐 Permissions for ${user.tag}`, `Channel: ${channel.toString()}`, [
        { name: 'Allowed', value: allowed.length ? allowed.join(', ') : 'None', inline: false },
        { name: 'Denied', value: denied.length ? denied.join(', ') : 'None', inline: false }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
