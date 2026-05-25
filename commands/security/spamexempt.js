'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spamexempt')
    .setDescription('Exempt a role or channel from antispam')
    .addRoleOption(opt => opt.setName('role').setDescription('Role to exempt').setRequired(false))
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to exempt').setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const role = interaction.options.getRole('role');
      const channel = interaction.options.getChannel('channel');

      const target = role ? `<@&${role.id}>` : `<#${channel.id}>`;

      await interaction.editReply({
        embeds: [successEmbed('✅ Exempted', `${target} exempted from antispam.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not exempt from antispam.')]
      });
    }
  }
};
