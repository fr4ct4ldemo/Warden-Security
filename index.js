'use strict';
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const db = require('./utils/database');
const { startScheduler } = require('./utils/scheduler');
const { startDashboard } = require('./dashboard/server');
const { syncEmojis } = require('./utils/emojiSync');
const antiNuke = require('./events/antiNuke');

const COMMANDS_DIR = path.join(__dirname, 'commands');
const EVENTS_DIR = path.join(__dirname, 'events');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

function walkDirectory(directory, callback) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(entryPath, callback);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      callback(entryPath);
    }
  }
}

function loadCommands() {
  if (!fs.existsSync(COMMANDS_DIR)) return;
  walkDirectory(COMMANDS_DIR, (filePath) => {
    const command = require(filePath);
    if (command?.data?.name && typeof command.execute === 'function') {
      client.commands.set(command.data.name, command);
    }
  });
}

function loadEvents() {
  if (!fs.existsSync(EVENTS_DIR)) return;
  for (const file of fs.readdirSync(EVENTS_DIR).filter((file) => file.endsWith('.js'))) {
    const event = require(path.join(EVENTS_DIR, file));
    if (!event?.name || typeof event.execute !== 'function') continue;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

function printBanner() {
  const C1 = '\x1b[38;2;60;70;200m';
  const C2 = '\x1b[38;2;110;120;240m';
  const C3 = '\x1b[38;2;160;170;255m';
  const C4 = '\x1b[38;2;210;215;255m';
  const BD = '\x1b[38;2;70;80;160m';
  const R  = '\x1b[0m';
  const b  = '\x1b[1m';

  const art = [
    `${C1}\u2588\u2588\u2557    \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2557   \u2588\u2588\u2557`,
    `${C2}\u2588\u2588\u2551    \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551`,
    `${C3}\u2588\u2588\u2551 \u2588\u2557 \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2554\u2588\u2588\u2557 \u2588\u2588\u2551`,
    `${C4}\u2588\u2588\u2551\u2588\u2588\u2588\u2557\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255d  \u2588\u2588\u2551\u255a\u2588\u2588\u2557\u2588\u2588\u2551`,
    `${C3}\u255a\u2588\u2588\u2588\u2554\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551 \u255a\u2588\u2588\u2588\u2588\u2551`,
    `${C2} \u255a\u2550\u2550\u255d\u255a\u2550\u2550\u255d \u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u2550\u2550\u255d`,
  ];

  const ANSI_RE = /\x1b\[[0-9;]*m/g;
  const TARGET  = 54;
  const BORDER  = '\u2500'.repeat(TARGET + 2);

  const servers = client.guilds.cache.size;
  const members = client.guilds.cache.reduce((n, g) => n + g.memberCount, 0);

  function pad(line) {
    const visible = line.replace(ANSI_RE, '').length;
    return line + ' '.repeat(Math.max(0, TARGET - visible));
  }

  const nodeVer    = `Node ${process.version}  \u2022  discord.js v14  \u2022  sql.js`;
  const serverLine = `Servers: ${C4}${b}${servers}${R}${BD}   Members: ${C4}${b}${members}${R}`;
  const serverVis  = `Servers: ${servers}   Members: ${members}`.length;

  const lines = [
    '',
    `  ${BD}\u250c${BORDER}\u2510${R}`,
    `  ${BD}\u2502${R}${' '.repeat(TARGET + 2)}${BD}\u2502${R}`,
    ...art.map(l => `  ${BD}\u2502${R} ${pad(l)}${R} ${BD}\u2502${R}`),
    `  ${BD}\u2502${R}${' '.repeat(TARGET + 2)}${BD}\u2502${R}`,
    `  ${BD}\u251c${BORDER}\u2524${R}`,
    `  ${BD}\u2502${R}  ${C4}${b}Security & Moderation Bot${R}${' '.repeat(TARGET - 25)}${BD}\u2502${R}`,
    `  ${BD}\u2502${R}  ${BD}${nodeVer}${R}${' '.repeat(Math.max(0, TARGET - 2 - nodeVer.length))}${BD}\u2502${R}`,
    `  ${BD}\u2502${R}${' '.repeat(TARGET + 2)}${BD}\u2502${R}`,
    `  ${BD}\u2502${R}  ${BD}${serverLine}${R}${' '.repeat(Math.max(0, TARGET - 2 - serverVis))}${BD}\u2502${R}`,
    `  ${BD}\u2514${BORDER}\u2518${R}`,
    '',
  ];

  console.log(lines.join('\n'));
  console.log(`  ${BD}>>  ${R}Logged in as ${C4}${b}${client.user.tag}${R}\n`);
}

client.on('warn', (info) => console.warn('[discord:warn]', info));
client.on('error', (error) => console.error('[discord:error]', error));

async function main() {
  const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('[startup] Discord token is missing. Set TOKEN or DISCORD_TOKEN in environment.');
    process.exit(1);
  }

  await db.initDatabase();
  loadCommands();
  loadEvents();

  await client.login(token);
  client.once('ready', async () => {
    await syncEmojis(client);
    printBanner();
  });

  antiNuke.register(client);
  startScheduler(client);
  startDashboard(client);
}

main().catch((err) => {
  console.error('[startup] Fatal error', err);
  process.exit(1);
});
