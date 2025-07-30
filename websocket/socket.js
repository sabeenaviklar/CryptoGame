const { Server } = require('socket.io');

let io = null;

function initializeSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  global.io = io; // Make globally available in routes

  let multiplier = 1;
  const growthFactor = 0.1;
  let interval = null;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('cashout', async (data) => {
      // Simply emit cashout and rely on REST for actual processing
      io.emit('cashout', data);
    });
  });

  function resetMultiplier() {
    multiplier = 1;
  }

  function startMultiplierLoop() {
    resetMultiplier();
    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      multiplier += 0.01;
      io.emit('multiplier', { value: multiplier.toFixed(2) });

      if (multiplier >= 30) resetMultiplier();
    }, 100);
  }

  startMultiplierLoop();
}

module.exports = { initializeSocket };
