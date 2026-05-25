'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('mutedlist')
    .setDescription('List members currently using the muted role')
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const roleId = db.getMutedRole(guildId);
      if (!roleId) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Mute role is not configured for this server.')] });
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Configured muted role no longer exists.')] });
      const members = await interaction.guild.members.fetch();
      const muted = members.filter(m => m.roles.cache.has(role.id));
      const list = muted.size ? muted.map(m => m.user.tag).slice(0, 50).join(`\n`) : 'None';
      const embed = successEmbed(`🔇 Muted Members (${muted.size})`, list.slice(0, 4000));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
