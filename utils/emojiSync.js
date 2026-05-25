'use strict';
const { PermissionFlagsBits } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

// ─── Persistent emoji ID cache ─────────────────────────────────────────────────
const CACHE_FILE = path.join(__dirname, '..', 'data', 'emoji-cache.json');

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch { /* ignore */ }
  return {};
}

function saveCache(cache) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('[emojiSync] Could not save emoji cache:', err.message);
  }
}

// ─── Load real images from the warden assets folder ───────────────────────────
const ASSETS_DIR = path.join(__dirname, '..', 'warden');

function loadAsset(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  try {
    return fs.readFileSync(filePath);
  } catch (err) {
    console.warn(`[emojiSync] Could not load asset "${filename}": ${err.message}`);
    return null;
  }
}

// Resize buffer to 128x128 PNG using sharp
async function resizeImage(buffer, name) {
  try {
    const resized = await sharp(buffer)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const sizeKB = resized.length / 1024;
    console.log(`[emojiSync] resized ${name} → ${sizeKB.toFixed(1)} KB`);
    return resized;
  } catch (err) {
    console.error(`[emojiSync] sharp resize failed for ${name}: ${err.message}`);
    return null;
  }
}

// Maps emoji name → image filename
// "home" now uses shield.png since warden.png was removed
// "x" renamed to "xmark" — Discord requires names to be 2–32 chars
const EMOJI_ASSETS = {
  home:      'shield.png',
  hammer:    'hammer.png',
  shield:    'shield.png',
  clipboard: 'clipboard.png',
  wrench:    'wrench.png',
  gear:      'gear.png',
  folder:    'discotools-xyz-icon.png',
  zap:       'zap.png',
  scroll:    'clipboard.png',
  checkmark: 'checkmark.png',
  xmark:     'x.png',
};

// ─── Main sync function ────────────────────────────────────────────────────────

async function syncEmojis(client) {
  try {
    // Step 1: Find a guild where the bot can manage emojis
    let targetGuild = null;
    for (const [, guild] of client.guilds.cache) {
      const me = guild.members.me;
      if (me && me.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
        targetGuild = guild;
        break;
      }
    }

    if (!targetGuild) {
      console.warn('[emojiSync] No guild found with MANAGE_EMOJIS_AND_STICKERS permission. Skipping emoji sync.');
      return;
    }

    console.log(`[emojiSync] Using guild "${targetGuild.name}" (${targetGuild.id}) for emoji hosting.`);

    // Step 2: Fetch existing emojis in the target guild
    const existingEmojis = await targetGuild.emojis.fetch();
    const emojiMap = new Map(existingEmojis.map((e) => [e.name, e]));

    // Step 3: Reference the E object from helpData
    const E = require('./helpData').E;

    // Step 4: Load persisted cache and pre-fill E for any IDs we already know
    const cache = loadCache();
    for (const [name, id] of Object.entries(cache)) {
      if (!E[name] && id) E[name] = id;
    }

    // Step 5: Process each emoji
    const results = { uploaded: 0, reused: 0, failed: 0 };

    for (const [name, filename] of Object.entries(EMOJI_ASSETS)) {
      try {
        // Reuse if already uploaded to this guild
        const existing = emojiMap.get(name);
        if (existing) {
          E[name] = existing.id;
          cache[name] = existing.id;
          console.log(`[emojiSync] reusing ${name} (${existing.id})`);
          results.reused++;
          continue;
        }

        // Load the actual image file
        let buffer = loadAsset(filename);
        if (!buffer) {
          console.error(`[emojiSync] skipping ${name}: asset file missing`);
          results.failed++;
          continue;
        }

        // Auto-resize if over 256 KB
        const sizeKB = buffer.length / 1024;
        if (sizeKB > 256) {
          console.log(`[emojiSync] ${name} is ${sizeKB.toFixed(1)} KB — resizing...`);
          buffer = await resizeImage(buffer, name);
          if (!buffer) {
            results.failed++;
            continue;
          }
        }

        // Upload
        const created = await targetGuild.emojis.create({ attachment: buffer, name });
        E[name] = created.id;
        cache[name] = created.id;
        console.log(`[emojiSync] uploaded ${name} (${created.id})`);
        results.uploaded++;

      } catch (err) {
        console.error(`[emojiSync] failed to sync ${name}: ${err.message}`);
        results.failed++;
      }
    }

    // Persist all collected IDs so they survive restarts
    saveCache(cache);
    console.log(`[emojiSync] done — ${results.uploaded} uploaded, ${results.reused} reused, ${results.failed} failed`);
  } catch (err) {
    console.error('[emojiSync] Fatal error:', err);
  }
}

module.exports = { syncEmojis };
