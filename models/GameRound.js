const mongoose = require('mongoose');
const GameRoundSchema = new mongoose.Schema({
  roundId: String,
  crashPoint: Number,
  seed: String,
  hash: String,
  bets: [{
    playerId: mongoose.Schema.Types.ObjectId,
    usdAmount: Number,
    cryptoAmount: Number,
    currency: String,
    cashedOut: { type: Boolean, default: false },
    cashoutMultiplier: Number,
  }],
  startTime: Date,
  endTime: Date,
  outcomes: Object
});
module.exports = mongoose.model('GameRound', GameRoundSchema);
