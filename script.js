let cash = 10000;

// Store both price and change percentage
let assets = {
    AAPL: { price: 150, change: 0 },
    TSLA: { price: 250, change: 0 },
    BTC: { price: 30000, change: 0 },
    ETH: { price: 2000, change: 0 }
};

let portfolio = {
    AAPL: 0,
    TSLA: 0,
    BTC: 0,
    ETH: 0
};

// Store purchase prices for calculating gains/losses
let purchasePrices = {
    AAPL: 0,
    TSLA: 0,
    BTC: 0,
    ETH: 0
};

function updateMarket() {
    for (let asset in assets) {
        // Generate random change between -5% and +5%
        let changePercent = (Math.random() * 0.1) - 0.05;
        let oldPrice = assets[asset].price;
        
        // Update price with change
        assets[asset].price = Math.round(assets[asset].price * (1 + changePercent));
        
        // Calculate actual change amount and percentage
        let changeAmount = assets[asset].price - oldPrice;
        assets[asset].change = Math.round(changeAmount);
    }
    render();
}

function render() {
    let marketHTML = "<h3>📈 Market Prices</h3>";
    for (let a in assets) {
        let changeSymbol = assets[a].change >= 0 ? "📈" : "📉";
        let changeClass = assets[a].change >= 0 ? "color: #4CAF50;" : "color: #F44336;";
        marketHTML += `${a}: $${assets[a].price} <span style="${changeClass}">${changeSymbol} $${Math.abs(assets[a].change)}</span><br>`;
    }
    document.getElementById("market").innerHTML = marketHTML;

    let total = cash;
    let portHTML = `<h3>💰 Portfolio</h3>Cash: $${cash.toLocaleString()}<br>`;
    
    for (let a in portfolio) {
        if (portfolio[a] > 0) {
            let value = portfolio[a] * assets[a].price;
            total += value;
            let avgPrice = purchasePrices[a] / portfolio[a] || assets[a].price;
            let gainLoss = value - (portfolio[a] * avgPrice);
            let gainLossPercent = avgPrice > 0 ? ((assets[a].price - avgPrice) / avgPrice * 100).toFixed(2) : 0;
            
            portHTML += `${a}: ${portfolio[a]} shares<br>`;
            portHTML += `&nbsp;&nbsp;Value: $${value.toLocaleString()}<br>`;
            portHTML += `&nbsp;&nbsp;Avg Price: $${avgPrice.toFixed(2)}<br>`;
            portHTML += `&nbsp;&nbsp;P/L: $${gainLoss.toFixed(2)} (${gainLossPercent}%)<br>`;
        }
    }
    
    portHTML += `<br><strong>Total Value: $${Math.round(total).toLocaleString()}</strong>`;
    document.getElementById("portfolio").innerHTML = portHTML;
}

function buy() {
    let asset = document.getElementById("asset").value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById("amount").value);
    
    // Input validation
    if (!asset || asset.length === 0) {
        alert("Please enter an asset name");
        return;
    }
    
    if (!assets[asset]) {
        alert(`Invalid asset. Available: ${Object.keys(assets).join(", ")}`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }
    
    let cost = assets[asset].price * amount;
    
    if (cost > cash) {
        alert(`Not enough cash! You need $${cost.toFixed(2)} but only have $${cash.toFixed(2)}`);
        return;
    }
    
    // Update portfolio and purchase prices
    cash -= cost;
    portfolio[asset] += amount;
    purchasePrices[asset] += cost;
    
    // Clear inputs
    document.getElementById("amount").value = "";
    
    render();
}

function sell() {
    let asset = document.getElementById("asset").value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById("amount").value);
    
    // Input validation
    if (!asset || asset.length === 0) {
        alert("Please enter an asset name");
        return;
    }
    
    if (!assets[asset]) {
        alert(`Invalid asset. Available: ${Object.keys(assets).join(", ")}`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }
    
    if (portfolio[asset] < amount) {
        alert(`Not enough ${asset}! You have ${portfolio[asset]} but trying to sell ${amount}`);
        return;
    }
    
    let revenue = assets[asset].price * amount;
    
    // Update portfolio and purchase prices (pro-rata reduction)
    cash += revenue;
    portfolio[asset] -= amount;
    
    // Calculate proportion of holdings being sold
    let proportion = amount / (portfolio[asset] + amount);
    purchasePrices[asset] -= purchasePrices[asset] * proportion;
    
    // Clear inputs
    document.getElementById("amount").value = "";
    
    render();
}

function nextDay() {
    updateMarket();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        buy();
    }
    if (event.key === 'Escape') {
        document.getElementById("amount").value = "";
        document.getElementById("asset").value = "";
    }
});

// Initialize
render();
