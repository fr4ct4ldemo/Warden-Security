'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('moduserinfo')
    .setDescription('Show moderation info for a user')
    .addUserOption(o => o.setName('user').setDescription('User to inspect'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ModerateMembers']);
      if (!ok) return;
      const user = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const warnings = db.countWarnings(guildId, user.id);
      const roleCount = member ? member.roles.cache.size - 1 : 0;
      const fields = [
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Join Date', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Not in server', inline: true },
        { name: 'Roles', value: `${roleCount}`, inline: true },
        { name: 'Warnings', value: `${warnings}`, inline: true }
      ];
      const embed = successEmbed(`👤 User Info — ${user.tag}`, `Summary for ${user.tag}`, fields);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
