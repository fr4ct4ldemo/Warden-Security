'use strict';
const {
  ActionRowBuilder, StringSelectMenuBuilder,
  ButtonBuilder, ButtonStyle,
  EmbedBuilder, PermissionFlagsBits, MessageFlags
} = require('discord.js');
const { errorEmbed, successEmbed } = require('../utils/embedBuilder');
const db = require('../utils/database');
const {
  em, eid, CATEGORY_COUNTS, CATEGORY_DETAILS, PAGE_TOPICS, getMenuOptions
} = require('../utils/helpData');

const HELP_MENU_ID     = 'help_menu';
const VERIFY_BUTTON_ID = 'verify_button';

// ─── Embed builders ───────────────────────────────────────────────────────────

function buildHomeEmbed(client) {
  const CATS = [
    { label: 'Moderation', emojiId: 'hammer',    key: 'moderation', description: 'Ban, kick, mute, warn, purge & more' },
    { label: 'Security',   emojiId: 'shield',    key: 'security',   description: 'Antispam, antilink, antiraid & more'  },
    { label: 'Logging',    emojiId: 'clipboard', key: 'logging',    description: 'Log channels and event tracking'      },
    { label: 'Utility',    emojiId: 'wrench',    key: 'utility',    description: 'Info, snipe, ping, polls & more'      },
    { label: 'Config',     emojiId: 'gear',      key: 'config',     description: 'Automod settings, roles & bot setup'  },
  ];
  const totalCmds    = Object.values(CATEGORY_COUNTS).reduce((a, b) => a + b, 0);
  const categoryGrid = CATS.map(c =>
    `${em(c.emojiId)} **${c.label}** \`${CATEGORY_COUNTS[c.key]} cmds\`\n\u256f ${c.description}`
  ).join('\n\n');

  return new EmbedBuilder()
    .setColor(0x2C2F6B)
    .setAuthor({
      name: `${client.user.username}  ·  Help Center`,
      iconURL: client.user.displayAvatarURL({ size: 128, extension: 'png' }),
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
}

function buildCategoryEmbed(key, page, client) {
  const cat = CATEGORY_DETAILS[key];
  if (!cat) return null;

  const pages      = cat.pages;
  const pageIndex  = Math.max(0, Math.min(page, pages.length - 1));
  const commands   = pages[pageIndex];
  const topics     = PAGE_TOPICS[key];
  const topicLabel = topics?.[pageIndex]
    ? `  ·  ${topics[pageIndex]}`
    : (pages.length > 1 ? `  ·  Page ${pageIndex + 1}` : '');

  const FIELD_LIMIT = 1024;
  const MAX_FIELDS  = 25;
  const fields      = [];
  let chunk         = '';
  let isFirst       = true;

  for (const [cmd, desc] of commands) {
    const line = `${cmd}  —  ${desc}\n`;
    if (chunk.length + line.length > FIELD_LIMIT || fields.length >= MAX_FIELDS - 1) {
      if (chunk) {
        fields.push({ name: isFirst ? `${em('scroll')}  Commands` : '\u200b', value: chunk.trimEnd(), inline: false });
        chunk   = '';
        isFirst = false;
      }
    }
    chunk += line;
  }
  if (chunk) {
    fields.push({ name: isFirst ? `${em('scroll')}  Commands` : '\u200b', value: chunk.trimEnd(), inline: false });
  }

  const footerText = pages.length > 1
    ? `Page ${pageIndex + 1} of ${pages.length}  ·  Use the arrows to flip pages`
    : 'Use the menu below to switch categories';

  return new EmbedBuilder()
    .setColor(0x2C2F6B)
    .setAuthor({
      name: `${client.user.username}  ·  Help Center`,
      iconURL: client.user.displayAvatarURL({ size: 128, extension: 'png' }),
    })
    .setTitle(`${cat.emoji}  ${cat.title}${topicLabel}`)
    .setDescription(`-# ${cat.description}  ·  **${CATEGORY_COUNTS[key]} commands**`)
    .addFields(...fields)
    .setFooter({ text: footerText })
    .setTimestamp();
}

// ─── Component builders ───────────────────────────────────────────────────────

function buildMenuRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(HELP_MENU_ID)
    .setPlaceholder('Browse a category...')
    .addOptions(getMenuOptions());
  return new ActionRowBuilder().addComponents(menu);
}

function buildNavRow(key, page, totalPages) {
  if (totalPages <= 1) return null;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`help_prev:${key}:${page}`)
      .setLabel('◀  Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`help_page:${key}:${page}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`help_next:${key}:${page}`)
      .setLabel('Next  ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1)
  );
}

function buildComponents(key, page, totalPages) {
  const rows = [buildMenuRow()];
  const nav  = buildNavRow(key, page, totalPages);
  if (nav) rows.unshift(nav);
  return rows;
}

// ─── Error reply helper ───────────────────────────────────────────────────────

async function replyError(interaction, title, description) {
  const payload = { embeds: [errorEmbed(title, description)], flags: MessageFlags.Ephemeral };
  if (interaction.deferred || interaction.replied) return interaction.editReply(payload).catch(() => null);
  return interaction.reply(payload).catch(() => null);
}

// ─── Event handler ────────────────────────────────────────────────────────────

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    try {

      // ── Help dropdown ──────────────────────────────────────────────────────
      if (interaction.isStringSelectMenu() && interaction.customId === HELP_MENU_ID) {
        const val = interaction.values[0];
        if (val === 'home') {
          await interaction.update({ embeds: [buildHomeEmbed(client)], components: [buildMenuRow()] });
          return;
        }
        const cat   = CATEGORY_DETAILS[val];
        const embed = buildCategoryEmbed(val, 0, client);
        await interaction.update({
          embeds: [embed ?? new EmbedBuilder().setColor(0x2C2F6B).setDescription('Unknown category.')],
          components: buildComponents(val, 0, cat?.pages.length ?? 1),
        });
        return;
      }

      // ── Help page buttons ──────────────────────────────────────────────────
      if (interaction.isButton()) {
        const id = interaction.customId;
        if (id.startsWith('help_prev:') || id.startsWith('help_next:')) {
          const parts       = id.split(':');
          const action      = parts[0];
          const key         = parts[1];
          const currentPage = parseInt(parts[2], 10);
          const cat         = CATEGORY_DETAILS[key];
          if (!cat) return;
          const newPage = action === 'help_prev' ? currentPage - 1 : currentPage + 1;
          const clamped = Math.max(0, Math.min(newPage, cat.pages.length - 1));
          await interaction.update({
            embeds: [buildCategoryEmbed(key, clamped, client)],
            components: buildComponents(key, clamped, cat.pages.length),
          });
          return;
        }

        // ── Verify button ────────────────────────────────────────────────────
        if (id === VERIFY_BUTTON_ID) {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
          if (!interaction.guild) return replyError(interaction, 'Guild Missing', 'This must be used in a server.');

          const vs = db.getVerificationSettings(interaction.guild.id);
          if (!vs?.enabled || !vs.role_id)
            return replyError(interaction, 'Verification Disabled', 'Verification is not configured for this server.');

          const role = interaction.guild.roles.cache.get(vs.role_id)
            ?? await interaction.guild.roles.fetch(vs.role_id).catch(() => null);
          if (!role) return replyError(interaction, 'Role Missing', 'The verification role could not be found.');

          if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles))
            return replyError(interaction, 'Missing Permissions', 'I need Manage Roles to assign the verification role.');

          if (interaction.member.roles.cache.has(role.id))
            return interaction.editReply({ embeds: [successEmbed('Already Verified', 'You already have the verification role.')], flags: MessageFlags.Ephemeral });

          await interaction.member.roles.add(role, 'Verification button').catch(() => null);
          return interaction.editReply({
            embeds: [successEmbed(`${em('checkmark')} Verified!`, `You have been assigned **${role.name}**.`)],
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      // ── Slash commands ─────────────────────────────────────────────────────
      if (!interaction.isChatInputCommand()) return;
      const command = client.commands.get(interaction.commandName);
      if (!command) return replyError(interaction, 'Unknown Command', 'This command is unavailable.');
      await command.execute(interaction, client);

    } catch (err) {
      console.error('[interactionCreate] failed:', err);
      if (interaction.isRepliable?.())
        await replyError(interaction, `${em('xmark')} Unexpected Error`, 'An internal error occurred. Please try again.');
    }
  },
};
