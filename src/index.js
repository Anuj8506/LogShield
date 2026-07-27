const dns = require("dns");
dns.setServers(["8.8.8.8" , "8.8.4.4"]);

require('dotenv').config();

const connectDB = require('../config/db');
const { startServer } = require('./api/server');
const { startAuditor } = require('./auditor');

// Start the app
const start = async () => {
  // Step 1 — Connect to MongoDB
  await connectDB();

  // Step 2 — Start Express + WebSocket server
  startServer();

  // Step 3 — Start the main auditor loop
  startAuditor();
};

start();