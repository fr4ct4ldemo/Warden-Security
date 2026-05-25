<div align="center">

<img src="dashboard/public/logo.png" width="72" alt="Warden Logo"/>

# Warden

**Security & Moderation Bot**

*A modern moderation & security control panel.*
*Anti-nuke, anti-raid, automod — all configured from one place.*

</div>

---

## 🌐 Dashboard

![Dashboard Landing](https://github.com/user-attachments/assets/f8e220ae-a224-486f-86ed-c5455e5b37d4)

Warden ships with a full web dashboard — manage every setting without typing a single command.

- Login with Discord OAuth2
- Manage all your servers from one place
- Toggle automod rules, set log channels, configure verification & rank cards
- Live rank card preview with XP leaderboard

---

## ⚡ Features

| | Feature | Description |
|---|---|---|
| 🛡️ | **Anti-Nuke** | Detects mass channel deletes, role wipes & ban waves — stops attacks within seconds |
| 🚫 | **Anti-Raid** | Mass-join detection with automatic server lockdown |
| ⚙️ | **Automod Suite** | Anti-spam, caps, links, phishing, mentions, emoji, zalgo, alts & more |
| 🔒 | **Anti-Phishing** | Removes known phishing & scam URLs before members ever see them |
| ✅ | **Verification** | Button-based member verification with configurable channels and roles |
| 📋 | **Mod Logging** | Every action logged with moderator, context, and timestamp |
| 🏆 | **Rank Cards** | XP leveling system with customizable rank card appearance |

---

## 📦 Commands

| Category | Commands | Description |
|---|---|---|
| 🔨 Moderation | `103` | Ban, kick, mute, warn, purge & more |
| 🛡️ Security | `115` | Antispam, antilink, antiraid & more |
| 📋 Logging | `6` | Log channels and event tracking |
| 🔧 Utility | `17` | Info, snipe, ping, polls & more |
| ⚙️ Config | `9` | Automod settings, roles & bot setup |

> **250 total commands** across 5 categories.

---

## 🖥️ Console

![Console Preview](https://github.com/user-attachments/assets/2a627607-8073-4be7-aa55-e8546792e4a6)

---

## 🚀 Setup

**1. Install dependencies**
```
npm install
```

**2. Create a `.env` file**
```env
TOKEN=your_bot_token
CLIENT_ID=your_client_id
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_oauth_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=any_random_string
DASHBOARD_PORT=3000
```

**3. Deploy slash commands**
```
npm run deploy
```
> Global commands propagate to all servers within ~1 hour.

**4. Start the bot**
```
npm start
```

**5. Open the dashboard** → `http://localhost:3000`

---

## 🏗️ Architecture

- **Multi-guild** — all data fully isolated per `guild_id` in a single SQLite database
- **Global commands** — one deploy covers every server the bot is in
- **Data persistence** — guild settings are kept even if the bot leaves a server
- **Dashboard** — Express + Discord OAuth2, runs alongside the bot in the same process
- **Emoji sync** — custom emojis uploaded once and ID-cached to `data/emoji-cache.json`, surviving restarts

---

## 📁 Project Structure

```
project2.0/
├── commands/
│   ├── config/
│   ├── logging/
│   ├── moderation/
│   ├── security/
│   └── utility/
├── dashboard/
│   ├── public/        ← index.html + logo
│   └── server.js      ← Express + OAuth2
├── events/            ← Discord.js event handlers
├── utils/             ← Automod handlers, database, helpers
├── warden/            ← Custom emoji PNG assets
├── data/              ← SQLite DB + emoji ID cache
├── index.js           ← Entry point
└── deploy-commands.js
```

---

<div align="center">

Built with [discord.js v14](https://discord.js.org) &nbsp;•&nbsp; Powered by SQLite

</div>
