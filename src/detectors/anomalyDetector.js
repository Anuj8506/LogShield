/**
 * LogShield — Anomaly Detector (Sliding Window)
 *
 * This file decides if an IP is attacking or not.
 * It uses a sliding window approach — meaning it always
 * counts attempts in the LAST 60 seconds, not since first seen.
 */

// ── Load thresholds from .env ─────────────────────────────────
const THRESHOLD = parseInt(process.env.BRUTE_FORCE_THRESHOLD) || 5;
const WINDOW_MS = (parseInt(process.env.BRUTE_FORCE_WINDOW_SECONDS) || 60) * 1000;

// ── In-memory store ───────────────────────────────────────────
// Stores list of attempt timestamps per IP
// Format: { '192.168.1.1': { attempts: [t1, t2, t3] } }
const ipTracker = {};

// ── Main Detection Function ───────────────────────────────────

/**
 * analyze — checks if a parsed log line is an attack
 * @param {object} parsedLine - output from logParser.js
 * @returns {object|null} - attack object if attack detected, null otherwise
 */
const analyze = (parsedLine) => {
  // We only care about failed passwords and invalid users
  if (
    parsedLine.type !== 'failed_password' &&
    parsedLine.type !== 'invalid_user'
  ) {
    return null;
  }

  const { ip, user } = parsedLine;
  const now = Date.now();

  // If we have never seen this IP — create a new entry
  if (!ipTracker[ip]) {
    ipTracker[ip] = { attempts: [now] };
    return null;
  }

  // Remove all timestamps older than the window
  // This is the sliding window — we only keep recent attempts
  ipTracker[ip].attempts = ipTracker[ip].attempts.filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  // Add the current attempt
  ipTracker[ip].attempts.push(now);

  // Count how many attempts in the last 60 seconds
  const recentCount = ipTracker[ip].attempts.length;

  // Check if count has crossed the threshold
  if (recentCount >= THRESHOLD) {
    // Reset tracker for this IP so we don't keep alerting
    delete ipTracker[ip];

    // Return the attack object
    return {
      ip,
      user,
      attempts: recentCount,
      attackType: 'brute_force',
      timestamp: new Date()
    };
  }

  // Count is below threshold — not an attack yet
  return null;
};

module.exports = { analyze };