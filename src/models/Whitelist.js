const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
  // The trusted IP address
  ip: {
    type: String,
    required: true,
    unique: true
  },

  // Why did you trust this IP?
  reason: {
    type: String,
    default: 'No reason provided'
  },

  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Whitelist', whitelistSchema);