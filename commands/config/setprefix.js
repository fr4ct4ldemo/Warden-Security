'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Set the bot command prefix for this server')
    .addStringOption(o => o.setName('prefix').setDescription('Prefix to use').setRequired(true).setMaxLength(5)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const prefix = interaction.options.getString('prefix', true);
      const settings = db.getSettings(interaction.guild.id);
      settings.prefix = prefix;
      db.saveSettings(interaction.guild.id, settings);
      const embed = successEmbed('✅ Prefix Set', 'Command prefix updated to `' + prefix + '`.' );
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
