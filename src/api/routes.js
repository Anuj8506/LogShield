/**
 * LogShield — API Routes
 *
 * This file defines all the URLs the API responds to.
 * It talks to MongoDB to get, update and delete alerts.
 */

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Whitelist = require('../models/Whitelist');
const Blacklist = require('../models/Blacklist');

// ── Alert Routes ──────────────────────────────────────────────

// GET /api/alerts — get all alerts, newest first
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/alerts/:ip — get all alerts for a specific IP
router.get('/alerts/:ip', async (req, res) => {
  try {
    const alerts = await Alert.find({ ip: req.params.ip }).sort({ timestamp: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/alerts/:id/resolve — mark an alert as resolved
router.patch('/alerts/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/alerts/:id — delete an alert
router.delete('/alerts/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Whitelist Routes ──────────────────────────────────────────

// GET /api/whitelist — get all whitelisted IPs
router.get('/whitelist', async (req, res) => {
  try {
    const whitelist = await Whitelist.find().sort({ addedAt: -1 });
    res.json({ success: true, count: whitelist.length, data: whitelist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/whitelist — add an IP to whitelist
router.post('/whitelist', async (req, res) => {
  try {
    const { ip, reason } = req.body;
    const entry = new Whitelist({ ip, reason });
    await entry.save();
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/whitelist/:id — remove an IP from whitelist
router.delete('/whitelist/:id', async (req, res) => {
  try {
    await Whitelist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'IP removed from whitelist' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Blacklist Routes ──────────────────────────────────────────

// GET /api/blacklist — get all blacklisted IPs
router.get('/blacklist', async (req, res) => {
  try {
    const blacklist = await Blacklist.find().sort({ addedAt: -1 });
    res.json({ success: true, count: blacklist.length, data: blacklist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/blacklist — add an IP to blacklist
router.post('/blacklist', async (req, res) => {
  try {
    const { ip, reason } = req.body;
    const entry = new Blacklist({ ip, reason });
    await entry.save();
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/blacklist/:id — remove an IP from blacklist
router.delete('/blacklist/:id', async (req, res) => {
  try {
    await Blacklist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'IP removed from blacklist' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;