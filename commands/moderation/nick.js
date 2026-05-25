'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change or reset a member\'s nickname')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('New nickname (omit to reset)')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const user = interaction.options.getUser('user', true);
      const nickname = interaction.options.getString('nickname') || null;
      if (user.id === client.user.id) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Cannot change the bot\'s nickname this way.')] });
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Member not found.')] });
      const ok = await checkPermissions(interaction, ['ManageNicknames'], member);
      if (!ok) return;
      const oldNick = member.nickname || user.username;
      await member.setNickname(nickname, `Changed by ${interaction.user.tag}`);
      const embed = successEmbed('✏️ Nickname Updated', `Updated nickname for **${user.tag}**.`, [
        { name: 'Old Nickname', value: oldNick, inline: true },
        { name: 'New Nickname', value: nickname || user.username, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      await logAction(client, interaction.guild.id, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
