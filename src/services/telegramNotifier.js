/**
 * LogShield — Telegram Notifier
 *
 * This file sends attack alerts to your Telegram phone.
 * It formats the alert nicely and sends it instantly.
 */

const TelegramBot = require('node-telegram-bot-api');

// ── Initialize Bot ────────────────────────────────────────────
// polling: false because we only SEND messages, never receive
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// ── Main Function ─────────────────────────────────────────────

/**
 * sendAlert — formats and sends an attack alert to Telegram
 * @param {object} alert - the full enriched attack object
 */
const sendAlert = async (alert) => {
  try {
    // Format the message using HTML instead of Markdown
    const message = `
🚨 <b>ATTACK DETECTED</b>

🌐 <b>IP:</b> <code>${alert.ip}</code>
🗺 <b>Location:</b> ${alert.city}, ${alert.country}
🏢 <b>ISP:</b> ${alert.isp}
⚠️ <b>Abuse Score:</b> ${alert.abuseScore}/100
📊 <b>Total Reports:</b> ${alert.totalReports}
🔁 <b>Attempts:</b> ${alert.attempts}
💀 <b>Attack Type:</b> ${alert.attackType}
👤 <b>Target User:</b> ${alert.user}
🕐 <b>Time:</b> ${new Date(alert.timestamp).toLocaleString()}
    `.trim();

    // Send to your Telegram chat
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML'
    });

    console.log(`Telegram alert sent for IP: ${alert.ip}`);
  } catch (error) {
    console.error('Telegram alert error:', error.message);
  }
};

module.exports = { sendAlert };