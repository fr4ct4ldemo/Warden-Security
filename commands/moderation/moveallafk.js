'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('moveallafk')
    .setDescription('Move all connected voice members to the AFK channel')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const members = await interaction.guild.members.fetch();
      const afkChannel = interaction.guild.afkChannel;
      if (!afkChannel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Server does not have an AFK channel configured.')] });
      let count = 0;
      for (const [, member] of members) {
        if (member.voice?.channel && member.voice.channel.id !== afkChannel.id) {
          try {
            await member.voice.setChannel(afkChannel, 'Moved to AFK by moderator');
            count++;
          } catch {}
        }
      }
      const embed = successEmbed('🛌 AFK Move Complete', `Moved **${count}** voice member(s) to ${afkChannel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
