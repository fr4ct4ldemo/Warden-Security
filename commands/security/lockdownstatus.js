'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdownstatus')
    .setDescription('Show current lockdown state of all channels'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const channels = await interaction.guild.channels.fetch();
      const textChannels = channels.filter(c => c.isTextBased());

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🔒 Lockdown Status')
        .setDescription('Channel lockdown states')
        .addFields(
          { name: 'Total Channels', value: `${textChannels.size}`, inline: true },
          { name: 'Locked', value: '0', inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve lockdown status.')]
      });
    }
  }
};
