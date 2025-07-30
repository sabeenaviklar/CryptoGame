const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Player = require('../models/Player');
const GameRound = require('../models/GameRound');
const Transaction = require('../models/Transaction');
const { getCryptoPrice } = require('../services/priceService');
const { getCrashPoint, getSeed } = require('../services/provablyFair');

let currentRound = null;
let roundNumber = 1;

async function startNewRound() {
  const seed = getSeed();
  const hash = crypto.createHash('sha256').update(seed + roundNumber).digest('hex');
  const crashPoint = getCrashPoint(seed, roundNumber);
  currentRound = new GameRound({
    roundId: roundNumber.toString(),
    crashPoint,
    seed,
    hash,
    bets: [],
    startTime: new Date(),
    outcomes: {}
  });
  await currentRound.save();
  roundNumber++;
  // Emit event via Socket.IO on round start
  if (global.io) global.io.emit('round_start', { roundId: currentRound.roundId });
}

// Cron: start/end rounds every 10 seconds
setInterval(async () => {
  if (!currentRound) {
    await startNewRound();
  } else {
    currentRound.endTime = new Date();
    // Finalize bets outcomes, mark winners/losers
    for (const bet of currentRound.bets) {
      if (!bet.cashedOut) {
        // Player loses bet
        currentRound.outcomes[bet.playerId.toString()] = 'lost';
      } else {
        currentRound.outcomes[bet.playerId.toString()] = 'won';
      }
    }
    await currentRound.save();
    if (global.io) global.io.emit('crash', { point: currentRound.crashPoint });
    currentRound = null;
  }
}, 10000);

router.post('/bet', async (req, res) => {
  try {
    console.log("Bet request:", req.body);
    // ...rest of your code
  } catch (err) {
    console.error("Error in /bet:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Place bet endpoint
// router.post('/bet', async (req, res) => {
//   try {
//     const { playerId, usdAmount, currency } = req.body;
//     if (!playerId || !usdAmount || usdAmount <= 0 || !currency) {
//       return res.status(400).json({ error: 'Invalid input' });
//     }
//     const player = await Player.findById(playerId);
//     if (!player) return res.status(404).json({ error: 'Player not found' });

//     const price = await getCryptoPrice(currency);
//     const cryptoAmount = usdAmount / price;

//     if (player.wallet[currency] < cryptoAmount) {
//       return res.status(400).json({ error: `Insufficient ${currency} balance` });
//     }
//     if (!currentRound) {
//       return res.status(400).json({ error: 'No active round currently, wait for next round' });
//     }

//     // Deduct from player wallet
//     player.wallet[currency] -= cryptoAmount;
//     await player.save();

//     // Add bet to round
//     currentRound.bets.push({
//       playerId,
//       usdAmount,
//       cryptoAmount,
//       currency,
//       cashedOut: false,
//       cashoutMultiplier: null
//     });

//     // Log transaction
//     const tx = new Transaction({
//       playerId,
//       usdAmount,
//       cryptoAmount,
//       currency,
//       transactionType: 'bet',
//       transactionHash: crypto.randomBytes(8).toString('hex'),
//       priceAtTime: price,
//       timestamp: new Date()
//     });
//     await tx.save();
//     await currentRound.save();

//     res.json({ message: 'Bet placed', cryptoAmount });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Cashout endpoint
router.post('/cashout', async (req, res) => {
  try {
    const { playerId, roundId } = req.body;
    if (!playerId || !roundId) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const round = await GameRound.findOne({ roundId });
    if (!round) return res.status(404).json({ error: 'Round not found' });

    const bet = round.bets.find(b => b.playerId.toString() === playerId);
    if (!bet) return res.status(400).json({ error: 'Bet not found' });
    if (bet.cashedOut) return res.status(400).json({ error: 'Already cashed out' });

    const now = new Date();
    const elapsedSeconds = (now - round.startTime) / 1000;
    const growthFactor = 0.1;
    let currentMultiplier = 1 + (elapsedSeconds * growthFactor);

    if (currentMultiplier >= round.crashPoint) {
      return res.status(400).json({ error: 'Round has crashed, too late to cash out' });
    }

    bet.cashedOut = true;
    bet.cashoutMultiplier = Math.min(currentMultiplier, round.crashPoint);

    // Calculate payout
    const payoutCrypto = bet.cryptoAmount * bet.cashoutMultiplier;

    const player = await Player.findById(playerId);
    player.wallet[bet.currency] += payoutCrypto;
    await player.save();

    const price = await getCryptoPrice(bet.currency);

    const tx = new Transaction({
      playerId,
      usdAmount: payoutCrypto * price,
      cryptoAmount: payoutCrypto,
      currency: bet.currency,
      transactionType: 'cashout',
      transactionHash: crypto.randomBytes(8).toString('hex'),
      priceAtTime: price,
      timestamp: new Date()
    });
    await tx.save();
    await round.save();

    // Emit cashout event
    if (global.io) global.io.emit('cashout', {
      playerId,
      multiplier: bet.cashoutMultiplier,
      payoutUSD: payoutCrypto * price
    });

    res.json({ 
      message: 'Cashed out',
      payoutCrypto,
      payoutUSD: payoutCrypto * price,
      multiplier: bet.cashoutMultiplier
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
