/**
 * LogShield — IP Intelligence
 *
 * This file enriches an IP address with two things:
 * 1. Abuse score from AbuseIPDB (is this IP malicious?)
 * 2. Location from ipinfo (where is this IP from?)
 */

const axios = require('axios');

// ── AbuseIPDB ─────────────────────────────────────────────────

/**
 * getAbuseScore — checks IP reputation on AbuseIPDB
 * @param {string} ip - IP address to check
 * @returns {object} - abuse score and total reports
 */
const getAbuseScore = async (ip) => {
  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      headers: {
        'Key': process.env.ABUSEIPDB_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        ipAddress: ip,
        maxAgeInDays: 90
      }
    });

    const data = response.data.data;
    return {
      abuseScore: data.abuseConfidenceScore,
      totalReports: data.totalReports
    };
  } catch (error) {
    console.error(`AbuseIPDB error for ${ip}:`, error.message);
    // Return defaults if API call fails
    return { abuseScore: 0, totalReports: 0 };
  }
};

// ── ipinfo ────────────────────────────────────────────────────

/**
 * getLocation — gets location info from ipinfo
 * @param {string} ip - IP address to check
 * @returns {object} - country, city, isp
 */
const getLocation = async (ip) => {
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}`, {
      params: {
        token: process.env.IPINFO_TOKEN
      }
    });

    const data = response.data;
    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      isp: data.org || 'Unknown'
    };
  } catch (error) {
    console.error(`ipinfo error for ${ip}:`, error.message);
    // Return defaults if API call fails
    return { country: 'Unknown', city: 'Unknown', isp: 'Unknown' };
  }
};

// ── Main Function ─────────────────────────────────────────────

/**
 * enrichIP — combines abuse score and location into one object
 * @param {string} ip - IP address to enrich
 * @returns {object} - full IP intelligence object
 */
const enrichIP = async (ip) => {
  // Run both API calls at the same time — faster than one by one
  const [abuseData, locationData] = await Promise.all([
    getAbuseScore(ip),
    getLocation(ip)
  ]);

  return {
    ip,
    ...abuseData,
    ...locationData
  };
};

module.exports = { enrichIP };