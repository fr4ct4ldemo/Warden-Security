'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a simple poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('First option').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Second option').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Third option'))
    .addStringOption(o => o.setName('option4').setDescription('Fourth option')),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const question = interaction.options.getString('question', true);
      const options = [
        interaction.options.getString('option1', true),
        interaction.options.getString('option2', true)
      ];
      const option3 = interaction.options.getString('option3');
      const option4 = interaction.options.getString('option4');
      if (option3) options.push(option3);
      if (option4) options.push(option4);
      const emojiOptions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
      const description = options.map((opt, index) => `${emojiOptions[index]} ${opt}`).join('\n');
      const embed = successEmbed(`📊 ${question}`, description);
      await interaction.editReply({ embeds: [embed] });
      const message = await interaction.fetchReply();
      for (let i = 0; i < options.length; i += 1) {
        await message.react(emojiOptions[i]).catch(() => null);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
