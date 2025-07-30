Crypto Crash – Backend & Frontend
A real-time multiplayer "Crash" gambling game where players bet USD (converted to BTC/ETH), watch the multiplier rise, and can cash out before a random crash. Features provably fair mechanics, real-time crypto prices, and instant multiplayer updates.

🚀 Setup Instructions
Requirements
Node.js v18+

MongoDB Atlas (cloud) or local MongoDB

CoinGecko API (no API key required)

Installation & Configuration
Clone the repository:

text
git clone https://github.com/yourusername/crypto-crash.git
cd crypto-crash
npm install
Configure Environment Variables:

Create a .env file in your project root containing:

text
MONGO_URI=your_mongodb_atlas_uri
PORT=10000
For crypto prices, the app uses CoinGecko API (no key required).

Seed Sample Players (optional, for demo):

text
node test/populate_db.js
Start the Server Locally:

text
npm start
Visit http://localhost:3000/ws-client.html in your browser.

🛠️ API Endpoint Descriptions
Place Bet
POST /api/game/bet

Body:

json
{
  "playerId": "string",
  "usdAmount": 10,
  "currency": "BTC" // or "ETH"
}
Response:

json
{
  "message": "Bet placed",
  "cryptoAmount": 0.00017
}
or error:

json
{ "error": "Insufficient BTC balance" }
Cash Out
POST /api/game/cashout

Body:

json
{
  "playerId": "string",
  "roundId": "string"
}
Response:

json
{
  "message": "Cashed out",
  "payoutCrypto": 0.00033,
  "payoutUSD": 20.0,
  "multiplier": 2.0
}
Wallet Balance
GET /api/wallet/:playerId

Response:

json
{
  "BTC": 0.012,
  "BTC_usd": 720.80,
  "ETH": 0.45,
  "ETH_usd": 874.22
}
📡 WebSocket Event Descriptions
Socket.IO is used for real-time updates. The main client events:



Event	Payload Example	Description
round_start	{ "roundId": "6" }	New round has started
multiplier	{ "value": "1.37" }	Multiplier updated every 100ms
crash	{ "point": 8.04 }	Crash point for this round
cashout	{ "playerId":"...", "multiplier":2.6, "payoutUSD":26 }	Player has cashed out
Client-initiated event:

cashout: { "playerId": "...", "roundId": "..." }
(optional; cashout usually via REST API for payouts)

🎰 Provably Fair Crash Algorithm
Crash algorithm is cryptographically provable and transparent.

For each round:

Generate a random seed (crypto.randomBytes).

Calculate hash = SHA256(seed + round_number).

Parse a number from the hash, e.g., h = parseInt(hash.slice(0, 16), 16)

If h % 33 === 0, instant crash (0x).

Else,

text
crashPoint = Math.floor((100 / (1 - h / 2^52)) * 100) / 100
Both seed and hash are stored for each round, so any player can recompute and verify the crash was not manipulated.

This ensures the game is fair—no one, not even the server owner, can predict or change the outcome after the fact.

💱 USD-to-Crypto Conversion & Real-Time Price Fetching
Prices are fetched from CoinGecko’s public API:

Endpoint:
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd

Cached for 10 seconds per symbol to avoid rate limits.

USD bets are converted to selected crypto (BTC/ETH) at price time-of-bet.

Conversion Logic:

Player bets $10 in BTC when BTC = $60,000:

0.00016667 BTC = $10 / $60,000

If cashout at 2x:

0.00033334 BTC = 0.00016667 * 2

That payout shown in USD at live price

🧩 Approach Overview
Game Logic
Game rounds auto-start and end every 10 seconds.

Multiplier increases every 100ms (1 + time * growthFactor), broadcast via WebSockets.

Bets are placed per round; tracked with player and amounts.

On crash, unresolved bets are lost; successful cashouts resolved at crash/multiplier.

Cryptocurrency Integration
Bets in USD, converted to crypto at bet-time price.

Simulated wallet deducts crypto for bet, credits for cashout.

Transactions (bet/cashout) are logged with all details for auditability.

Crypto balances and payouts shown both in coin and live USD.

WebSockets (Realtime Multiplayer)
Round start, multiplier updates, cashouts, and crash events are broadcast instantly.

UI instantly updates for all players—true multiplayer experience.

Optional: clients can send cashout requests via websockets or REST (REST recommended for reliability).

👩💻 Contact & Support
If deploying on Render, set MONGO_URI and PORT in Render dashboard Environment tab.

If you need custom frontend or login, or want to demo with multiple users, reach out!

Happy crashing!
Game logic verifiable, crypto prices real, wallet balances honest, and multiplayer fully real-time. Build, deploy, and play!