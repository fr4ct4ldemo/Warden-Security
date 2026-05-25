'use strict';
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const dbPath = process.env.DB_PATH || './data/bot.db';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// sql.js — pure JavaScript SQLite, no native compilation needed
const initSqlJs = require('sql.js');

let SQL, db;

function save() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function initDb() {
  const fileBuffer = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
  db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  const schema = `
    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      moderator_tag TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      settings TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS muted_roles (
      guild_id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS log_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS automod_log_channels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ignored_channels (
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      PRIMARY KEY (guild_id, channel_id)
    );
    CREATE TABLE IF NOT EXISTS warn_punishments (
      guild_id TEXT NOT NULL,
      warn_count INTEGER NOT NULL,
      punishment TEXT NOT NULL,
      PRIMARY KEY (guild_id, warn_count)
    );
    CREATE TABLE IF NOT EXISTS temp_bans (
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      PRIMARY KEY (guild_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS temp_mutes (
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      PRIMARY KEY (guild_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS voice_bans (
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (guild_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS blacklist (
      guild_id TEXT NOT NULL,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (guild_id, type, value)
    );
    CREATE TABLE IF NOT EXISTS whitelist (
      guild_id TEXT NOT NULL,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (guild_id, type, value)
    );
    CREATE TABLE IF NOT EXISTS raid_mode (
      guild_id TEXT PRIMARY KEY,
      active INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS antinuke_whitelist (
      guild_id TEXT NOT NULL,
      user_id  TEXT NOT NULL,
      PRIMARY KEY (guild_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS verification_settings (
      guild_id TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0,
      channel_id TEXT,
      role_id TEXT
    );
  `;
  db.run(schema);
  save();
}

// Helper wrappers around sql.js API
function run(sql, params = []) {
  db.run(sql, params);
  save();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Initialize synchronously using a trick: sql.js supports sync init
// We call initSqlJs synchronously by loading the wasm via locateFile
let initialized = false;
function ensureInit() {
  if (initialized) return;
  // This blocks the event loop once at startup — acceptable for bot init
  // sql.js init is actually async, so we use a sync-style workaround:
  // require the pre-compiled asm.js fallback
  throw new Error('DB not initialized — call initDatabase() and await it before use.');
}

// Export an async init function — call this before starting the bot
async function initDatabase() {
  SQL = await initSqlJs();
  initDb();
  initialized = true;
}

module.exports = {
  initDatabase,

  // Warnings
  addWarning(guildId, userId, reason, moderatorTag) {
    run('INSERT INTO warnings (guild_id, user_id, reason, moderator_tag, timestamp) VALUES (?, ?, ?, ?, ?)',
      [guildId, userId, reason, moderatorTag, Date.now()]);
  },
  getWarnings(guildId, userId) {
    return all('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp ASC', [guildId, userId]);
  },
  clearWarnings(guildId, userId) {
    run('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
  },
  countWarnings(guildId, userId) {
    const r = get('SELECT COUNT(*) AS c FROM warnings WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
    return r ? Number(r.c) : 0;
  },
  getWarningById(guildId, id) {
    return get('SELECT * FROM warnings WHERE id = ? AND guild_id = ?', [id, guildId]);
  },
  updateWarningReason(guildId, id, reason) {
    run('UPDATE warnings SET reason = ? WHERE id = ? AND guild_id = ?', [reason, id, guildId]);
  },

  // Settings
  getSettings(guildId) {
    const row = get('SELECT settings FROM guild_settings WHERE guild_id = ?', [guildId]);
    if (!row) return JSON.parse(JSON.stringify(config.automodDefaults));
    try { return Object.assign({}, config.automodDefaults, JSON.parse(row.settings)); } catch { return JSON.parse(JSON.stringify(config.automodDefaults)); }
  },
  saveSettings(guildId, settingsObject) {
    run('INSERT INTO guild_settings (guild_id, settings) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET settings=excluded.settings',
      [guildId, JSON.stringify(settingsObject)]);
  },

  // Muted role
  getMutedRole(guildId) { const r = get('SELECT role_id FROM muted_roles WHERE guild_id = ?', [guildId]); return r ? r.role_id : null; },
  setMutedRole(guildId, roleId) { run('INSERT INTO muted_roles (guild_id, role_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET role_id=excluded.role_id', [guildId, roleId]); },

  // Log channels
  getLogChannel(guildId) { const r = get('SELECT channel_id FROM log_channels WHERE guild_id = ?', [guildId]); return r ? r.channel_id : null; },
  setLogChannel(guildId, channelId) { run('INSERT INTO log_channels (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id', [guildId, channelId]); },
  getAutomodLogChannel(guildId) { const r = get('SELECT channel_id FROM automod_log_channels WHERE guild_id = ?', [guildId]); return r ? r.channel_id : null; },
  setAutomodLogChannel(guildId, channelId) { run('INSERT INTO automod_log_channels (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id', [guildId, channelId]); },

  // Ignored channels
  getIgnoredChannels(guildId) { return all('SELECT channel_id FROM ignored_channels WHERE guild_id = ?', [guildId]).map(r => r.channel_id); },
  addIgnoredChannel(guildId, channelId) { run('INSERT OR IGNORE INTO ignored_channels (guild_id, channel_id) VALUES (?, ?)', [guildId, channelId]); },
  removeIgnoredChannel(guildId, channelId) { run('DELETE FROM ignored_channels WHERE guild_id = ? AND channel_id = ?', [guildId, channelId]); },
  isChannelIgnored(guildId, channelId) { return !!get('SELECT 1 AS r FROM ignored_channels WHERE guild_id = ? AND channel_id = ?', [guildId, channelId]); },

  // Warn punishments
  getWarnPunishments(guildId) {
    const rows = all('SELECT warn_count, punishment FROM warn_punishments WHERE guild_id = ?', [guildId]);
    const out = {};
    for (const r of rows) out[r.warn_count] = r.punishment;
    return Object.keys(out).length ? out : config.defaultWarnPunishments;
  },
  setWarnPunishment(guildId, count, punishment) { run('INSERT INTO warn_punishments (guild_id, warn_count, punishment) VALUES (?, ?, ?) ON CONFLICT(guild_id, warn_count) DO UPDATE SET punishment=excluded.punishment', [guildId, count, punishment]); },
  deleteWarnPunishment(guildId, count) { run('DELETE FROM warn_punishments WHERE guild_id = ? AND warn_count = ?', [guildId, count]); },

  // Temp bans
  addTempBan(guildId, userId, expiresAt) { run('INSERT INTO temp_bans (guild_id, user_id, expires_at) VALUES (?, ?, ?) ON CONFLICT(guild_id, user_id) DO UPDATE SET expires_at=excluded.expires_at', [guildId, userId, expiresAt]); },
  removeTempBan(guildId, userId) { run('DELETE FROM temp_bans WHERE guild_id = ? AND user_id = ?', [guildId, userId]); },
  getExpiredTempBans() { return all('SELECT guild_id, user_id FROM temp_bans WHERE expires_at <= ?', [Date.now()]); },
  getAllTempBans() { return all('SELECT * FROM temp_bans', []); },
  getTempBans(guildId) { return all('SELECT guild_id AS guildId, user_id AS userId, expires_at AS expiresAt FROM temp_bans WHERE guild_id = ?', [guildId]); },

  // Temp mutes
  addTempMute(guildId, userId, expiresAt) { run('INSERT INTO temp_mutes (guild_id, user_id, expires_at) VALUES (?, ?, ?) ON CONFLICT(guild_id, user_id) DO UPDATE SET expires_at=excluded.expires_at', [guildId, userId, expiresAt]); },
  removeTempMute(guildId, userId) { run('DELETE FROM temp_mutes WHERE guild_id = ? AND user_id = ?', [guildId, userId]); },
  getExpiredTempMutes() { return all('SELECT guild_id, user_id FROM temp_mutes WHERE expires_at <= ?', [Date.now()]); },
  getAllTempMutes() { return all('SELECT * FROM temp_mutes', []); },
  getTempMutes(guildId) { return all('SELECT guild_id AS guildId, user_id AS userId, expires_at AS expiresAt FROM temp_mutes WHERE guild_id = ?', [guildId]); },

  // Notes
  addNote(guildId, userId, note, moderatorTag) {
    run('INSERT INTO warnings (guild_id, user_id, reason, moderator_tag, timestamp) VALUES (?, ?, ?, ?, ?)',
      [guildId, userId, `[NOTE] ${note}`, moderatorTag, Date.now()]);
  },
  getNotes(guildId, userId) {
    return all("SELECT id, reason AS note, moderator_tag FROM warnings WHERE guild_id = ? AND user_id = ? AND reason LIKE '[NOTE]%' ORDER BY timestamp ASC", [guildId, userId])
      .map(r => ({ id: r.id, note: r.note.replace(/^\[NOTE\] /, ''), moderator_tag: r.moderator_tag }));
  },
  deleteNote(guildId, userId, noteId) {
    const existing = get("SELECT id FROM warnings WHERE id = ? AND guild_id = ? AND user_id = ? AND reason LIKE '[NOTE]%'", [noteId, guildId, userId]);
    if (!existing) return false;
    run('DELETE FROM warnings WHERE id = ? AND guild_id = ?', [noteId, guildId]);
    return true;
  },

  // Appeals (stored in guild_settings as JSON)
  getAppeal(guildId, userId) {
    const s = this.getSettings(guildId);
    return (s.appeals || {})[userId] || null;
  },
  updateAppeal(guildId, userId, status, reason) {
    const s = this.getSettings(guildId);
    if (!s.appeals) s.appeals = {};
    s.appeals[userId] = { status, reason, timestamp: Date.now() };
    this.saveSettings(guildId, s);
  },

  // Mod stats (counted from warnings table)
  getModStats(guildId, modId) {
    const warns = all('SELECT COUNT(*) AS c FROM warnings WHERE guild_id = ? AND moderator_tag LIKE ?', [guildId, '%']);
    return { bans: 0, kicks: 0, warns: Number((get('SELECT COUNT(*) AS c FROM warnings WHERE guild_id = ? AND moderator_tag LIKE ? AND reason NOT LIKE "[NOTE]%"', [guildId, '%']) || {}).c || 0), mutes: 0, timeouts: 0, unbans: 0 };
  },

  // Watchlist (stored in guild_settings as JSON)
  addWatchlist(guildId, userId, reason) {
    const s = this.getSettings(guildId);
    if (!s.watchlist) s.watchlist = [];
    if (!s.watchlist.find(w => w.userId === userId)) s.watchlist.push({ userId, reason });
    this.saveSettings(guildId, s);
  },
  removeWatchlist(guildId, userId) {
    const s = this.getSettings(guildId);
    s.watchlist = (s.watchlist || []).filter(w => w.userId !== userId);
    this.saveSettings(guildId, s);
  },
  getWatchlist(guildId) {
    const s = this.getSettings(guildId);
    return s.watchlist || [];
  },
  // Voice bans
  addVoiceBan(guildId, userId) { run('INSERT OR IGNORE INTO voice_bans (guild_id, user_id) VALUES (?, ?)', [guildId, userId]); },
  removeVoiceBan(guildId, userId) { run('DELETE FROM voice_bans WHERE guild_id = ? AND user_id = ?', [guildId, userId]); },
  isVoiceBanned(guildId, userId) { return !!get('SELECT 1 AS r FROM voice_bans WHERE guild_id = ? AND user_id = ?', [guildId, userId]); },
  getVoiceBans(guildId) { return all('SELECT user_id FROM voice_bans WHERE guild_id = ?', [guildId]).map(r => r.user_id); },

  // Blacklist
  addBlacklist(guildId, type, value) { run('INSERT OR IGNORE INTO blacklist (guild_id, type, value) VALUES (?, ?, ?)', [guildId, type, value]); },
  removeBlacklist(guildId, type, value) { run('DELETE FROM blacklist WHERE guild_id = ? AND type = ? AND value = ?', [guildId, type, value]); },
  getBlacklist(guildId, type) { return all('SELECT value FROM blacklist WHERE guild_id = ? AND type = ?', [guildId, type]).map(r => r.value); },
  isBlacklisted(guildId, type, value) { return !!get('SELECT 1 AS r FROM blacklist WHERE guild_id = ? AND type = ? AND value = ?', [guildId, type, value]); },

  // Whitelist
  addWhitelist(guildId, type, value) { run('INSERT OR IGNORE INTO whitelist (guild_id, type, value) VALUES (?, ?, ?)', [guildId, type, value]); },
  removeWhitelist(guildId, type, value) { run('DELETE FROM whitelist WHERE guild_id = ? AND type = ? AND value = ?', [guildId, type, value]); },
  getWhitelist(guildId, type) { return all('SELECT value FROM whitelist WHERE guild_id = ? AND type = ?', [guildId, type]).map(r => r.value); },
  isWhitelistedEntry(guildId, type, value) { return !!get('SELECT 1 AS r FROM whitelist WHERE guild_id = ? AND type = ? AND value = ?', [guildId, type, value]); },

  // Raid mode
  getRaidMode(guildId) { const r = get('SELECT active FROM raid_mode WHERE guild_id = ?', [guildId]); return r ? !!r.active : false; },
  setRaidMode(guildId, active) { run('INSERT INTO raid_mode (guild_id, active) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET active=excluded.active', [guildId, active ? 1 : 0]); },

  // Anti-Nuke
  getAntiNukeDefaults() {
    return {
      enabled: false,
      action: 'ban',
      thresholds: {
        channelDelete: 3,
        channelCreate: 5,
        roleDelete:    3,
        roleCreate:    5,
        ban:           5,
        kick:          5,
        webhookCreate: 3,
      }
    };
  },
  addAntiNukeWhitelist(guildId, userId)    { run('INSERT OR IGNORE INTO antinuke_whitelist (guild_id, user_id) VALUES (?, ?)', [guildId, userId]); },
  removeAntiNukeWhitelist(guildId, userId) { run('DELETE FROM antinuke_whitelist WHERE guild_id = ? AND user_id = ?', [guildId, userId]); },
  isAntiNukeWhitelisted(guildId, userId)   { return !!get('SELECT 1 AS r FROM antinuke_whitelist WHERE guild_id = ? AND user_id = ?', [guildId, userId]); },
  getAntiNukeWhitelist(guildId)            { return all('SELECT user_id FROM antinuke_whitelist WHERE guild_id = ?', [guildId]).map(r => r.user_id); },

  // Verification
  getVerificationSettings(guildId) {
    const r = get('SELECT enabled, channel_id, role_id FROM verification_settings WHERE guild_id = ?', [guildId]);
    if (!r) return { enabled: false, channel_id: null, role_id: null };
    return { enabled: !!r.enabled, channel_id: r.channel_id, role_id: r.role_id };
  },
  saveVerificationSettings(guildId, enabled, channelId, roleId) {
    run('INSERT INTO verification_settings (guild_id, enabled, channel_id, role_id) VALUES (?, ?, ?, ?) ON CONFLICT(guild_id) DO UPDATE SET enabled=excluded.enabled, channel_id=excluded.channel_id, role_id=excluded.role_id',
      [guildId, enabled ? 1 : 0, channelId || null, roleId || null]);
  },
};
