// ── Regex Patterns ────────────────────────────────────────────
// Each pattern describes the shape of a specific log line type

// Matches failed password attempts
// Example line:
// Jul 24 09:15:32 server sshd: Failed password for root from 192.168.1.1 port 4822 ssh2
const FAILED_PASSWORD_REGEX = /(\w+\s+\d+\s+[\d:]+).*Failed password for (\S+) from (\S+) port (\d+)/;

// Matches successful logins
// Example line:
// Jul 24 09:15:32 server sshd: Accepted password for anuj from 192.168.1.1 port 4822 ssh2
const ACCEPTED_PASSWORD_REGEX = /(\w+\s+\d+\s+[\d:]+).*Accepted password for (\S+) from (\S+) port (\d+)/;

// Matches invalid user attempts
// Example line:
// Jul 24 09:15:32 server sshd: Invalid user admin from 192.168.1.1 port 4822
const INVALID_USER_REGEX = /(\w+\s+\d+\s+[\d:]+).*Invalid user (\S+) from (\S+) port (\d+)/;


// ── Parser Function ───────────────────────────────────────────

/**
 * parseLine — takes one raw log line and returns a JS object
 * @param {string} line - one raw line from auth.log
 * @returns {object|null} - parsed object or null if line is not relevant
 */
const parseLine = (line) => {

  // Check if line matches failed password pattern
  let match = line.match(FAILED_PASSWORD_REGEX);
  if (match) {
    return {
      timestamp: match[1],
      type: 'failed_password',
      user: match[2],
      ip: match[3],
      port: match[4]
    };
  }

  // Check if line matches accepted password pattern
  match = line.match(ACCEPTED_PASSWORD_REGEX);
  if (match) {
    return {
      timestamp: match[1],
      type: 'accepted_password',
      user: match[2],
      ip: match[3],
      port: match[4]
    };
  }

  // Check if line matches invalid user pattern
  match = line.match(INVALID_USER_REGEX);
  if (match) {
    return {
      timestamp: match[1],
      type: 'invalid_user',
      user: match[2],
      ip: match[3],
      port: match[4]
    };
  }

  // Line is not relevant — ignore it
  return null;
};

module.exports = { parseLine };