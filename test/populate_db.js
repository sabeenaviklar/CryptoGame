require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../models/Player');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const players = [
      { username: 'alice', wallet: { BTC: 0.01, ETH: 0.5 } },
      { username: 'bob', wallet: { BTC: 0.05, ETH: 1 } },
      { username: 'charlie', wallet: { BTC: 0.1, ETH: 2 } }
    ];

    for (const p of players) {
      let existing = await Player.findOne({ username: p.username });
      if (!existing) {
        let player = new Player(p);
        await player.save();
        console.log('Player created:', p.username);
      } else {
        console.log('Player exists:', p.username);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
