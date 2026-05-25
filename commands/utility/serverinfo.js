'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('View detailed information about this server'),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const guild = interaction.guild;
      await guild.fetch();
      const owner = await guild.fetchOwner().catch(() => null);
      const humans = guild.members.cache.filter(m => !m.user.bot).size;
      const bots = guild.members.cache.filter(m => m.user.bot).size;
      const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
      const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
      const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
      const createdAt = new Date(guild.createdTimestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const verificationLevels = { 0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High' };
      const embed = successEmbed(`🏠 ${guild.name}`, `Server ID: ${guild.id}`, [
        { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
        { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Humans', value: `${humans}`, inline: true },
        { name: 'Bots', value: `${bots}`, inline: true },
        { name: 'Text Channels', value: `${textChannels}`, inline: true },
        { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
        { name: 'Categories', value: `${categories}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: 'Stickers', value: `${guild.stickers.cache.size}`, inline: true },
        { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: 'Verification Level', value: verificationLevels[guild.verificationLevel] ?? 'Unknown', inline: true },
        { name: 'Created At', value: createdAt, inline: false }
      ]);
      const iconURL = guild.iconURL({ size: 256, extension: guild.icon?.startsWith('a_') ? 'gif' : 'png' });
      if (iconURL) embed.setThumbnail(iconURL);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
