'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');
const { logAction } = require('../../utils/logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('webhookpurge')
    .setDescription('Delete all webhooks in a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to purge webhooks from'))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      if (!channel?.isTextBased?.()) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel is not a text channel.')] });
      const hooks = await channel.fetchWebhooks();
      let deleted = 0;
      for (const [, hook] of hooks) {
        try { await hook.delete('Webhook purge command'); deleted++; } catch {}
      }
      const embed = successEmbed('🗑️ Webhook Purge Complete', `Deleted **${deleted}** webhook(s) in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
