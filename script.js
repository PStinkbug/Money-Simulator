let cash = 10000;
let day = 1;

let assets = { BTC: 30000, ETH: 2000, AAPL: 150, TSLA: 250 };
let portfolio = { BTC: 0, ETH: 0, AAPL: 0, TSLA: 0 };
let history = { BTC: [] };

const newsEvents = [
    { text: "Crypto market surges!", effect: 0.15 },
    { text: "Crypto crash!", effect: -0.2 },
    { text: "Tech stocks rally!", effect: 0.1 },
    { text: "Market uncertainty causes selloff", effect: -0.1 }
];

const ctx = document.getElementById("priceChart").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label: "BTC Price", data: [], borderColor: "green", tension: 0.2 }] }
});

// ------------------- FETCH REAL PRICES -------------------
async function fetchCryptoPrice(symbol) {
    try {
        const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
        const data = await resp.json();
        return data[symbol]?.usd || assets[symbol];
    } catch {
        return assets[symbol]; // fallback
    }
}

async function fetchStockPrice(symbol) {
    try {
        const resp = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=demo`);
        const data = await resp.json();
        return data[0]?.price || assets[symbol];
    } catch {
        return assets[symbol]; // fallback
    }
}

async function updateMarketReal() {
    assets.BTC = await fetchCryptoPrice("bitcoin");
    assets.ETH = await fetchCryptoPrice("ethereum");
    assets.AAPL = await fetchStockPrice("AAPL");
    assets.TSLA = await fetchStockPrice("TSLA");
}

// ------------------- GAME LOGIC -------------------
function newsEvent() {
    if (Math.random() < 0.3) {
        const event = newsEvents[Math.floor(Math.random() * newsEvents.length)];
        alert(event.text);
        for (let asset in assets) assets[asset] *= (1 + event.effect);
    }
}

function render() {
    document.getElementById("day").innerText = `Day ${day}`;

    let marketHTML = "<h3>Market</h3>";
    for (let a in assets) marketHTML += `${a}: $${Math.round(assets[a])}<br>`;
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

// ------------------- PLAYER ACTIONS -------------------
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

// ------------------- NEXT DAY -------------------
let lastFetch = 0;
async function nextDay() {
    const now = Date.now();
    if (now - lastFetch < 10000) return alert("Wait 10 seconds before next day.");
    lastFetch = now;

    day++;
    await updateMarketReal();
    newsEvent();
    updateChart();
    render();
}

// ------------------- SAVE / LOAD -------------------
function saveGame() {
    localStorage.setItem("moneySim", JSON.stringify({ cash, day, assets, portfolio, history }));
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
