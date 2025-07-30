const crypto = require('crypto');

function getCrashPoint(seed, roundNumber) {
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const h = parseInt(hash.substring(0, 16), 16);
  if (h % 33 === 0) return 0; // instant crash
  return Math.min(Math.floor((100 / (1 - h / Math.pow(2, 52))) * 100) / 100, 100);
}

function getSeed() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { getCrashPoint, getSeed };
