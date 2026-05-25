'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logAction } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Set the server verification level')
    .addStringOption(o => o.setName('level').setDescription('Verification level').setRequired(true)
    .addChoices(
    { name: 'None',   value: 'NONE'    },
    { name: 'Low',    value: 'LOW'     },
    { name: 'Medium', value: 'MEDIUM'  },
    { name: 'High',   value: 'HIGH'    },
    { name: 'Very High', value: 'VERY_HIGH' }
    ))
  ,
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const guildId = interaction.guild.id;
      const levelMap = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 };
      const level = interaction.options.getString('level', true);
      await interaction.guild.setVerificationLevel(levelMap[level]);
      const embed = successEmbed('🔐 Verification Level Set', `Server verification level is now **${level.replace('_', ' ')}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
