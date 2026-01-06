// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // allow frontend requests

const PORT = process.env.PORT || 3000;
const ALPHA_KEY = process.env.ALPHA_KEY; // store key in .env

// Fetch stock price
async function getStockPrice(symbol) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data["Global Quote"]?.["05. price"] || null;
}

// Fetch crypto price
async function getCryptoPrice(symbol) {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"] || null;
}

// Endpoint for frontend to get prices
app.get("/prices", async (req, res) => {
    try {
        const BTC = await getCryptoPrice("BTC");
        const ETH = await getCryptoPrice("ETH");
        const AAPL = await getStockPrice("AAPL");
        const TSLA = await getStockPrice("TSLA");

        res.json({
            BTC: BTC ? parseFloat(BTC) : 30000,
            ETH: ETH ? parseFloat(ETH) : 2000,
            AAPL: AAPL ? parseFloat(AAPL) : 150,
            TSLA: TSLA ? parseFloat(TSLA) : 250
        });
    } catch (err) {
        console.error(err);
        res.json({
            BTC: 30000,
            ETH: 2000,
            AAPL: 150,
            TSLA: 250
        });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
