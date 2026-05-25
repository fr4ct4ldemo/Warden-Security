'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antizalgo')
    .setDescription('Enable or disable anti-zalgo detection')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['ManageGuild']);
      if (!ok) return;
      const enabled = interaction.options.getBoolean('enabled', true);
      const settings = db.getSettings(interaction.guild.id);
      settings.antiZalgo = { enabled };
      db.saveSettings(interaction.guild.id, settings);
      const embed = successEmbed(enabled ? '🛡️ Anti-Zalgo Enabled' : 'Anti-Zalgo Disabled', enabled ? 'Zalgo text will now be blocked.' : 'Zalgo detection has been disabled.');
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
