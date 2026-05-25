'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('attachmentfilter')
    .setDescription('Block specific file extension types from being uploaded')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addStringOption(o => o.setName('extensions').setDescription('Comma-separated extensions to block e.g. exe,bat,sh,ps1'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const raw = interaction.options.getString('extensions') || 'exe,bat,cmd,sh,ps1,vbs,msi,jar,scr';
      const extensions = raw.split(',').map(e => e.trim().toLowerCase().replace(/^\./, '')).filter(Boolean);
      settings.attachmentFilter = { enabled, extensions };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('📎 Attachment Filter Enabled', `Blocked extensions: \`${extensions.join(', ')}\``)
      : errorEmbed('Attachment Filter Disabled', 'Attachment filter has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
