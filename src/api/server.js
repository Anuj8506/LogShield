/**
 * LogShield — Express Server
 *
 * This file creates the Express app and HTTP server.
 * It attaches the API routes, WebSocket server, and CORS.
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { initWebSocket } = require('./websocket');

// ── Create Express App ────────────────────────────────────────
const app = express();

// Allow requests from React dev server and production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://logshield-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Serve static files from frontend build folder (production)
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// Attach all API routes under /api prefix
app.use('/api', routes);

// ── Health Check Route ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'LogShield is running' });
});

// ── Catch All Route ───────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start Server ──────────────────────────────────────────────
const startServer = () => {
  const server = http.createServer(app);
  initWebSocket(server);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/alerts`);
    console.log(`Serving frontend from: ${distPath}`);
  });

  return server;
};

module.exports = { startServer };