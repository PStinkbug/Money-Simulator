let cash = 10000;
let day = 1;

// Initial assets
let assets = {
    BTC: 30000,
    ETH: 2000,
    AAPL: 150,
    TSLA: 250
};

let portfolio = {
    BTC: 0,
    ETH: 0,
    AAPL: 0,
    TSLA: 0
};

let history = {
    BTC: []
};

const newsEvents = [
    { text: "Crypto market surges!", effect: 0.15 },
    { text: "Crypto crash!", effect: -0.2 },
    { text: "Tech stocks rally!", effect: 0.1 },
    { text: "Market uncertainty causes selloff", effect: -0.1 }
];

// ⚠️ Replace with your own Alpha Vantage API key
const ALPHA_KEY = "TDTMF4AV21JMAHWU";

// Chart.js setup
const ctx = document.getElementById("priceChart").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "BTC Price",
            data: [],
            borderColor: "green",
            tension: 0.2
        }]
    }
});

// ------------------- REAL MARKET DATA -------------------
async function fetchStockPrice(symbol) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
            return parseFloat(data["Global Quote"]["05. price"]);
        }
    } catch (e) {
        console.error("Error fetching stock price:", e);
    }
    return null;
}

async function fetchCryptoPrice(symbol) {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_KEY}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data["Realtime Currency Exchange Rate"] && data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]) {
            return parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
        }
    } catch (e) {
        console.error("Error fetching crypto price:", e);
    }
    return null;
}

// Update all assets from real market
async function updateMarketReal() {
    // Stocks
    for (let symbol of ["AAPL", "TSLA"]) {
        const price = await fetchStockPrice(symbol);
        if (price) assets[symbol] = price;
    }

    // Crypto
    for (let symbol of ["BTC", "ETH"]) {
        const price = await fetchCryptoPrice(symbol);
        if (price) assets[symbol] = price;
    }
}

// ------------------- GAME LOGIC -------------------
function newsEvent() {
    if (Math.random() < 0.3) {
        const event = newsEvents[Math.floor(Math.random() * newsEvents.length)];
        alert(event.text);
        for (let asset in assets) {
            assets[asset] *= (1 + event.effect);
        }
    }
}

function render() {
    document.getElementById("day").innerText = `Day ${day}`;

    let marketHTML = "<h3>Market</h3>";
    for (let a in assets) {
        marketHTML += `${a}: $${Math.round(assets[a])}<br>`;
    }
    document.getElementById("market").innerHTML = marketHTML;

    let total = cash;
    let portfolioHTML = `<h3>Portfolio</h3>Cash: $${Math.round(cash)}<br>`;
    for (let a in portfolio) {
        total += portfolio[a] * assets[a];
        portfolioHTML += `${a}: ${portfolio[a]}<br>`;
    }
    portfolioHTML += `<br>Total Value: $${Math.round(total)}`;
    document.getElementById("portfolio").innerHTML = portfolioHTML;
}

function updateChart() {
    history.BTC.push(Math.round(assets.BTC));
    chart.data.labels.push(day);
    chart.data.datasets[0].data = history.BTC;
    chart.update();
}

function buy() {
    let asset = document.getElementById("asset").value.toUpperCase();
    let amount = Number(document.getElementById("amount").value);
    if (!assets[asset] || amount <= 0) return alert("Invalid input");
    let cost = assets[asset] * amount;
    if (cost > cash) return alert("Not enough cash");
    cash -= cost;
    portfolio[asset] += amount;
    render();
}

function sell() {
    let asset = document.getElementById("asset").value.toUpperCase();
    let amount = Number(document.getElementById("amount").value);
    if (portfolio[asset] < amount || amount <= 0) return alert("Invalid input");
    cash += assets[asset] * amount;
    portfolio[asset] -= amount;
    render();
}

async function nextDay() {
    day++;
    await updateMarketReal(); // Get real prices
    newsEvent();
    updateChart();
    render();
}

function saveGame() {
    localStorage.setItem("moneySim", JSON.stringify({
        cash, day, assets, portfolio, history
    }));
    alert("Game saved!");
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("moneySim"));
    if (!data) return alert("No save found");
    cash = data.cash;
    day = data.day;
    assets = data.assets;
    portfolio = data.portfolio;
    history = data.history;
    chart.data.labels = history.BTC.map((_, i) => i + 1);
    chart.data.datasets[0].data = history.BTC;
    chart.update();
    render();
}

render();

