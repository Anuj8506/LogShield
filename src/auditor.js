/**
 * LogShield — Main Auditor
 *
 * This is the brain of LogShield.
 * It connects all modules together in the right order.
 * Raw log line → parse → detect → enrich → alert → save → broadcast
 */

const { startTailer } = require('./services/sshTailer');
const { parseLine } = require('./parsers/logParser');
const { analyze } = require('./detectors/anomalyDetector');
const { enrichIP } = require('./services/ipIntel');
const { sendAlert } = require('./services/telegramNotifier');
const Blacklist = require('./models/Blacklist');
const { broadcast } = require('./api/websocket');
const Alert = require('./models/Alert');

// ── Main Auditor Function ─────────────────────────────────────

/**
 * startAuditor — starts the main monitoring loop
 * This function wires all modules together
 */
const startAuditor = () => {
  console.log('Auditor started — watching for attacks...');

  startTailer(async (rawLine) => {
    // Step 1 — Parse the raw log line
    const parsed = parseLine(rawLine);
    if (!parsed) return;

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
    console.log(`Parsed: [${parsed.type}] from ${parsed.ip}`);
    }
    // Step 2 — Check if this line is part of an attack
    const attack = analyze(parsed);
    if (!attack) return;

    console.log(`Attack detected from ${attack.ip} — enriching IP...`);

    // Step 3 — Enrich the IP with location and abuse score
    const intel = await enrichIP(attack.ip);

    // Step 4 — Combine attack data with IP intelligence
    const fullAlert = {
      ...attack,
      ...intel
    };

    console.log('Full alert:', fullAlert);

    // Step 5 — Send Telegram alert
    await sendAlert(fullAlert);

    // Step 6 — Auto blacklist if abuse score is 100
    if (fullAlert.abuseScore === 100) {
      try {
        const existing = await Blacklist.findOne({ ip: fullAlert.ip });
        if (!existing) {
          await Blacklist.create({
            ip: fullAlert.ip,
            reason: 'Attacker'
          });
          console.log(`Auto blacklisted IP: ${fullAlert.ip} (abuse score 100)`);
        }
      } catch (error) {
        console.error('Auto blacklist error:', error.message);
      }
    }

    // Step 7 — Save to MongoDB
    try {
      const alertDoc = new Alert({
        ip: fullAlert.ip,
        country: fullAlert.country,
        city: fullAlert.city,
        abuseScore: fullAlert.abuseScore,
        attackType: fullAlert.attackType,
        attempts: fullAlert.attempts,
        timestamp: fullAlert.timestamp
      });

      await alertDoc.save();
      console.log(`Alert saved to MongoDB for IP: ${fullAlert.ip}`);

      // Step 7 — Broadcast to dashboard via WebSocket
      broadcast({
        ...fullAlert,
        _id: alertDoc._id,
        resolved: false
      });

    } catch (error) {
      console.error('MongoDB save error:', error.message);
    }
  });
};

module.exports = { startAuditor };