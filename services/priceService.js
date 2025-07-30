const axios = require('axios');
let priceCache = {};
let lastFetch = 0;

async function getCryptoPrice(symbol) {
  const now = Date.now();
  if (!priceCache[symbol] || now - lastFetch > 10000) {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
    priceCache = {
      BTC: res.data.bitcoin.usd,
      ETH: res.data.ethereum.usd
    };
    lastFetch = now;
  }
  return priceCache[symbol];
}

module.exports = { getCryptoPrice };
