'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purgeuser').setDescription('Delete a specific user\'s messages in a channel')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to scan (max 100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel (defaults to current)'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageMessages']);
      if (!ok) return;
      const user = interaction.options.getUser('user', true);
      const amount = interaction.options.getInteger('amount', true);
      const channel = interaction.options.getChannel('channel') ?? interaction.channel;
      const messages = await channel.messages.fetch({ limit: amount });
      const toDelete = messages.filter(m => m.author.id === user.id && Date.now() - m.createdTimestamp < 1209600000);
      await channel.bulkDelete(toDelete, true);
      const embed = successEmbed('🧹 User Messages Purged', `Deleted **${toDelete.size}** message(s) from **${user.tag}** in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
