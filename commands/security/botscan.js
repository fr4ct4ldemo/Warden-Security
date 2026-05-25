'use strict';
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botscan')
    .setDescription('List all bots in the server with join dates'),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const bots = await interaction.guild.members.fetch().then(m => m.filter(mb => mb.user.bot));
      
      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setTitle('🤖 Bot List')
        .setDescription(`Total bots: ${bots.size}`)
        .addFields(
          { name: 'Sample Bots', value: bots.size > 0 ? `${bots.first().user.tag}` : 'No bots found', inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        embeds: [errorEmbed('❌ Error', 'Could not retrieve bot list.')]
      });
    }
  }
};
