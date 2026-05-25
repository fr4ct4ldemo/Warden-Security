'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ignorechannel')
    .setDescription('Ignore or un-ignore a channel from automod scanning')
    .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true)
      .addChoices(
        { name: 'Add (ignore)', value: 'add' },
        { name: 'Remove (unignore)', value: 'remove' },
        { name: 'List', value: 'list' }
      ))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to add/remove')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const action = interaction.options.getString('action', true);
      const channel = interaction.options.getChannel('channel');
      const guildId = interaction.guild.id;

      if (action === 'list') {
        const ignored = db.getIgnoredChannels(guildId);
        const list = ignored.length ? ignored.map(id => `<#${id}>`).join('\n') : 'No channels are currently ignored.';
        return interaction.editReply({ embeds: [successEmbed('📋 Ignored Channels', list)] });
      }

      if (!channel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Please specify a channel.')] });

      if (action === 'add') {
        if (db.isChannelIgnored(guildId, channel.id))
          return interaction.editReply({ embeds: [errorEmbed('❌ Already Ignored', `<#${channel.id}> is already ignored.`)] });
        db.addIgnoredChannel(guildId, channel.id);
        return interaction.editReply({ embeds: [successEmbed('✅ Channel Ignored', `<#${channel.id}> will no longer be scanned by automod.`)] });
      }

      if (action === 'remove') {
        if (!db.isChannelIgnored(guildId, channel.id))
          return interaction.editReply({ embeds: [errorEmbed('❌ Not Ignored', `<#${channel.id}> is not in the ignore list.`)] });
        db.removeIgnoredChannel(guildId, channel.id);
        return interaction.editReply({ embeds: [successEmbed('✅ Channel Unignored', `<#${channel.id}> will now be scanned by automod.`)] });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
