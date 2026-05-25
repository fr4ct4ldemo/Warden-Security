'use strict';
const store = new Map();

function set(channelId, messageData) { store.set(channelId, messageData); }
function get(channelId) { return store.get(channelId) || null; }

module.exports = { set, get };
