'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nukewhitelist')
    .setDescription('Add a user or role to the anti-nuke whitelist')
    .addUserOption(opt => opt.setName('user').setDescription('User to whitelist').setRequired(false))
    .addRoleOption(opt => opt.setName('role').setDescription('Role to whitelist').setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');

      const target = user ? `<@${user.id}>` : `<@&${role.id}>`;

      await interaction.editReply({
        embeds: [successEmbed('✅ Whitelisted', `${target} added to anti-nuke whitelist.`)]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not add to whitelist.')]
      });
    }
  }
};
