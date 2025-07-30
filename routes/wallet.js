const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const { getCryptoPrice } = require('../services/priceService');

router.get('/:playerId', async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const btcPrice = await getCryptoPrice('BTC');
    const ethPrice = await getCryptoPrice('ETH');

    res.json({
      BTC: player.wallet.BTC,
      BTC_usd: player.wallet.BTC * btcPrice,
      ETH: player.wallet.ETH,
      ETH_usd: player.wallet.ETH * ethPrice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
