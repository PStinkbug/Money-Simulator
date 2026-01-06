let cash = 10000;

let assets = {
    AAPL: 150,
    TSLA: 250,
    BTC: 30000,
    ETH: 2000
};

let portfolio = {
    AAPL: 0,
    TSLA: 0,
    BTC: 0,
    ETH: 0
};

function updateMarket() {
    for (let asset in assets) {
        let change = (Math.random() * 0.1) - 0.05;
        assets[asset] = Math.round(assets[asset] * (1 + change));
    }
    render();
}

function render() {
    let marketHTML = "<h3>Market</h3>";
    for (let a in assets) {
        marketHTML += `${a}: $${assets[a]}<br>`;
    }
    document.getElementById("market").innerHTML = marketHTML;

    let total = cash;
    let portHTML = `<h3>Portfolio</h3>Cash: $${cash}<br>`;
    for (let a in portfolio) {
        total += portfolio[a] * assets[a];
        portHTML += `${a}: ${portfolio[a]}<br>`;
    }
    portHTML += `<br>Total Value: $${total}`;
    document.getElementById("portfolio").innerHTML = portHTML;
}

function buy() {
    let asset = document.getElementById("asset").value.toUpperCase();
    let amount = Number(document.getElementById("amount").value);
    if (!assets[asset]) return alert("Invalid asset");
    let cost = assets[asset] * amount;
    if (cost > cash) return alert("Not enough cash");
    cash -= cost;
    portfolio[asset] += amount;
    render();
}

function sell() {
    let asset = document.getElementById("asset").value.toUpperCase();
    let amount = Number(document.getElementById("amount").value);
    if (portfolio[asset] < amount) return alert("Not enough assets");
    cash += assets[asset] * amount;
    portfolio[asset] -= amount;
    render();
}

function nextDay() {
    updateMarket();
}

render();
