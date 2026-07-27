const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },

  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },

  // AbuseIPDB score — how malicious is this IP (0 to 100)
  abuseScore: {
    type: Number,
    default: 0
  },

  attackType: {
    type: String,
    enum: ['brute_force', 'port_scan', 'other'],
    default: 'brute_force'
  },

  attempts: {
    type: Number,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  resolved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Alert', alertSchema);