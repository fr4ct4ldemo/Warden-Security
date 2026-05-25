'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelcreate').setDescription('Create a new text or voice channel')
    .addStringOption(o => o.setName('name').setDescription('Channel name').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('Channel type').setRequired(true)
    .addChoices({ name: 'Text', value: 'text' }, { name: 'Voice', value: 'voice' }, { name: 'Announcement', value: 'announcement' }, { name: 'Stage', value: 'stage' }))
    .addChannelOption(o => o.setName('category').setDescription('Category to place it in'))
    .addStringOption(o => o.setName('topic').setDescription('Channel topic (text only)'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ManageChannels']);
      if (!ok) return;
      const name = interaction.options.getString('name', true);
      const type = interaction.options.getString('type', true);
      const category = interaction.options.getChannel('category');
      const topic = interaction.options.getString('topic') ?? '';
      const typeMap = { text: ChannelType.GuildText, voice: ChannelType.GuildVoice, announcement: ChannelType.GuildAnnouncement, stage: ChannelType.GuildStageVoice };
      const ch = await interaction.guild.channels.create({ name, type: typeMap[type], parent: category?.id ?? null, topic });
      const embed = successEmbed('✅ Channel Created', `${ch} (\`${type}\`) was created.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
