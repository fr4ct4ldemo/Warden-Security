'use strict';
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const db = require('../utils/database');

const DISCORD_CLIENT_ID     = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI  = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const SESSION_SECRET        = process.env.SESSION_SECRET || 'warden-dashboard-secret';
const PORT                  = process.env.DASHBOARD_PORT || 3000;

async function startDashboard(client) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  }));

  function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
  }

  app.get('/login', (req, res) => {
    const params = new URLSearchParams({
      client_id:     DISCORD_CLIENT_ID,
      redirect_uri:  DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope:         'identify guilds',
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
  });

  app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/login');
    try {
      const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
        client_id:     DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type:    'authorization_code',
        code,
        redirect_uri:  DISCORD_REDIRECT_URI,
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

      const { access_token } = tokenRes.data;
      const headers = { Authorization: `Bearer ${access_token}` };
      const [userRes, guildsRes] = await Promise.all([
        axios.get('https://discord.com/api/users/@me', { headers }),
        axios.get('https://discord.com/api/users/@me/guilds', { headers }),
      ]);

      req.session.user   = userRes.data;
      req.session.guilds = guildsRes.data;
      res.redirect('/dashboard');
    } catch (err) {
      console.error('[Dashboard] OAuth error:', err.response?.data || err.message);
      res.redirect('/login');
    }
  });

  app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

  // API
  app.get('/api/user', requireAuth, (req, res) => res.json(req.session.user));

  app.get('/api/guilds', requireAuth, (req, res) => {
    const botGuildIds = new Set(client.guilds.cache.map(g => g.id));
    const MANAGE_GUILD = 0x20;
    const managed = (req.session.guilds || []).filter(g =>
      (parseInt(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD
    );
    res.json(managed.map(g => ({
      ...g,
      botPresent: botGuildIds.has(g.id),
      iconURL: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
    })));
  });

  app.get('/api/guild/:id', requireAuth, (req, res) => {
    const guild = client.guilds.cache.get(req.params.id);
    if (!guild) return res.status(404).json({ error: 'Bot not in this guild' });
    res.json({
      id: guild.id, name: guild.name, memberCount: guild.memberCount,
      iconURL: guild.iconURL({ size: 128 }),
      channels: guild.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name })),
      roles: guild.roles.cache.filter(r => r.id !== guild.id).map(r => ({ id: r.id, name: r.name })),
    });
  });

  app.get('/api/guild/:id/settings', requireAuth, (req, res) => {
    const guildId = req.params.id;
    if (!client.guilds.cache.get(guildId)) return res.status(404).json({ error: 'Bot not in this guild' });
    res.json({
      settings:        db.getSettings(guildId),
      logChannel:      db.getLogChannel(guildId),
      automodLog:      db.getAutomodLogChannel(guildId),
      mutedRole:       db.getMutedRole(guildId),
      ignoredChannels: db.getIgnoredChannels(guildId),
      raidMode:        db.getRaidMode(guildId),
      verification:    db.getVerificationSettings(guildId),
      warnPunishments: db.getWarnPunishments(guildId),
    });
  });

  app.post('/api/guild/:id/settings', requireAuth, (req, res) => {
    const guildId = req.params.id;
    if (!client.guilds.cache.get(guildId)) return res.status(404).json({ error: 'Bot not in this guild' });
    try {
      // Deep merge so toggling a sub-key (e.g. antiCaps.enabled) doesn't
      // wipe out sibling keys (e.g. antiCaps.percent, antiCaps.minLength).
      function deepMerge(target, source) {
        const out = Object.assign({}, target);
        for (const key of Object.keys(source || {})) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            out[key] = deepMerge(target[key] || {}, source[key]);
          } else {
            out[key] = source[key];
          }
        }
        return out;
      }

      // Merge and persist automod/guild settings
      const incoming = req.body.settings || {};
      const merged = deepMerge(db.getSettings(guildId), incoming);
      db.saveSettings(guildId, merged);

      // Persist channel / role helpers
      if (req.body.logChannel !== undefined) db.setLogChannel(guildId, req.body.logChannel);
      if (req.body.automodLog !== undefined) db.setAutomodLogChannel(guildId, req.body.automodLog);
      if (req.body.mutedRole  !== undefined) db.setMutedRole(guildId, req.body.mutedRole);

      // Persist warn punishments (dashboard sends { warnPunishments: { '2': 'mute', ... } })
      if (req.body.warnPunishments) {
        for (const [count, punishment] of Object.entries(req.body.warnPunishments)) {
          if (punishment) {
            db.setWarnPunishment(guildId, Number(count), punishment);
          } else {
            db.deleteWarnPunishment(guildId, Number(count));
          }
        }
      }

      // Persist verification (stored in its own table, not inside guild_settings)
      if (req.body.verification !== undefined) {
        const v = req.body.verification;
        db.saveVerificationSettings(
          guildId,
          !!v.enabled,
          v.channel_id || null,
          v.role_id    || null
        );
      }

      res.json({ success: true });
    } catch (err) {
      console.error('[Dashboard] Save error:', err);
      res.status(500).json({ error: 'Failed to save' });
    }
  });

  app.get('/api/stats', requireAuth, (req, res) => {
    res.json({
      guilds:  client.guilds.cache.size,
      users:   client.guilds.cache.reduce((n, g) => n + g.memberCount, 0),
      ping:    client.ws.ping,
      uptime:  process.uptime(),
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

  app.listen(PORT, () => console.log(`[Dashboard] http://localhost:${PORT}`));
}

module.exports = { startDashboard };
