/**
 * LogShield — SSH Log Tailer
 *
 * This file connects to a remote Linux server via SSH
 * and streams /var/log/auth.log live line by line.
 *
 * In mock mode — it generates fake log lines locally
 * so we can build and test without a real server.
 */

const { Client } = require('ssh2');
const fs = require('fs');

// ── Mock Log Lines ────────────────────────────────────────────
// Fake log lines in real auth.log format
// Used when MOCK_SSH=true in .env
const MOCK_LINES = [
  'Jul 24 09:15:32 server sshd: Failed password for root from 192.168.1.1 port 4822 ssh2',
  'Jul 24 09:15:33 server sshd: Failed password for root from 192.168.1.1 port 4822 ssh2',
  'Jul 24 09:15:34 server sshd: Failed password for root from 192.168.1.1 port 4822 ssh2',
  'Jul 24 09:15:35 server sshd: Failed password for root from 192.168.1.1 port 4822 ssh2',
  'Jul 24 09:15:36 server sshd: Failed password for root from 192.168.1.1 port 4822 ssh2',
  'Jul 24 09:15:37 server sshd: Invalid user admin from 192.168.2.2 port 4823',
  'Jul 24 09:15:38 server sshd: Accepted password for anuj from 192.168.3.3 port 4824 ssh2',
];

// ── Mock Tailer ───────────────────────────────────────────────

/**
 * startMockTailer — sends fake log lines every 2 seconds
 * @param {function} onLine - callback function called with each log line
 */
const startMockTailer = (onLine) => {
  console.log('Running in MOCK mode — using fake log lines');

  let index = 0;

  // Send one fake line every 2 seconds
  setInterval(() => {
    const line = MOCK_LINES[index % MOCK_LINES.length];
    onLine(line);
    index++;
  }, 2000);
};

// ── Real SSH Tailer ───────────────────────────────────────────

/**
 * startSSHTailer — connects to real server and streams auth.log
 * @param {function} onLine - callback function called with each log line
 */
const startSSHTailer = (onLine) => {
  const client = new Client();

  // Read SSH config from .env
    const sshConfig = {
        host: process.env.SSH_HOST,
        port: parseInt(process.env.SSH_PORT) || 22,
        username: process.env.SSH_USER,
        // Read the private key from a file on disk.
        // On Render: add the key as a Secret File, then set
        // SSH_PRIVATE_KEY_PATH to its mounted path (e.g. /etc/secrets/id_rsa).
        privateKey: fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH)
    };

  client.on('ready', () => {
    console.log(`SSH connected to ${process.env.SSH_HOST}`);

    // Run tail -f to stream the log file live
    client.exec('tail -f /var/log/auth.log', (err, stream) => {
      if (err) {
        console.error('SSH exec error:', err);
        return;
      }

      // Every time a new chunk of data arrives — split into lines
      stream.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
          if (line.trim()) onLine(line);
        });
      });

      // Handle SSH stream closing
      stream.on('close', () => {
        console.log('SSH stream closed');
        client.end();
      });
    });
  });

  // Handle connection errors
  client.on('error', (err) => {
    console.error('SSH connection error:', err.message);
  });

  client.connect(sshConfig);
};

// ── Main Export ───────────────────────────────────────────────

/**
 * startTailer — starts either mock or real SSH tailer
 * based on MOCK_SSH value in .env
 * @param {function} onLine - callback called with each log line
 */
const startTailer = (onLine) => {
  if (process.env.MOCK_SSH === 'true') {
    startMockTailer(onLine);
  } else {
    startSSHTailer(onLine);
  }
};

module.exports = { startTailer };