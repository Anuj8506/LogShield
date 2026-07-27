/**
 * LogShield — WebSocket Server
 *
 * This file creates a WebSocket server for live dashboard updates.
 * When an attack is detected, broadcast() pushes it to all
 * connected dashboard clients instantly.
 */

const WebSocket = require('ws');

// ── WebSocket Server ──────────────────────────────────────────
let wss = null;

/**
 * initWebSocket — creates the WebSocket server
 * @param {object} server - the HTTP server from Express
 */
const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Dashboard client connected via WebSocket');

    // Send a welcome message to the newly connected client
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'LogShield WebSocket connected'
    }));

    // Handle client disconnect
    ws.on('close', () => {
      console.log('Dashboard client disconnected');
    });
  });

  console.log('WebSocket server ready');
};

/**
 * broadcast — sends an alert to ALL connected dashboard clients
 * @param {object} alert - the full enriched attack object
 */
const broadcast = (alert) => {
  // If no WebSocket server yet — do nothing
  if (!wss) return;

  const message = JSON.stringify({
    type: 'new_alert',
    data: alert
  });

  // Send to every connected client
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`WebSocket broadcast sent to ${wss.clients.size} clients`);
};

module.exports = { initWebSocket, broadcast };