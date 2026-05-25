'use strict';
const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { checkPermissions } = require('../../utils/permissionCheck');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Configure anti-nuke protection for your server')
    .addSubcommand(sub => sub
      .setName('enable')
      .setDescription('Enable anti-nuke protection')
      .addStringOption(o => o
        .setName('action')
        .setDescription('Punishment for nuke attempts (default: ban)')
        .setRequired(false)
        .addChoices(
          { name: 'Ban',        value: 'ban'   },
          { name: 'Kick',       value: 'kick'  },
          { name: 'Strip Roles', value: 'strip' }
        )
      )
    )
    .addSubcommand(sub => sub
      .setName('disable')
      .setDescription('Disable anti-nuke protection')
    )
    .addSubcommand(sub => sub
      .setName('thresholds')
      .setDescription('Set action thresholds that trigger anti-nuke')
      .addIntegerOption(o => o.setName('channel_delete').setDescription('Max channel deletes before trigger (default: 3)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('channel_create').setDescription('Max channel creates before trigger (default: 5)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('role_delete').setDescription('Max role deletes before trigger (default: 3)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('role_create').setDescription('Max role creates before trigger (default: 5)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('ban').setDescription('Max bans before trigger (default: 5)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('kick').setDescription('Max kicks before trigger (default: 5)').setMinValue(1).setMaxValue(20))
      .addIntegerOption(o => o.setName('webhook_create').setDescription('Max webhook creates before trigger (default: 3)').setMinValue(1).setMaxValue(20))
    )
    .addSubcommand(sub => sub
      .setName('whitelist')
      .setDescription('Whitelist a user or bot from anti-nuke checks')
      .addUserOption(o => o.setName('user').setDescription('User or bot to whitelist').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('unwhitelist')
      .setDescription('Remove a user from the anti-nuke whitelist')
      .addUserOption(o => o.setName('user').setDescription('User to remove from whitelist').setRequired(true))
    )
    .addSubcommand(sub => sub
      .setName('status')
      .setDescription('View current anti-nuke configuration')
    ),

  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const ok = await checkPermissions(interaction, ['Administrator']);
      if (!ok) return;

      const sub = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const settings = db.getSettings(guildId);
      if (!settings.antiNuke) settings.antiNuke = db.getAntiNukeDefaults();

      if (sub === 'enable') {
        const action = interaction.options.getString('action') ?? 'ban';
        settings.antiNuke.enabled = true;
        settings.antiNuke.action = action;
        db.saveSettings(guildId, settings);
        return interaction.editReply({ embeds: [successEmbed(
          '🛡️ Anti-Nuke Enabled',
          `Anti-nuke protection is now **active**.\nPunishment for nuke attempts: **${action}**.\n\nUse \`/antinuke thresholds\` to customize trigger limits.`
        )] });
      }

      if (sub === 'disable') {
        settings.antiNuke.enabled = false;
        db.saveSettings(guildId, settings);
        return interaction.editReply({ embeds: [errorEmbed(
          '🛡️ Anti-Nuke Disabled',
          'Anti-nuke protection has been turned **off**.'
        )] });
      }

      if (sub === 'thresholds') {
        const fields = [
          ['channel_delete', 'channelDelete'],
          ['channel_create', 'channelCreate'],
          ['role_delete',    'roleDelete'   ],
          ['role_create',    'roleCreate'   ],
          ['ban',            'ban'          ],
          ['kick',           'kick'         ],
          ['webhook_create', 'webhookCreate'],
        ];
        let changed = false;
        for (const [opt, key] of fields) {
          const val = interaction.options.getInteger(opt);
          if (val !== null) { settings.antiNuke.thresholds[key] = val; changed = true; }
        }
        if (!changed) return interaction.editReply({ embeds: [errorEmbed('❌ No Changes', 'You did not provide any threshold values to update.')] });
        db.saveSettings(guildId, settings);
        const t = settings.antiNuke.thresholds;
        return interaction.editReply({ embeds: [successEmbed(
          '⚙️ Anti-Nuke Thresholds Updated',
          'New trigger thresholds:',
          [
            { name: 'Channel Deletes', value: `\`${t.channelDelete}\``, inline: true },
            { name: 'Channel Creates', value: `\`${t.channelCreate}\``, inline: true },
            { name: 'Role Deletes',    value: `\`${t.roleDelete}\``,    inline: true },
            { name: 'Role Creates',    value: `\`${t.roleCreate}\``,    inline: true },
            { name: 'Bans',            value: `\`${t.ban}\``,           inline: true },
            { name: 'Kicks',           value: `\`${t.kick}\``,          inline: true },
            { name: 'Webhook Creates', value: `\`${t.webhookCreate}\``, inline: true },
          ]
        )] });
      }

      if (sub === 'whitelist') {
        const user = interaction.options.getUser('user');
        db.addAntiNukeWhitelist(guildId, user.id);
        return interaction.editReply({ embeds: [successEmbed(
          '✅ Whitelisted',
          `**${user.tag}** has been whitelisted from anti-nuke checks.`
        )] });
      }

      if (sub === 'unwhitelist') {
        const user = interaction.options.getUser('user');
        db.removeAntiNukeWhitelist(guildId, user.id);
        return interaction.editReply({ embeds: [successEmbed(
          '✅ Removed from Whitelist',
          `**${user.tag}** has been removed from the anti-nuke whitelist.`
        )] });
      }

      if (sub === 'status') {
        const an = settings.antiNuke;
        const t = an.thresholds;
        const wl = db.getAntiNukeWhitelist(guildId);
        return interaction.editReply({ embeds: [successEmbed(
          '🛡️ Anti-Nuke Status',
          `Status: **${an.enabled ? 'Enabled ✅' : 'Disabled ❌'}**\nPunishment: **${an.action}**`,
          [
            { name: 'Channel Deletes', value: `\`${t.channelDelete}\``, inline: true },
            { name: 'Channel Creates', value: `\`${t.channelCreate}\``, inline: true },
            { name: 'Role Deletes',    value: `\`${t.roleDelete}\``,    inline: true },
            { name: 'Role Creates',    value: `\`${t.roleCreate}\``,    inline: true },
            { name: 'Bans',            value: `\`${t.ban}\``,           inline: true },
            { name: 'Kicks',           value: `\`${t.kick}\``,          inline: true },
            { name: 'Webhook Creates', value: `\`${t.webhookCreate}\``, inline: true },
            { name: 'Whitelisted Users', value: wl.length ? wl.map(id => `<@${id}>`).join(', ') : 'None', inline: false },
          ]
        )] });
      }

    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });
    }
  }
};
