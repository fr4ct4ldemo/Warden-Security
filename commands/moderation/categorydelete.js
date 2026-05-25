'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('categorydelete').setDescription('Delete a category and optionally its channels')
    .addChannelOption(o => o.setName('category').setDescription('Target category').setRequired(true))
    .addBooleanOption(o => o.setName('deletechannels').setDescription('Also delete all channels inside'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const cat = interaction.options.getChannel('category', true);
      const deleteChannels = interaction.options.getBoolean('deletechannels') ?? false;
      const name = cat.name;
      if (deleteChannels) {
      const children = interaction.guild.channels.cache.filter(c => c.parentId === cat.id);
      for (const [, ch] of children) { try { await ch.delete(); } catch {} }
      }
      await cat.delete();
      const embed = successEmbed('🗑️ Category Deleted', `**${name}** deleted${deleteChannels ? ' along with its channels' : ''}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
