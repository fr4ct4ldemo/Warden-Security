'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('threadlock')
    .setDescription('Lock or archive a thread channel')
    .addChannelOption(o => o.setName('thread').setDescription('Thread to lock').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Lock or unlock').setRequired(true)
    .addChoices({ name: 'Lock', value: 'lock' }, { name: 'Unlock', value: 'unlock' }))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const thread = interaction.options.getChannel('thread', true);
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      if (!thread.isThread || !thread.isThread()) {
      return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel is not a thread.')] });
      }
      if (action === 'lock') {
      await thread.setLocked(true, reason);
      await thread.setArchived(true, reason);
      const embed = successEmbed('🔒 Thread Locked', `Thread **${thread.name}** has been locked and archived.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
      } else {
      await thread.setArchived(false, reason);
      await thread.setLocked(false, reason);
      const embed = successEmbed('🔓 Thread Unlocked', `Thread **${thread.name}** has been unlocked and unarchived.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
