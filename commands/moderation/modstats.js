'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modstats').setDescription('Show moderation action stats for a moderator')
    .addUserOption(o => o.setName('moderator').setDescription('Moderator to check (defaults to you)'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const ok = await checkPermissions(interaction, ['ModerateMembers']);
      if (!ok) return;
      const mod = interaction.options.getUser('moderator') ?? interaction.user;
      const stats = db.getModStats ? db.getModStats(guildId, mod.id) : { bans: 0, kicks: 0, warns: 0, mutes: 0 };
      return interaction.editReply({ embeds: [successEmbed(`📊 Mod Stats — ${mod.tag}`, 'Actions taken in this server:', [
      { name: 'Bans', value: `${stats.bans ?? 0}`, inline: true },
      { name: 'Kicks', value: `${stats.kicks ?? 0}`, inline: true },
      { name: 'Warns', value: `${stats.warns ?? 0}`, inline: true },
      { name: 'Mutes', value: `${stats.mutes ?? 0}`, inline: true },
      { name: 'Timeouts', value: `${stats.timeouts ?? 0}`, inline: true },
      { name: 'Unbans', value: `${stats.unbans ?? 0}`, inline: true },
      ])] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
