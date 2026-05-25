'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemoveall').setDescription('Move all members from one voice channel to another')
    .addChannelOption(o => o.setName('from').setDescription('Source voice channel').setRequired(true))
    .addChannelOption(o => o.setName('to').setDescription('Destination voice channel').setRequired(true))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['MoveMembers']);
      if (!ok) return;
      const from = interaction.options.getChannel('from', true);
      const to = interaction.options.getChannel('to', true);
      const members = from.members;
      let count = 0;
      for (const [, m] of members) { try { await m.voice.setChannel(to); count++; } catch {} }
      const embed = successEmbed('🔀 All Members Moved', `Moved **${count}** member(s) from **${from.name}** → **${to.name}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
