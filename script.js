// Initialize game state
let cash = 10000;
let day = 1;
let tradesToday = 0;
let totalTrades = 0;
let profitableTrades = 0;
let selectedAsset = "BTC";
let priceHistory = {};
let chart = null;
let previousPrices = {};

// Cryptocurrency data with more realistic properties
let cryptocurrencies = {
    BTC: {
        name: "Bitcoin",
        price: 32000,
        change24h: 0,
        change7d: 0,
        marketCap: 620000000000,
        volume24h: 15000000000,
        volatility: 0.08,
        icon: "fab fa-bitcoin",
        color: "#F7931A"
    },
    ETH: {
        name: "Ethereum",
        price: 2100,
        change24h: 0,
        change7d: 0,
        marketCap: 250000000000,
        volume24h: 8000000000,
        volatility: 0.09,
        icon: "fab fa-ethereum",
        color: "#627EEA"
    },
    SOL: {
        name: "Solana",
        price: 42.50,
        change24h: 0,
        change7d: 0,
        marketCap: 17000000000,
        volume24h: 600000000,
        volatility: 0.12,
        icon: "fas fa-fire",
        color: "#00FFA3"
    },
    ADA: {
        name: "Cardano",
        price: 0.38,
        change24h: 0,
        change7d: 0,
        marketCap: 13000000000,
        volume24h: 300000000,
        volatility: 0.10,
        icon: "fas fa-chart-line",
        color: "#0033AD"
    },
    XRP: {
        name: "Ripple",
        price: 0.62,
        change24h: 0,
        change7d: 0,
        marketCap: 33000000000,
        volume24h: 1500000000,
        volatility: 0.07,
        icon: "fas fa-bolt",
        color: "#23292F"
    },
    DOGE: {
        name: "Dogecoin",
        price: 0.075,
        change24h: 0,
        change7d: 0,
        marketCap: 10000000000,
        volume24h: 400000000,
        volatility: 0.15,
        icon: "fas fa-dog",
        color: "#C2A633"
    },
    DOT: {
        name: "Polkadot",
        price: 5.20,
        change24h: 0,
        change7d: 0,
        marketCap: 6500000000,
        volume24h: 200000000,
        volatility: 0.11,
        icon: "fas fa-circle",
        color: "#E6007A"
    },
    MATIC: {
        name: "Polygon",
        price: 0.85,
        change24h: 0,
        change7d: 0,
        marketCap: 8000000000,
        volume24h: 350000000,
        volatility: 0.10,
        icon: "fas fa-bezier-curve",
        color: "#8247E5"
    }
};

// Portfolio with initial holdings
let portfolio = {
    BTC: { amount: 0, avgPrice: 0, totalCost: 0 },
    ETH: { amount: 0, avgPrice: 0, totalCost: 0 },
    SOL: { amount: 0, avgPrice: 0, totalCost: 0 },
    ADA: { amount: 0, avgPrice: 0, totalCost: 0 },
    XRP: { amount: 0, avgPrice: 0, totalCost: 0 },
    DOGE: { amount: 0, avgPrice: 0, totalCost: 0 },
    DOT: { amount: 0, avgPrice: 0, totalCost: 0 },
    MATIC: { amount: 0, avgPrice: 0, totalCost: 0 }
};

// Transaction history
let transactions = [];

// News headlines
const newsHeadlines = [
    "Bitcoin ETF approval expected this quarter",
    "Ethereum completes Shanghai upgrade successfully",
    "Regulatory crackdown on crypto exchanges in some regions",
    "Major bank announces crypto custody services",
    "NFT market shows signs of recovery",
    "New blockchain protocol promises 100k TPS",
    "Crypto donations surge for disaster relief",
    "Stablecoin legislation under discussion in Congress",
    "Web3 gaming platform raises $50M in funding",
    "Environmental concerns drive shift to green mining",
    "DeFi protocol suffers $20M exploit",
    "Celebrity endorsement boosts meme coin by 300%",
    "Central bank digital currency trials expand globally",
    "Crypto winter may be ending, analysts suggest",
    "Layer 2 solutions gain significant adoption"
];

// Initialize price history for charting
function initializePriceHistory() {
    for (let symbol in cryptocurrencies) {
        priceHistory[symbol] = [];
        // Generate 30 days of historical data
        let basePrice = cryptocurrencies[symbol].price;
        for (let i = 0; i < 30; i++) {
            let change = (Math.random() * cryptocurrencies[symbol].volatility * 2 - cryptocurrencies[symbol].volatility);
            basePrice *= (1 + change);
            priceHistory[symbol].push({
                day: i + 1,
                price: basePrice
            });
        }
        // Set current price as last historical price
        cryptocurrencies[symbol].price = Math.round(basePrice * 100) / 100;
        previousPrices[symbol] = cryptocurrencies[symbol].price;
    }
}

// Generate fake wallet address
function generateWalletAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
}

// Update market prices with realistic crypto volatility
function updateMarket() {
    tradesToday = 0;
    
    for (let symbol in cryptocurrencies) {
        let crypto = cryptocurrencies[symbol];
        let previousPrice = crypto.price;
        
        // Store previous price for change calculation
        previousPrices[symbol] = previousPrice;
        
        // Simulate more realistic crypto price movements
        let randomFactor = Math.random();
        let change;
        
        if (randomFactor < 0.1) {
            // 10% chance of a big move (±10-20%)
            change = (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        } else if (randomFactor < 0.3) {
            // 20% chance of a medium move (±5-10%)
            change = (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
        } else {
            // 70% chance of normal volatility
            change = (Math.random() * crypto.volatility * 2 - crypto.volatility);
        }
        
        // Add some momentum (if price was rising, more likely to continue)
        if (crypto.change24h > 0) {
            change += Math.random() * 0.02;
        } else if (crypto.change24h < 0) {
            change -= Math.random() * 0.02;
        }
        
        // Update price
        crypto.price *= (1 + change);
        crypto.price = Math.round(crypto.price * 100) / 100;
        
        // Update 24h change
        crypto.change24h = ((crypto.price - previousPrice) / previousPrice) * 100;
        
        // Update price history for chart
        priceHistory[symbol].push({
            day: day,
            price: crypto.price
        });
        if (priceHistory[symbol].length > 30) {
            priceHistory[symbol].shift();
        }
    }
    
    day++;
    render();
}

// Render the entire application
function render() {
    renderMarket();
    renderPortfolio();
    renderTransactionHistory();
    renderNewsTicker();
    renderChart();
    updateStats();
}

// Render market overview
function renderMarket() {
    let marketGrid = document.getElementById('marketGrid');
    marketGrid.innerHTML = '';
    
    for (let symbol in cryptocurrencies) {
        let crypto = cryptocurrencies[symbol];
        let changeClass = crypto.change24h >= 0 ? 'positive' : 'negative';
        let changeIcon = crypto.change24h >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        marketGrid.innerHTML += `
            <div class="crypto-card" onclick="selectAsset('${symbol}')" style="border-left-color: ${crypto.color}">
                <div class="crypto-header">
                    <div class="crypto-name">
                        <i class="${crypto.icon}"></i> ${symbol}
                    </div>
                    <div class="crypto-price">$${crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</div>
                </div>
                <div class="crypto-change ${changeClass}">
                    <i class="${changeIcon}"></i> ${Math.abs(crypto.change24h).toFixed(2)}%
                </div>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #aaa;">
                    24h Vol: $${(crypto.volume24h / 1000000).toFixed(1)}M
                </div>
            </div>
        `;
    }
    
    // Render asset selector
    let assetSelector = document.getElementById('assetSelector');
    assetSelector.innerHTML = '';
    for (let symbol in cryptocurrencies) {
        let isActive = symbol === selectedAsset ? 'active' : '';
        assetSelector.innerHTML += `
            <button class="asset-btn ${isActive}" onclick="selectAsset('${symbol}')">
                ${symbol}
            </button>
        `;
    }
    
    // Update datalist
    let assetsList = document.getElementById('assetsList');
    assetsList.innerHTML = '';
    for (let symbol in cryptocurrencies) {
        assetsList.innerHTML += `<option value="${symbol}">${cryptocurrencies[symbol].name}</option>`;
    }
    
    // Set selected asset in input
    document.getElementById('asset').value = selectedAsset;
}

// Render portfolio
function renderPortfolio() {
    let portfolioGrid = document.getElementById('portfolioGrid');
    portfolioGrid.innerHTML = '';
    
    let totalPortfolioValue = cash;
    let totalCostBasis = 0;
    
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        let crypto = cryptocurrencies[symbol];
        
        if (holding.amount > 0) {
            let currentValue = holding.amount * crypto.price;
            totalPortfolioValue += currentValue;
            totalCostBasis += holding.totalCost;
            
            let profitLoss = currentValue - holding.totalCost;
            let profitLossPercent = holding.totalCost > 0 ? (profitLoss / holding.totalCost * 100) : 0;
            let plClass = profitLoss >= 0 ? 'positive' : 'negative';
            
            portfolioGrid.innerHTML += `
                <div class="portfolio-item">
                    <div class="portfolio-header">
                        <div style="font-weight: bold; font-size: 1.1rem;">
                            <i class="${crypto.icon}"></i> ${symbol}
                        </div>
                        <div style="font-size: 1.2rem; font-weight: bold;">
                            $${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <div>Amount: ${holding.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</div>
                        <div>Avg Price: $${holding.avgPrice.toFixed(2)}</div>
                        <div>Current Price: $${crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</div>
                        <div>P&L: <span class="${plClass}">${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${profitLossPercent.toFixed(2)}%)</span></div>
                    </div>
                </div>
            `;
        }
    }
    
    document.getElementById('totalValue').textContent = `$${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    // Update total P&L
    let totalPnl = totalPortfolioValue - 10000; // Starting cash was 10000
    let totalPnlElement = document.getElementById('totalPnl');
    totalPnlElement.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    totalPnlElement.className = totalPnl >= 0 ? 'stat-value positive-stat' : 'stat-value negative-stat';
}

// Render transaction history
function renderTransactionHistory() {
    let historyDiv = document.getElementById('transactionHistory');
    historyDiv.innerHTML = '';
    
    // Show last 10 transactions
    let recentTransactions = transactions.slice(-10).reverse();
    
    for (let tx of recentTransactions) {
        let typeClass = tx.type === 'buy' ? 'transaction-buy' : 'transaction-sell';
        let typeIcon = tx.type === 'buy' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        let typeColor = tx.type === 'buy' ? '#4CAF50' : '#F44336';
        
        historyDiv.innerHTML += `
            <div class="transaction-item ${typeClass}">
                <div>
                    <i class="${typeIcon}" style="color: ${typeColor};"></i>
                    <strong>${tx.type.toUpperCase()}</strong> ${tx.amount} ${tx.asset}
                </div>
                <div>
                    $${tx.price.toFixed(2)}
                </div>
                <div style="font-size: 0.9rem; color: #aaa;">
                    Day ${tx.day}
                </div>
            </div>
        `;
    }
}

// Render news ticker
function renderNewsTicker() {
    let newsContent = document.getElementById('newsContent');
    newsContent.innerHTML = '';
    
    // Shuffle and pick 5 news items
    let shuffledNews = [...newsHeadlines].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    for (let headline of shuffledNews) {
        newsContent.innerHTML += `
            <div class="news-item">
                <i class="fas fa-bullhorn"></i> ${headline}
            </div>
        `;
    }
    
    // Duplicate content for seamless scrolling
    newsContent.innerHTML += newsContent.innerHTML;
}

// Render price chart - FIXED VERSION
function renderChart() {
    let canvas = document.getElementById('priceChart');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    let ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // Destroy previous chart if exists
    if (chart) {
        chart.destroy();
    }
    
    let selectedHistory = priceHistory[selectedAsset];
    if (!selectedHistory || selectedHistory.length === 0) {
        console.log('No price history for', selectedAsset);
        // Initialize with default data
        selectedHistory = [{ day: 1, price: cryptocurrencies[selectedAsset].price }];
    }
    
    let labels = selectedHistory.map(item => `Day ${item.day}`);
    let prices = selectedHistory.map(item => item.price);
    
    // Create gradient for chart
    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, `${cryptocurrencies[selectedAsset].color}40`);
    gradient.addColorStop(1, `${cryptocurrencies[selectedAsset].color}00`);
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${selectedAsset} Price`,
                data: prices,
                borderColor: cryptocurrencies[selectedAsset].color,
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.2,
                pointRadius: 2,
                pointBackgroundColor: cryptocurrencies[selectedAsset].color,
                pointBorderColor: '#fff',
                pointBorderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff',
                        font: {
                            size: 14,
                            family: 'Arial'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(20, 20, 30, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: cryptocurrencies[selectedAsset].color,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${selectedAsset}: $${context.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa',
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Day',
                        color: '#aaa',
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    title: {
                        display: true,
                        text: 'Price (USD)',
                        color: '#aaa',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.2
                }
            }
        }
    });
}

// Update statistics
function updateStats() {
    // Calculate daily P&L
    let dailyPnl = 0;
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        if (holding.amount > 0 && previousPrices[symbol]) {
            let priceChange = cryptocurrencies[symbol].price - previousPrices[symbol];
            dailyPnl += holding.amount * priceChange;
        }
    }
    
    document.getElementById('dailyPnl').textContent = `${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toFixed(2)}`;
    document.getElementById('dailyPnl').className = dailyPnl >= 0 ? 'stat-value positive-stat' : 'stat-value negative-stat';
    
    // Update trades today
    document.getElementById('tradesToday').textContent = tradesToday;
    
    // Update win rate
    let winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100) : 0;
    document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
    
    // Update risk level based on portfolio concentration
    let riskLevel = calculateRiskLevel();
    document.getElementById('riskLevel').textContent = riskLevel;
    document.getElementById('riskLevel').className = riskLevel === 'High' ? 'stat-value negative-stat' : 
                                                   riskLevel === 'Medium' ? 'stat-value' : 'stat-value positive-stat';
    
    // Update day counter
    document.getElementById('dayCounter').textContent = day;
    
    // Update best performer
    let bestPerformer = findBestPerformer();
    document.getElementById('bestPerformer').textContent = bestPerformer;
}

// Calculate risk level based on portfolio
function calculateRiskLevel() {
    let totalValue = cash;
    for (let symbol in portfolio) {
        totalValue += portfolio[symbol].amount * cryptocurrencies[symbol].price;
    }
    
    if (totalValue === 0) return 'Low';
    
    // Calculate concentration in most volatile assets
    let volatileExposure = 0;
    for (let symbol in cryptocurrencies) {
        if (cryptocurrencies[symbol].volatility > 0.1) {
            let holdingValue = portfolio[symbol].amount * cryptocurrencies[symbol].price;
            volatileExposure += holdingValue;
        }
    }
    
    let exposurePercent = (volatileExposure / totalValue) * 100;
    
    if (exposurePercent > 50) return 'High';
    if (exposurePercent > 20) return 'Medium';
    return 'Low';
}

// Find best performing asset in portfolio
function findBestPerformer() {
    let bestSymbol = 'N/A';
    let bestReturn = -Infinity;
    
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        if (holding.amount > 0 && holding.avgPrice > 0) {
            let currentPrice = cryptocurrencies[symbol].price;
            let returnPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
            
            if (returnPercent > bestReturn) {
                bestReturn = returnPercent;
                bestSymbol = symbol;
            }
        }
    }
    
    return bestSymbol;
}

// Select an asset for trading
function selectAsset(symbol) {
    selectedAsset = symbol;
    document.getElementById('asset').value = symbol;
    render();
}

// Buy cryptocurrency
function buy() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    let orderType = document.getElementById('orderType').value;
    let limitPrice = orderType === 'limit' ? parseFloat(document.getElementById('limitPrice').value) : null;
    
    // Input validation
    if (!asset || !cryptocurrencies[asset]) {
        alert(`Invalid cryptocurrency. Available: ${Object.keys(cryptocurrencies).join(', ')}`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    if (orderType === 'limit' && (!limitPrice || limitPrice <= 0)) {
        alert('Please enter a valid limit price');
        return;
    }
    
    let price = orderType === 'limit' ? limitPrice : cryptocurrencies[asset].price;
    let cost = price * amount;
    
    // Check if we have enough cash
    if (cost > cash) {
        alert(`Insufficient funds! You need $${cost.toFixed(2)} but only have $${cash.toFixed(2)}`);
        return;
    }
    
    // Execute buy order
    cash -= cost;
    portfolio[asset].amount += amount;
    portfolio[asset].totalCost += cost;
    portfolio[asset].avgPrice = portfolio[asset].totalCost / portfolio[asset].amount;
    
    // Record transaction
    transactions.push({
        type: 'buy',
        asset: asset,
        amount: amount,
        price: price,
        total: cost,
        day: day
    });
    
    tradesToday++;
    totalTrades++;
    
    // Clear inputs
    document.getElementById('amount').value = '';
    document.getElementById('limitPrice').value = '';
    
    render();
}

// Sell cryptocurrency
function sell() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    let orderType = document.getElementById('orderType').value;
    let limitPrice = orderType === 'limit' ? parseFloat(document.getElementById('limitPrice').value) : null;
    
    // Input validation
    if (!asset || !cryptocurrencies[asset]) {
        alert(`Invalid cryptocurrency. Available: ${Object.keys(cryptocurrencies).join(', ')}`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    if (portfolio[asset].amount < amount) {
        alert(`Insufficient ${asset}! You have ${portfolio[asset].amount.toFixed(8)} but trying to sell ${amount}`);
        return;
    }
    
    let price = orderType === 'limit' ? limitPrice : cryptocurrencies[asset].price;
    
    // For limit orders, check if current price meets our limit
    if (orderType === 'limit' && price > cryptocurrencies[asset].price) {
        alert(`Limit price ($${price}) is higher than current price ($${cryptocurrencies[asset].price}). Order not executed.`);
        return;
    }
    
    let revenue = price * amount;
    
    // Calculate profit/loss for this sale
    let costOfGoodsSold = (portfolio[asset].totalCost / portfolio[asset].amount) * amount;
    let profitLoss = revenue - costOfGoodsSold;
    
    if (profitLoss > 0) {
        profitableTrades++;
    }
    
    // Execute sell order
    cash += revenue;
    portfolio[asset].amount -= amount;
    portfolio[asset].totalCost -= costOfGoodsSold;
    
    if (portfolio[asset].amount === 0) {
        portfolio[asset].avgPrice = 0;
    } else {
        portfolio[asset].avgPrice = portfolio[asset].totalCost / portfolio[asset].amount;
    }
    
    // Record transaction
    transactions.push({
        type: 'sell',
        asset: asset,
        amount: amount,
        price: price,
        total: revenue,
        profitLoss: profitLoss,
        day: day
    });
    
    tradesToday++;
    totalTrades++;
    
    // Clear inputs
    document.getElementById('amount').value = '';
    document.getElementById('limitPrice').value = '';
    
    render();
}

// Advance to next day
function nextDay() {
    updateMarket();
}

// Toggle limit price input visibility
function toggleLimitPrice() {
    let orderType = document.getElementById('orderType').value;
    let limitPriceGroup = document.getElementById('limitPriceGroup');
    
    if (orderType === 'limit') {
        limitPriceGroup.style.display = 'block';
    } else {
        limitPriceGroup.style.display = 'none';
    }
}

// Initialize the application
function init() {
    // Generate wallet address
    document.getElementById('walletAddress').textContent = generateWalletAddress();
    
    // Initialize price history
    initializePriceHistory();
    
    // Set up event listeners
    document.getElementById('orderType').addEventListener('change', toggleLimitPrice);
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            buy();
        }
        if (event.key === 'Escape') {
            document.getElementById('amount').value = '';
        }
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            nextDay();
        }
    });
    
    // Auto-select asset when typing in asset input
    document.getElementById('asset').addEventListener('input', function(e) {
        let value = e.target.value.toUpperCase();
        if (cryptocurrencies[value]) {
            selectAsset(value);
        }
    });
    
    // Initial render - wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        render();
    }, 100);
}

// Start the simulation when page loads
window.onload = init;
