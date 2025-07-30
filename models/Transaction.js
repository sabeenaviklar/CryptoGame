const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  playerId: mongoose.Schema.Types.ObjectId,
  usdAmount: Number,
  cryptoAmount: Number,
  currency: String,
  transactionType: String, // bet or cashout
  transactionHash: String,
  priceAtTime: Number,
  timestamp: Date
});
module.exports = mongoose.model('Transaction', TransactionSchema);
