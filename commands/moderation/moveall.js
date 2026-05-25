'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moveall')
    .setDescription('Move all members from one voice channel to another')
    .addChannelOption(o => o.setName('from').setDescription('Source voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
    .addChannelOption(o => o.setName('to').setDescription('Destination voice channel').setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['MoveMembers']);
      if (!ok) return;
      const from = interaction.options.getChannel('from', true);
      const to = interaction.options.getChannel('to', true);
      await interaction.guild.members.fetch();
      const members = from.members;
      if (!members.size) return interaction.editReply({ embeds: [errorEmbed('❌ Empty Channel', 'No members in that voice channel.')] });
      let moved = 0, failed = 0;
      for (const [, m] of members) {
        try { await m.voice.setChannel(to); moved++; } catch { failed++; }
      }
      const embed = successEmbed('🔀 Members Moved', `Moved **${moved}** member(s) from **${from.name}** to **${to.name}**.`, [
        { name: 'Failed', value: `${failed}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
