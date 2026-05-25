'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ghostping')
    .setDescription('Detect and log ghost pings (mention then delete)')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true))
    .addChannelOption(o => o.setName('logchannel').setDescription('Channel to send ghost ping alerts'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const enabled = interaction.options.getBoolean('enabled', true);
      const logChannel = interaction.options.getChannel('logchannel');
      settings.ghostPing = { enabled, logChannelId: logChannel?.id ?? settings.ghostPing?.logChannelId ?? null };
      db.saveSettings(guildId, settings);
      const embed = enabled
      ? successEmbed('👻 Ghost Ping Detection Enabled', `Ghost pings will be detected and logged${logChannel ? ` in ${logChannel}` : ''}.`)
      : errorEmbed('Ghost Ping Detection Disabled', 'Ghost ping detection has been turned off.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
