'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const clientId = process.env.CLIENT_ID;
if (!clientId) {
  console.error('CLIENT_ID missing in .env');
  process.exit(1);
}

const commands = [];
function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) loadCommands(fullPath);
    else if (entry.name.endsWith('.js')) {
      const cmd = require(fullPath);
      if (cmd.data) commands.push(cmd.data.toJSON());
    }
  }
}

const commandsDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandsDir)) loadCommands(commandsDir);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const guildId = process.env.GUILD_ID;

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    let data;
    if (guildId) {
      // Guild deploy — instant (use during development)
      data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Successfully deployed ${data.length} guild commands (instant).`);
    } else {
      // Global deploy — up to 1 hour propagation
      data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Successfully deployed ${data.length} global commands.`);
    }
  } catch (error) {
    console.error(error);
  }
})();
