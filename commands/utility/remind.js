'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder that will DM you')
    .addIntegerOption(o => o.setName('minutes').setDescription('Minutes until reminder').setRequired(true).setMinValue(1).setMaxValue(1440))
    .addStringOption(o => o.setName('text').setDescription('Reminder text').setRequired(true)),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const minutes = interaction.options.getInteger('minutes', true);
      const text = interaction.options.getString('text', true);
      const embed = successEmbed('⏰ Reminder Set', `I will remind you in **${minutes}** minute(s).`);
      await interaction.editReply({ embeds: [embed] });
      setTimeout(async () => {
        const reminderEmbed = successEmbed('⏰ Reminder', text);
        try {
          await interaction.user.send({ embeds: [reminderEmbed] });
        } catch (error) {
          await interaction.channel.send({ content: `<@${interaction.user.id}>`, embeds: [reminderEmbed] }).catch(() => null);
        }
      }, minutes * 60000);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
