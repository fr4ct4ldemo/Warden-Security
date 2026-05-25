'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicedisconnectall').setDescription('Disconnect all members from a voice channel')
    .addChannelOption(o => o.setName('channel').setDescription('Voice channel to clear').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['MoveMembers']);
      if (!ok) return;
      const channel = interaction.options.getChannel('channel', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const members = channel.members;
      let count = 0;
      for (const [, m] of members) { try { await m.voice.disconnect(reason); count++; } catch {} }
      const embed = successEmbed('🔌 Voice Channel Cleared', `Disconnected **${count}** member(s) from **${channel.name}**.\nReason: ${reason}`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
