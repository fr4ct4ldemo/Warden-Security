'use strict';
const fs   = require('fs');
const path = require('path');

// ─── Emoji IDs ────────────────────────────────────────────────────────────────
// Pre-seeded from disk cache so emojis work immediately on restart.
// emojiSync.js overwrites these with live IDs after the bot is ready.
const CACHE_FILE = path.join(__dirname, '..', 'data', 'emoji-cache.json');
function loadCachedIds() {
  try {
    if (fs.existsSync(CACHE_FILE)) return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch { /* ignore */ }
  return {};
}
const _cached = loadCachedIds();

const E = {
  home:      _cached.home      || '',
  hammer:    _cached.hammer    || '',
  shield:    _cached.shield    || '',
  clipboard: _cached.clipboard || '',
  wrench:    _cached.wrench    || '',
  gear:      _cached.gear      || '',
  folder:    _cached.folder    || '',
  zap:       _cached.zap       || '',
  scroll:    _cached.scroll    || '',
  checkmark: _cached.checkmark || '',
  xmark:     _cached.xmark     || '',
};

// em() and eid() are FUNCTIONS — called at render time, not at load time.
// This ensures emoji IDs are always read after emojiSync has populated E.
const em  = (name) => E[name] ? `<:${name}:${E[name]}>` : '❓';
const eid = (name) => E[name] ? { id: E[name] } : { name: '❓' };

// ─── Command counts ────────────────────────────────────────────────────────────
const CATEGORY_COUNTS = {
  moderation: 103,
  security:   115,
  logging:    6,
  utility:    17,
  config:     9,
};

// ─── Page topic labels ─────────────────────────────────────────────────────────
const PAGE_TOPICS = {
  moderation: [
    'Bans & Punishments',
    'Cases, Notes & History',
    'Roles & Channels',
    'Voice, Purge & Server',
  ],
  security: [
    'Automod Core',
    'Gates & Filters',
    'Threat Detection',
    'Anti-Bot & Verification',
    'Account & Join Screening',
    'Channel & Permission Guards',
    'Anti-Nuke & Integrity',
    'Spam & Flood Control',
    'Link & Content Filtering',
    'Raid & Lockdown',
  ],
};

// ─── Full command listings ─────────────────────────────────────────────────────
// NOTE: category emoji strings (em('hammer') etc.) are computed lazily via getters
// so they always reflect the current E values at render time.
const CATEGORY_DETAILS = {
  moderation: {
    get emoji() { return em('hammer'); },
    title: 'Moderation Commands',
    description: 'Manage members and keep your server in order.',
    pages: [
      // Page 1 — Bans & Punishments
      [
        ['`/ban`',            'Ban a user from the server'],
        ['`/unban`',          'Unban a user by ID'],
        ['`/kick`',           'Kick a user from the server'],
        ['`/softban`',        'Ban & unban to purge messages'],
        ['`/tempban`',        'Temporarily ban a user'],
        ['`/forceban`',       'Force-ban a user not in the server'],
        ['`/hackban`',        'Ban a user by ID (not in server)'],
        ['`/idban`',          'Ban multiple users by ID list'],
        ['`/massban`',        'Ban multiple users at once'],
        ['`/massunban`',      'Unban all banned users'],
        ['`/banlist`',        'View the server ban list'],
        ['`/recentbans`',     'Show the most recent bans'],
        ['`/unbanmatch`',     'Unban users matching a ban reason keyword'],
        ['`/masskick`',       'Kick multiple members by role'],
        ['`/mute`',           'Mute a user (Muted role)'],
        ['`/unmute`',         'Unmute a user'],
        ['`/tempmute`',       'Temporarily mute a user'],
        ['`/mutedlist`',      'List all currently muted users'],
        ['`/timeout`',        'Apply a Discord native timeout'],
        ['`/untimeout`',      'Remove a Discord timeout'],
        ['`/warn`',           'Issue a warning to a user'],
        ['`/warnings`',       'List warnings for a user'],
        ['`/clearwarnings`',  'Clear all warnings for a user'],
        ['`/warnpunishment`', 'Set auto-punishments at warn thresholds'],
        ['`/warnthreshold`',  'Configure warn threshold settings'],
      ],
      // Page 2 — Cases, Notes & History
      [
        ['`/case`',             'View a warning case by ID'],
        ['`/caseview`',         'View detailed case info'],
        ['`/caselog`',          'View the full case log for a user'],
        ['`/reason`',           'Update a warning/case reason'],
        ['`/note`',             'Add a moderator note to a user'],
        ['`/addnote`',          'Add a staff note to a user record'],
        ['`/viewnotes`',        'View all staff notes for a user'],
        ['`/deletenote`',       'Delete a specific staff note by ID'],
        ['`/history`',          'View warning history for a user'],
        ['`/appeal`',           'Look up or manage a punishment appeal'],
        ['`/watchlist`',        'Add or remove a user from the watchlist'],
        ['`/viewwatchlist`',    'View all users on the watchlist'],
        ['`/modstats`',         'Show mod action stats for a moderator'],
        ['`/activepunishments`','List all active temp-bans and temp-mutes'],
        ['`/expirecheck`',      'Manually lift expired temp-bans/mutes'],
        ['`/auditlog`',         'View the server audit log'],
        ['`/userinfo`',         'View detailed info about a user'],
        ['`/joinage`',          'Check account/join age of a user'],
        ['`/announce`',         'Send an announcement to a channel'],
        ['`/dmjoin`',           'Configure DM message sent on member join'],
        ['`/nick`',             "Change a member's nickname"],
        ['`/nickall`',          'Set a nickname for all members with a role'],
        ['`/nicknamehistory`',  'View nickname history for a user'],
        ['`/dehoist`',          'Remove hoisting characters from a nickname'],
        ['`/strip`',            'Remove all removable roles from a user'],
      ],
      // Page 3 — Roles & Channels
      [
        ['`/role`',            'Add or remove a role from a user'],
        ['`/roleall`',         'Add or remove a role from every member'],
        ['`/rolebots`',        'Add or remove a role from all bots'],
        ['`/rolehumans`',      'Add or remove a role from all humans'],
        ['`/massrole`',        'Add or remove a role from members with another role'],
        ['`/rolecreate`',      'Create a new role'],
        ['`/roledelete`',      'Delete a role'],
        ['`/rolerename`',      'Rename a role'],
        ['`/rolecolor`',       'Change a role color'],
        ['`/rolehoist`',       'Toggle role hoisting'],
        ['`/rolementionable`', 'Toggle role mentionable'],
        ['`/roleinfo`',        'View detailed role information'],
        ['`/rolemembers`',     'List all members with a role'],
        ['`/rolecleanup`',     'Remove empty or unused roles'],
        ['`/temprole`',        'Assign a role temporarily'],
        ['`/channelcreate`',   'Create a new channel'],
        ['`/channeldelete`',   'Delete a channel'],
        ['`/channelrename`',   'Rename a channel'],
        ['`/channeltopic`',    "Set a channel's topic"],
        ['`/channelmove`',     'Move a channel to a category'],
        ['`/channelnsfw`',     'Toggle NSFW flag on a channel'],
        ['`/channelperm`',     'Edit permission overrides in a channel'],
        ['`/channellist`',     'List all channels and their types'],
        ['`/categorycreate`',  'Create a new channel category'],
        ['`/categorydelete`',  'Delete a category'],
      ],
      // Page 4 — Voice, Purge & Server
      [
        ['`/voicekick`',          'Disconnect a user from voice'],
        ['`/voiceban`',           'Ban a user from voice channels'],
        ['`/unvoiceban`',         'Remove a voice ban'],
        ['`/voicemute`',          'Server-mute a member in voice'],
        ['`/voiceunmute`',        'Remove server-mute from a member'],
        ['`/voicemove`',          'Move a member to a voice channel'],
        ['`/voicemoveall`',       'Move all members from one voice to another'],
        ['`/voicedisconnectall`', 'Disconnect all members from a voice channel'],
        ['`/moveall`',            'Move all members between voice channels'],
        ['`/moveallafk`',         'Move all members to the AFK channel'],
        ['`/lock`',               'Lock a channel from @everyone'],
        ['`/unlock`',             'Unlock a channel'],
        ['`/slowmode`',           'Set slowmode on a channel'],
        ['`/slowall`',            'Set slowmode on all text channels'],
        ['`/purge`',              'Bulk delete messages with filters'],
        ['`/purgeuser`',          "Delete a specific user's messages"],
        ['`/purgebots`',          'Delete messages sent by bots'],
        ['`/purgelinks`',         'Delete messages containing links'],
        ['`/purgeattachments`',   'Delete messages with attachments'],
        ['`/purgeembeds`',        'Delete messages containing embeds'],
        ['`/purgematch`',         'Delete messages matching a keyword'],
        ['`/pinmessage`',         'Pin a message in a channel'],
        ['`/unpinmessage`',       'Unpin a message in a channel'],
        ['`/serverrename`',       'Rename the server'],
        ['`/setafk`',             'Set the AFK channel and timeout'],
        ['`/setrulechannel`',     "Set the server's rules channel"],
        ['`/setupdateschannel`',  'Set the community updates channel'],
      ],
    ],
  },
  security: {
    get emoji() { return em('shield'); },
    title: 'Security Commands',
    description: 'Automated protection for your server.',
    pages: [
      // Page 1 — Automod Core
      [
        ['`/antispam`',         'Limit message spam (configurable rate)'],
        ['`/antilink`',         'Block unauthorized links & URLs'],
        ['`/antiinvite`',       'Block Discord invite links'],
        ['`/antiphishing`',     'Detect & remove phishing/scam links'],
        ['`/antimentions`',     'Limit mass user/role mentions'],
        ['`/anticaps`',         'Delete excessive all-caps messages'],
        ['`/antiemoji`',        'Limit excessive emoji per message'],
        ['`/antiword`',         'Block custom words from being sent'],
        ['`/antizalgo`',        'Detect and block zalgo text'],
        ['`/antialt`',          'Kick accounts below a minimum age'],
        ['`/antiraid`',         'Auto-lockdown on raid detection'],
        ['`/antinuke`',         'Protect against mass channel/role/ban nukes'],
        ['`/antihoisting`',     'Strip hoisting chars from usernames on join'],
        ['`/automod`',          'Enable or disable all automod modules at once'],
        ['`/raidmode`',         'Manually toggle raid lockdown'],
        ['`/lockdown`',         'Lock or unlock all text channels'],
        ['`/mentionspam`',      'Punish users who mass-mention others'],
        ['`/dupemessage`',      'Delete repeated identical messages'],
        ['`/tokenblocker`',     'Block messages containing bot tokens or API keys'],
        ['`/attachmentfilter`', 'Block specific file extension types'],
        ['`/imageonlymode`',    'Restrict a channel to image-only messages'],
        ['`/linkcooldown`',     'Rate-limit how often users can post links'],
        ['`/ghostping`',        'Detect and log ghost pings'],
        ['`/stickymute`',       'Re-apply mute if muted user rejoins'],
        ['`/floodgate`',        'Auto-enable slowmode on message flood'],
      ],
      // Page 2 — Gates & Filters
      [
        ['`/verification`',     'Set the server verification level'],
        ['`/newaccountfilter`', 'Kick or flag accounts newer than minimum age'],
        ['`/accountagegate`',   'Gate entry by account age'],
        ['`/captchagate`',      'Toggle captcha gate for new members'],
        ['`/botgate`',          'Require bot verification on join'],
        ['`/joinreaction`',     'Require reaction/button to get access'],
        ['`/honeypot`',         'Set up a honeypot channel to catch raiders'],
        ['`/nukeprotection`',   'Configure nuke protection settings'],
        ['`/permaudit`',        'List roles with dangerous permissions'],
        ['`/permissionlock`',   'Lock permissions per channel'],
        ['`/channellockdown`',  'Lock down a specific channel'],
        ['`/threadlock`',       'Lock or archive a thread channel'],
        ['`/channelclone`',     'Clone a channel (nuke messages, keep perms)'],
        ['`/webhookpurge`',     'Delete all webhooks in the server'],
        ['`/suspiciouslink`',   'Report a suspicious link for review'],
        ['`/importfilter`',     'Block external server invite patterns'],
        ['`/trustedroles`',     'Configure roles trusted to bypass automod'],
        ['`/backupsettings`',   'View or export current security settings'],
        ['`/securityreport`',   'Generate a security overview of the server'],
        ['`/slowmodechannel`',  'Set slowmode on a specific channel'],
      ],
      // Page 3 — Threat Detection
      [
        ['`/scanuser`',      'Scan a user for suspicious activity flags'],
        ['`/threatlog`',     'View recent threat detections in the server'],
        ['`/flaguser`',      'Manually flag a user as suspicious'],
        ['`/unflaguser`',    'Remove a suspicious flag from a user'],
        ['`/flaggedlist`',   'List all currently flagged users'],
        ['`/alertchannel`',  'Set a dedicated security alert channel'],
        ['`/securityalert`', 'Manually trigger a security alert message'],
        ['`/incidentlog`',   'Log a manual security incident'],
        ['`/incidentview`',  'View a logged security incident by ID'],
        ['`/incidentlist`',  'List all logged security incidents'],
      ],
      // Page 4 — Anti-Bot & Verification
      [
        ['`/botdetect`',      'Scan for unverified or suspicious bots'],
        ['`/botscan`',        'List all bots in the server with join dates'],
        ['`/requireverify`',  'Force reverification for a member'],
        ['`/verifystatus`',   'Check verification status of a user'],
        ['`/verifylog`',      'View the verification attempt log'],
        ['`/unverifiedlist`', "List members who haven't verified"],
        ['`/verifybypass`',   'Grant a user a verification bypass'],
        ['`/removebypass`',   "Remove a user's verification bypass"],
      ],
      // Page 5 — Account & Join Screening
      [
        ['`/agecheck`',    'Check if a user meets account age requirements'],
        ['`/newaccounts`', 'List accounts that joined in the last 24h'],
        ['`/joinscan`',    'Scan recent joins for suspicious patterns'],
        ['`/joinspike`',   'Alert if join count spikes abnormally'],
        ['`/altscan`',     'Scan for potential alt accounts by similarity'],
        ['`/altlink`',     'Manually link two accounts as alts'],
        ['`/altunlink`',   'Remove an alt link between two accounts'],
        ['`/altlist`',     'List all known alt pairs in the server'],
      ],
      // Page 6 — Channel & Permission Guards
      [
        ['`/permlock`',        'Lock permissions on a specific channel'],
        ['`/permreset`',       'Reset channel permissions to default'],
        ['`/permsnap`',        'Take a snapshot of current channel permissions'],
        ['`/permrestore`',     'Restore channel permissions from a snapshot'],
        ['`/dangerousperms`',  'List all roles with dangerous permissions'],
        ['`/adminaudit`',      'Audit all users with admin-level permissions'],
        ['`/botroleaudit`',    'Audit all roles assigned to bots'],
        ['`/channeloverview`', 'Show a full permission overview of all channels'],
      ],
      // Page 7 — Anti-Nuke & Integrity
      [
        ['`/nukelog`',        'View the anti-nuke action log'],
        ['`/nukewhitelist`',  'Add a user or role to the anti-nuke whitelist'],
        ['`/nukeblacklist`',  'Force-add a user to the nuke blacklist'],
        ['`/nukeconfig`',     'Configure anti-nuke thresholds and punishments'],
        ['`/nukestatus`',     'View current anti-nuke configuration'],
        ['`/integritycheck`', 'Run a full server integrity scan'],
        ['`/rolesnapshot`',   'Take a snapshot of all server roles'],
        ['`/rolerestore`',    'Restore roles from a saved snapshot'],
      ],
      // Page 8 — Spam & Flood Control
      [
        ['`/spamconfig`',   'Configure antispam thresholds'],
        ['`/spamlog`',      'View the antispam action log'],
        ['`/spamexempt`',   'Exempt a role or channel from antispam'],
        ['`/floodconfig`',  'Configure flood detection settings'],
        ['`/floodlog`',     'View flood detection events'],
        ['`/burstdetect`',  'Detect and log message burst events'],
        ['`/imagespam`',    'Configure image/attachment spam limits'],
        ['`/reactionspam`', 'Limit reaction spam per message'],
      ],
      // Page 9 — Link & Content Filtering
      [
        ['`/linklog`',         'View the antilink action log'],
        ['`/linkwhitelist`',   'Add a domain to the link whitelist'],
        ['`/linkblacklist`',   'Add a domain to the link blacklist'],
        ['`/linkscan`',        'Scan a URL for phishing or malware flags'],
        ['`/invitelog`',       'View the anti-invite action log'],
        ['`/invitewhitelist`', 'Whitelist a specific Discord server invite'],
        ['`/contentfilter`',   'Configure word/phrase content filtering'],
        ['`/filteredlog`',     'View the content filter action log'],
        ['`/regexfilter`',     'Add a custom regex pattern to the filter'],
        ['`/regexlist`',       'List all active regex filter patterns'],
        ['`/regexremove`',     'Remove a regex filter pattern by ID'],
      ],
      // Page 10 — Raid & Lockdown
      [
        ['`/raidlog`',         'View the raid detection action log'],
        ['`/raidconfig`',      'Configure raid detection thresholds'],
        ['`/raidhistory`',     'View past raid events and responses'],
        ['`/lockdownlog`',     'View the lockdown action log'],
        ['`/lockdownconfig`',  'Configure automatic lockdown behavior'],
        ['`/lockdownstatus`',  'Show current lockdown state of all channels'],
        ['`/emergencylock`',   'Instantly lock all channels (emergency use)'],
        ['`/emergencyunlock`', 'Unlock all channels after emergency lockdown'],
        ['`/quarantine`',      'Quarantine a user during an active raid'],
        ['`/raidsuspend`',     'Suspend server invites during an active raid'],
      ],
    ],
  },
  logging: {
    get emoji() { return em('clipboard'); },
    title: 'Logging Commands',
    description: 'Track moderation actions and automod events.',
    pages: [[
      ['`/setlog`',        'Set the moderation log channel'],
      ['`/setmodlog`',     'Set the moderation action log channel'],
      ['`/setautomodlog`', 'Set a separate automod log channel'],
      ['`/setjoinlog`',    'Set the join log channel'],
      ['`/setleavelog`',   'Set the leave log channel'],
      ['`/ignorechannel`', 'Ignore a channel from automod scanning'],
    ]],
  },
  utility: {
    get emoji() { return em('wrench'); },
    title: 'Utility Commands',
    description: 'Helpful info and general-purpose tools.',
    pages: [[
      ['`/userinfo`',     'View detailed info about a user'],
      ['`/whois`',        'View detailed info about a user'],
      ['`/serverinfo`',   'View detailed server information'],
      ['`/roleinfo`',     'View information about a role'],
      ['`/channelinfo`',  'View information about a channel'],
      ['`/avatar`',       "Display a user's full-size avatar"],
      ['`/inviteinfo`',   'Inspect a Discord invite link'],
      ['`/membercount`',  'Show total members, humans, and bots'],
      ['`/uptime`',       'Show how long the bot has been online'],
      ['`/poll`',         'Create a poll with up to four options'],
      ['`/remind`',       'Set a timed reminder'],
      ['`/firstmessage`', 'Fetch the first message in a channel'],
      ['`/permissions`',  'Show user permissions in a channel'],
      ['`/snipe`',        'Show the last deleted message in a channel'],
      ['`/botinfo`',      'View bot statistics and info'],
      ['`/ping`',         'Check bot and API latency'],
      ['`/help`',         'Show this help menu'],
    ]],
  },
  config: {
    get emoji() { return em('gear'); },
    title: 'Configuration Commands',
    description: 'Configure the bot and automod for your server.',
    pages: [[
      ['`/settings`',     'View all current bot & automod settings'],
      ['`/resetconfig`',  'Reset all settings to defaults'],
      ['`/setmutedrole`', 'Set the role used for muting'],
      ['`/setmodrole`',   'Set the moderator role'],
      ['`/setadminrole`', 'Set the administrator role'],
      ['`/setprefix`',    'Set the bot command prefix'],
      ['`/blacklist`',    'Manage server blacklist (users, links, words)'],
      ['`/whitelist`',    'Manage automod whitelist (users, roles, channels)'],
      ['`/verification`', 'Configure button-based member verification'],
    ]],
  },
};

// ─── Dropdown menu options ─────────────────────────────────────────────────────
// Built as a getter so emoji IDs are always fresh when the menu is constructed.
function getMenuOptions() {
  return [
    { label: 'Home',       value: 'home',       description: 'Back to the main overview',           emoji: eid('home')      },
    { label: 'Moderation', value: 'moderation', description: 'Ban, kick, mute, warn, purge & more', emoji: eid('hammer')    },
    { label: 'Security',   value: 'security',   description: 'Antispam, antilink, antiraid & more',  emoji: eid('shield')    },
    { label: 'Logging',    value: 'logging',    description: 'Log channels and event tracking',      emoji: eid('clipboard') },
    { label: 'Utility',    value: 'utility',    description: 'Info, snipe, ping, polls & more',      emoji: eid('wrench')    },
    { label: 'Config',     value: 'config',     description: 'Automod settings, roles & bot setup',  emoji: eid('gear')      },
  ];
}

module.exports = { E, em, eid, CATEGORY_COUNTS, CATEGORY_DETAILS, PAGE_TOPICS, getMenuOptions };
