'use strict';
const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { em, CATEGORY_COUNTS, getMenuOptions } = require('../../utils/helpData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the bot help menu'),

  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const CATS = [
        { label: 'Moderation', emojiId: 'hammer',    key: 'moderation', description: 'Ban, kick, mute, warn, purge & more' },
        { label: 'Security',   emojiId: 'shield',    key: 'security',   description: 'Antispam, antilink, antiraid & more'  },
        { label: 'Logging',    emojiId: 'clipboard', key: 'logging',    description: 'Log channels and event tracking'      },
        { label: 'Utility',    emojiId: 'wrench',    key: 'utility',    description: 'Info, snipe, ping, polls & more'      },
        { label: 'Config',     emojiId: 'gear',      key: 'config',     description: 'Automod settings, roles & bot setup'  },
      ];

      const totalCmds = Object.values(CATEGORY_COUNTS).reduce((n, c) => n + c, 0);

      const categoryGrid = CATS.map(c =>
        `${em(c.emojiId)} **${c.label}** \`${CATEGORY_COUNTS[c.key]} cmds\`\n╰ ${c.description}`
      ).join('\n\n');

      const embed = new EmbedBuilder()
        .setColor(0x2C2F6B)
        .setAuthor({
          name: `${client.user.username}  ·  Help Center`,
          iconURL: client.user.displayAvatarURL({ size: 128, extension: 'png' })
        })
        .setTitle('Warden v2.0')
        .setDescription(
          `> A powerful, modern moderation & security bot.\n> **${totalCmds} commands** across **${CATS.length} categories.**`
        )
        .addFields(
          { name: `${em('folder')}  Categories`, value: categoryGrid, inline: false },
          {
            name: `${em('zap')}  Quick Start`,
            value: [
              '`1`  Set your log channel with `/setlog`',
              '`2`  Enable automod with `/antispam`, `/antilink`, etc.',
              '`3`  Use `/settings` to review your configuration',
            ].join('\n'),
            inline: false,
          }
        )
        .setThumbnail(client.user.displayAvatarURL({ size: 256, extension: 'png' }))
        .setFooter({ text: `${client.user.username}  ·  Use the menu below to explore commands` })
        .setTimestamp();

      const menu = new StringSelectMenuBuilder()
        .setCustomId('help_menu')
        .setPlaceholder('Browse a category...')
        .addOptions(getMenuOptions());

      await interaction.editReply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    } catch (err) {
      console.error('[help] error:', err);
      const { errorEmbed } = require('../../utils/embedBuilder');
      const payload = { embeds: [errorEmbed(`${em('xmark')} Error`, 'An unexpected error occurred.')] };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  },
};
