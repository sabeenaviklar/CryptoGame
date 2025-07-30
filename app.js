require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

const { initializeSocket } = require('./websocket/socket');
const gameRoutes = require('./routes/game');
const walletRoutes = require('./routes/wallet');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/game', gameRoutes);
app.use('/api/wallet', walletRoutes);

const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
