'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('accountagegate')
    .setDescription('Set a minimum account age for new joins')
    .addIntegerOption(o => o.setName('minage').setDescription('Minimum account age in days').setRequired(true).setMinValue(0).setMaxValue(365))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const minAge = interaction.options.getInteger('minage', true);
      const settings = db.getSettings(guildId);
      settings.accountAgeGate = { enabled: minAge > 0, minAge };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('👶 Account Age Gate Updated', minAge > 0 ? `New accounts must be at least **${minAge}** days old.` : 'Account age gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
