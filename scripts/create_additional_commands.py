from pathlib import Path

ROOT = Path(r'c:\Users\Admin\OneDrive\Documents\project2.0')
MOD_DIR = ROOT / 'commands' / 'moderation'
SEC_DIR = ROOT / 'commands' / 'security'

commands = [
    {
        'path': MOD_DIR / 'auditlog.js',
        'name': 'auditlog',
        'description': 'View recent guild audit log entries',
        'body': """
      const limit = interaction.options.getInteger('limit') ?? 10;
      const target = interaction.options.getUser('user');
      const logs = await interaction.guild.fetchAuditLogs({ limit });
      const entries = Array.from(logs.entries.values())
        .filter(entry => !target || entry.targetId === target.id)
        .slice(0, limit)
        .map((entry, index) => {
          const targetText = entry.target ? ` — ${entry.target}` : '';
          const executor = entry.executor ? entry.executor.tag : 'Unknown';
          return `**${index + 1}.** ${entry.action}${targetText} — ${executor}`;
        });
      const text = entries.length ? entries.join('\n') : 'No audit log entries found.';
      const embed = successEmbed('🧾 Audit Log', text.slice(0, 4000));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'pinmessage.js',
        'name': 'pinmessage',
        'description': 'Pin a message by ID in a channel',
        'body': """
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const messageId = interaction.options.getString('messageid', true);
      if (!channel?.isTextBased?.() ) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel cannot contain messages.')] });
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Message not found.') ] });
      await message.pin();
      const embed = successEmbed('📌 Message Pinned', `Message **${message.id}** in ${channel} was pinned.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'unpinmessage.js',
        'name': 'unpinmessage',
        'description': 'Unpin a message by ID in a channel',
        'body': """
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const messageId = interaction.options.getString('messageid', true);
      if (!channel?.isTextBased?.() ) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel cannot contain messages.')] });
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Message not found.') ] });
      await message.unpin();
      const embed = successEmbed('📌 Message Unpinned', `Message **${message.id}** in ${channel} was unpinned.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'userinfo.js',
        'name': 'userinfo',
        'description': 'Show moderation info for a user',
        'body': """
      const user = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const warnings = db.countWarnings(guildId, user.id);
      const roleCount = member ? member.roles.cache.size - 1 : 0;
      const embed = successEmbed(`👤 User Info — ${user.tag}`, [
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Join Date', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Not in server', inline: true },
        { name: 'Roles', value: `${roleCount}`, inline: true },
        { name: 'Warnings', value: `${warnings}`, inline: true }
      ].map(f => typeof f === 'string' ? f : f));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'caseview.js',
        'name': 'caseview',
        'description': 'View a specific moderation case by warning case ID',
        'body': """
      const caseId = interaction.options.getInteger('caseid', true);
      const entry = db.getWarningById(guildId, caseId);
      if (!entry) return interaction.editReply({ embeds: [errorEmbed('❌ Error', `Case #${caseId} was not found.`)] });
      const embed = successEmbed(`📁 Case #${caseId}`, entry.reason, [
        { name: 'User ID', value: entry.user_id, inline: true },
        { name: 'Moderator', value: entry.moderator_tag, inline: true },
        { name: 'Timestamp', value: `<t:${Math.floor(entry.timestamp / 1000)}:f>`, inline: true }
      ]);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'caselog.js',
        'name': 'caselog',
        'description': 'Show warning case history for a user',
        'body': """
      const user = interaction.options.getUser('user', true);
      const warnings = db.getWarnings(guildId, user.id);
      if (!warnings.length) return interaction.editReply({ embeds: [errorEmbed('❌ Error', `No cases found for ${user.tag}.`)] });
      const list = warnings.map((w, i) => `**#${i + 1}** — <t:${Math.floor(w.timestamp / 1000)}:f> — ${w.reason} (${w.moderator_tag})`).join('\n').slice(0, 4000);
      const embed = successEmbed(`📚 Case Log — ${user.tag}`, list);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'warnthreshold.js',
        'name': 'warnthreshold',
        'description': 'Configure auto punishment for warning thresholds',
        'body': """
      const count = interaction.options.getInteger('count', true);
      const punishment = interaction.options.getString('punishment', true);
      db.setWarnPunishment(guildId, count, punishment);
      const embed = successEmbed('⚙️ Warn Threshold Updated', `Set warning threshold **${count}** to apply **${punishment}**.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'mutedlist.js',
        'name': 'mutedlist',
        'description': 'List members currently using the muted role',
        'body': """
      const roleId = db.getMutedRole(guildId);
      if (!roleId) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Mute role is not configured for this server.')] });
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Configured muted role no longer exists.')] });
      const members = await interaction.guild.members.fetch();
      const muted = members.filter(m => m.roles.cache.has(role.id));
      const list = muted.size ? muted.map(m => m.user.tag).slice(0, 50).join('\n') : 'None';
      const embed = successEmbed(`🔇 Muted Members (${muted.size})`, list.slice(0, 4000));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'dmjoin.js',
        'name': 'dmjoin',
        'description': 'Configure welcome direct messages for new members',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const message = interaction.options.getString('message') || '';
      const settings = db.getSettings(guildId);
      settings.joinDM = { enabled, message };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('📩 Join DM Updated', enabled ? 'New members will receive a DM on join.' : 'Join DMs have been disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'moveallafk.js',
        'name': 'moveallafk',
        'description': 'Move all connected voice members to the AFK channel',
        'body': """
      const members = await interaction.guild.members.fetch();
      const afkChannel = interaction.guild.afkChannel;
      if (!afkChannel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'Server does not have an AFK channel configured.')] });
      let count = 0;
      for (const [, member] of members) {
        if (member.voice?.channel && member.voice.channel.id !== afkChannel.id) {
          try {
            await member.voice.setChannel(afkChannel, 'Moved to AFK by moderator');
            count++;
          } catch {}
        }
      }
      const embed = successEmbed('🛌 AFK Move Complete', `Moved **${count}** voice member(s) to ${afkChannel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'announce.js',
        'name': 'announce',
        'description': 'Send a server announcement to a channel',
        'body': """
      const channel = interaction.options.getChannel('channel', true);
      const message = interaction.options.getString('message', true);
      if (!channel.isTextBased()) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel does not support messages.')] });
      await channel.send({ content: message });
      const embed = successEmbed('📣 Announcement Sent', `Announcement posted in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'joinage.js',
        'name': 'joinage',
        'description': 'Require new accounts to be a minimum age before joining',
        'body': """
      const minAge = interaction.options.getInteger('minage', true);
      const settings = db.getSettings(guildId);
      settings.joinAge = { enabled: minAge > 0, minAge };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🕒 Join Age Filter Updated', minAge > 0 ? `New accounts must be at least **${minAge}** days old.` : 'Join age filter is disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'rolecleanup.js',
        'name': 'rolecleanup',
        'description': 'Remove a role from all members who currently have it',
        'body': """
      const role = interaction.options.getRole('role', true);
      const members = await interaction.guild.members.fetch();
      let count = 0;
      for (const [, member] of members.filter(m => m.roles.cache.has(role.id))) {
        try {
          await member.roles.remove(role, 'Role cleanup executed');
          count++;
        } catch {}
      }
      const embed = successEmbed('🧹 Role Cleanup Complete', `Removed **${role.name}** from **${count}** member(s).`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': MOD_DIR / 'nicknamehistory.js',
        'name': 'nicknamehistory',
        'description': 'Show recent nickname changes for a user',
        'body': """
      const user = interaction.options.getUser('user') || interaction.user;
      const logs = await interaction.guild.fetchAuditLogs({ limit: 50 });
      const changes = Array.from(logs.entries.values())
        .filter(entry => entry.targetId === user.id && entry.changes?.some(change => change.key === 'nick'))
        .map(entry => {
          const change = entry.changes.find(c => c.key === 'nick');
          return `**${entry.executor?.tag ?? 'Unknown'}** — ${change.old ?? 'None'} → ${change.new ?? 'None'} (<t:${Math.floor(entry.createdTimestamp / 1000)}:f>)`;
        });
      if (!changes.length) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'No nickname history found for that user.')] });
      const embed = successEmbed(`📝 Nickname History — ${user.tag}`, changes.join('\n').slice(0, 4000));
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'honeypot.js',
        'name': 'honeypot',
        'description': 'Configure a honeypot channel for security monitoring',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const settings = db.getSettings(guildId);
      if (enabled && !channel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'A honeypot channel must be provided when enabling.')] });
      settings.honeypot = { enabled, channelId: channel?.id ?? settings.honeypot?.channelId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🐝 Honeypot Updated', enabled ? `Honeypot channel set to ${channel}.` : 'Honeypot monitoring disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'botgate.js',
        'name': 'botgate',
        'description': 'Require a role assignment for new bots or users to pass gate checks',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const role = interaction.options.getRole('role');
      const settings = db.getSettings(guildId);
      if (enabled && !role) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'A gate role must be provided when enabling bot gate.')] });
      settings.botGate = { enabled, roleId: role?.id ?? settings.botGate?.roleId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🤖 Bot Gate Updated', enabled ? `Gate role set to **${role.name}**.` : 'Bot gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'channellockdown.js',
        'name': 'channellockdown',
        'description': 'Lock or unlock a single channel for everyone',
        'body': """
      const channel = interaction.options.getChannel('channel', true);
      const action = interaction.options.getString('action', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const everyone = interaction.guild.roles.everyone;
      await channel.permissionOverwrites.edit(everyone, { SendMessages: action === 'lock' ? false : null }, { reason: `${action === 'lock' ? 'Lock' : 'Unlock'} by ${interaction.user.tag}: ${reason}` });
      const embed = successEmbed(action === 'lock' ? '🔒 Channel Locked' : '🔓 Channel Unlocked', `${channel} has been ${action === 'lock' ? 'locked' : 'unlocked'}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'webhookpurge.js',
        'name': 'webhookpurge',
        'description': 'Delete all webhooks in a channel',
        'body': """
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      if (!channel?.isTextBased?.()) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'That channel is not a text channel.')] });
      const hooks = await channel.fetchWebhooks();
      let deleted = 0;
      for (const [, hook] of hooks) {
        try { await hook.delete('Webhook purge command'); deleted++; } catch {}
      }
      const embed = successEmbed('🗑️ Webhook Purge Complete', `Deleted **${deleted}** webhook(s) in ${channel}.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'trustedroles.js',
        'name': 'trustedroles',
        'description': 'Add or remove a trusted role for security bypass checks',
        'body': """
      const role = interaction.options.getRole('role', true);
      const action = interaction.options.getString('action', true);
      const settings = db.getSettings(guildId);
      settings.trustedRoles = settings.trustedRoles || [];
      if (action === 'add') {
        if (!settings.trustedRoles.includes(role.id)) settings.trustedRoles.push(role.id);
      } else {
        settings.trustedRoles = settings.trustedRoles.filter(id => id !== role.id);
      }
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🛡️ Trusted Roles Updated', `Role **${role.name}** was ${action === 'add' ? 'added to' : 'removed from'} trusted roles.`);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'captchagate.js',
        'name': 'captchagate',
        'description': 'Enable or disable a CAPTCHA gate for new members',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const settings = db.getSettings(guildId);
      settings.captchaGate = { enabled, channelId: channel?.id ?? settings.captchaGate?.channelId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🔐 CAPTCHA Gate Updated', enabled ? `CAPTCHA gate is enabled${channel ? ` in ${channel}` : ''}.` : 'CAPTCHA gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'suspiciouslink.js',
        'name': 'suspiciouslink',
        'description': 'Configure suspicious link reporting behavior',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const action = interaction.options.getString('action', true);
      const settings = db.getSettings(guildId);
      settings.suspiciousLink = { enabled, action };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🔗 Suspicious Link Updated', enabled ? `Reporter set to **${action}**.` : 'Suspicious link reporting disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'accountagegate.js',
        'name': 'accountagegate',
        'description': 'Set a minimum account age for new joins',
        'body': """
      const minAge = interaction.options.getInteger('minage', true);
      const settings = db.getSettings(guildId);
      settings.accountAgeGate = { enabled: minAge > 0, minAge };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('👶 Account Age Gate Updated', minAge > 0 ? `New accounts must be at least **${minAge}** days old.` : 'Account age gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'backupsettings.js',
        'name': 'backupsettings',
        'description': 'View current security and moderation settings backup',
        'body': """
      const settings = db.getSettings(guildId);
      const text = JSON.stringify(settings, null, 2).slice(0, 4000);
      const embed = successEmbed('💾 Settings Backup', `\`\`\`${text}\`\`\``);
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'joinreaction.js',
        'name': 'joinreaction',
        'description': 'Configure a reaction-based join gate',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const messageId = interaction.options.getString('messageid');
      const settings = db.getSettings(guildId);
      if (enabled && !channel) return interaction.editReply({ embeds: [errorEmbed('❌ Error', 'A channel is required when enabling join reaction gate.')] });
      settings.joinReactionGate = { enabled, channelId: channel?.id ?? settings.joinReactionGate?.channelId, messageId: messageId ?? settings.joinReactionGate?.messageId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('✅ Join Reaction Updated', enabled ? `Join reaction gate configured for ${channel}.` : 'Join reaction gate disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'nukeprotection.js',
        'name': 'nukeprotection',
        'description': 'Enable or disable basic nuke protection settings',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const action = interaction.options.getString('action', true);
      const settings = db.getSettings(guildId);
      settings.nukeProtection = { enabled, action };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🚨 Nuke Protection Updated', enabled ? `Auto action set to **${action}**.` : 'Nuke protection disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    },
    {
        'path': SEC_DIR / 'permissionlock.js',
        'name': 'permissionlock',
        'description': 'Lock or unlock channel permission changes for everyone',
        'body': """
      const enabled = interaction.options.getBoolean('enabled', true);
      const channel = interaction.options.getChannel('channel');
      const settings = db.getSettings(guildId);
      settings.permissionLock = { enabled, channelId: channel?.id ?? settings.permissionLock?.channelId };
      db.saveSettings(guildId, settings);
      const embed = successEmbed('🔐 Permission Lock Updated', enabled ? `Permission lock enabled${channel ? ` for ${channel}` : ''}.` : 'Permission lock disabled.');
      await interaction.editReply({ embeds: [embed] });
      return logAction(client, guildId, embed);
"""
    }
]

base_import = "'use strict';\nconst { SlashCommandBuilder } = require('discord.js');\nconst db = require('../../utils/database');\nconst { successEmbed, errorEmbed } = require('../../utils/embedBuilder');\nconst { checkPermissions } = require('../../utils/permissionCheck');\nconst { logAction } = require('../../utils/logger');\n\n"

for cmd in commands:
    lines = [base_import, 'module.exports = {', '  data: new SlashCommandBuilder()']
    lines.append(f"    .setName('{cmd['name']}')")
    lines.append(f"    .setDescription('{cmd['description']}')")
    if cmd['name'] == 'auditlog':
        lines.append("    .addIntegerOption(o => o.setName('limit').setDescription('How many entries to show').setMinValue(1).setMaxValue(25))")
        lines.append("    .addUserOption(o => o.setName('user').setDescription('Filter audit log by user'))")
    elif cmd['name'] in ('pinmessage','unpinmessage'):
        lines.append("    .addStringOption(o => o.setName('messageid').setDescription('Message ID to pin/unpin').setRequired(true))")
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel containing the message'))")
    elif cmd['name'] == 'userinfo':
        lines.append("    .addUserOption(o => o.setName('user').setDescription('User to inspect'))")
    elif cmd['name'] == 'caseview':
        lines.append("    .addIntegerOption(o => o.setName('caseid').setDescription('Warning case ID').setRequired(true).setMinValue(1))")
    elif cmd['name'] == 'caselog':
        lines.append("    .addUserOption(o => o.setName('user').setDescription('User whose case log to view').setRequired(true))")
    elif cmd['name'] == 'warnthreshold':
        lines.append("    .addIntegerOption(o => o.setName('count').setDescription('Warning count threshold').setRequired(true).setMinValue(1))")
        lines.append("    .addStringOption(o => o.setName('punishment').setDescription('Punishment to apply').setRequired(true).addChoices({ name: 'Mute', value: 'mute' }, { name: 'Kick', value: 'kick' }, { name: 'Ban', value: 'ban' }, { name: 'None', value: 'none' }))")
    elif cmd['name'] == 'mutedlist':
        pass
    elif cmd['name'] == 'dmjoin':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable join DM').setRequired(true))")
        lines.append("    .addStringOption(o => o.setName('message').setDescription('Welcome DM message'))")
    elif cmd['name'] == 'moveallafk':
        pass
    elif cmd['name'] == 'announce':
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel for announcement').setRequired(true))")
        lines.append("    .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true))")
    elif cmd['name'] == 'joinage':
        lines.append("    .addIntegerOption(o => o.setName('minage').setDescription('Minimum account age in days').setRequired(true).setMinValue(0).setMaxValue(365))")
    elif cmd['name'] == 'rolecleanup':
        lines.append("    .addRoleOption(o => o.setName('role').setDescription('Role to remove from all members').setRequired(true))")
    elif cmd['name'] == 'nicknamehistory':
        lines.append("    .addUserOption(o => o.setName('user').setDescription('User to inspect nickname history'))")
    elif cmd['name'] == 'honeypot':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable honeypot').setRequired(true))")
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Honeypot channel to monitor'))")
    elif cmd['name'] == 'botgate':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable bot gate').setRequired(true))")
        lines.append("    .addRoleOption(o => o.setName('role').setDescription('Role assigned when gate passes'))")
    elif cmd['name'] == 'channellockdown':
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock or unlock').setRequired(true))")
        lines.append("    .addStringOption(o => o.setName('action').setDescription('Lock or unlock').setRequired(true).addChoices({ name: 'Lock', value: 'lock' }, { name: 'Unlock', value: 'unlock' }))")
        lines.append("    .addStringOption(o => o.setName('reason').setDescription('Reason for action'))")
    elif cmd['name'] == 'webhookpurge':
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel to purge webhooks from'))")
    elif cmd['name'] == 'trustedroles':
        lines.append("    .addRoleOption(o => o.setName('role').setDescription('Trusted role to manage').setRequired(true))")
        lines.append("    .addStringOption(o => o.setName('action').setDescription('Add or remove').setRequired(true).addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }))")
    elif cmd['name'] == 'captchagate':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable captcha gate').setRequired(true))")
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel used for captcha verification'))")
    elif cmd['name'] == 'suspiciouslink':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable suspicious link reporter').setRequired(true))")
        lines.append("    .addStringOption(o => o.setName('action').setDescription('Action for suspicious links').setRequired(true).addChoices({ name: 'Delete', value: 'delete' }, { name: 'Flag', value: 'flag' }))")
    elif cmd['name'] == 'accountagegate':
        lines.append("    .addIntegerOption(o => o.setName('minage').setDescription('Minimum account age in days').setRequired(true).setMinValue(0).setMaxValue(365))")
    elif cmd['name'] == 'backupsettings':
        pass
    elif cmd['name'] == 'joinreaction':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable join reaction gate').setRequired(true))")
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel containing the gate message'))")
        lines.append("    .addStringOption(o => o.setName('messageid').setDescription('Message ID used for reaction gate'))")
    elif cmd['name'] == 'nukeprotection':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable nuke protection').setRequired(true))")
        lines.append("    .addStringOption(o => o.setName('action').setDescription('Action when nuke activity is detected').setRequired(true).addChoices({ name: 'Ban', value: 'ban' }, { name: 'Kick', value: 'kick' }, { name: 'Alert', value: 'alert' }))")
    elif cmd['name'] == 'permissionlock':
        lines.append("    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable permission lock').setRequired(true))")
        lines.append("    .addChannelOption(o => o.setName('channel').setDescription('Channel to lock permissions for'))")
    lines.append('  ,')
    lines.append('  async execute(interaction, client) {')
    lines.append('    try {')
    lines.append('      await interaction.deferReply();')
    lines.append('      const guildId = interaction.guild.id;')
    lines.append(cmd['body'].rstrip())
    lines.append('    } catch (err) {')
    lines.append('      console.error(err);')
    lines.append("      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });")
    lines.append('    }')
    lines.append('  }')
    lines.append('};')
    content = '\n'.join(lines).replace('\n      const', '\n      const').replace('\n      await', '\n      await')
    cmd['path'].write_text(content + '\n', encoding='utf-8')
    print('Created', cmd['path'])
