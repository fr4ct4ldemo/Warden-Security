/**
 * images.js — Base64 image loader for Warden bot
 *
 * Reads all bot images from the warden assets folder at runtime and
 * exposes them as base64-encoded strings (and as ready-to-use data URIs).
 *
 * Usage:
 *   const images = require('./utils/images');
 *   const base64  = images.shield.base64;   // raw base64 string
 *   const dataUri = images.shield.dataUri;  // "data:image/png;base64,..."
 */

const fs   = require('fs');
const path = require('path');

// Warden assets folder is now inside project2.0 root
const ASSETS_DIR = path.join(__dirname, '..', 'warden');

/**
 * Load a PNG from the assets directory and return base64 + dataUri.
 * Returns null values if the file is missing so the bot doesn't crash.
 */
function loadImage(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  try {
    const buffer  = fs.readFileSync(filePath);
    const base64  = buffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;
    return { base64, dataUri, filePath };
  } catch (err) {
    console.warn(`[images.js] Could not load "${filename}": ${err.message}`);
    return { base64: null, dataUri: null, filePath };
  }
}

// ── Image registry ────────────────────────────────────────────────────────────
const images = {
  checkmark:     loadImage('checkmark.png'),
  clipboard:     loadImage('clipboard.png'),
  discotoolsAlt: loadImage('discotools-xyz-icon (1).png'),
  discotools:    loadImage('discotools-xyz-icon.png'),
  gear:          loadImage('gear.png'),
  hammer:        loadImage('hammer.png'),
  shield:        loadImage('shield.png'),
  warden:        loadImage('discotools-xyz-icon.png'), // warden.png not present — using discotools icon as fallback
  wrench:        loadImage('wrench.png'),
  x:             loadImage('x.png'),
  zap:           loadImage('zap.png'),
};

module.exports = images;
