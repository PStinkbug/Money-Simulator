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

// Expanded Cryptocurrency and Stock Data
let assets = {
    // Cryptocurrencies
    BTC: {
        name: "Bitcoin",
        price: 32000,
        change24h: 0,
        marketCap: 620000000000,
        volume24h: 15000000000,
        volatility: 0.08,
        icon: "fab fa-bitcoin",
        color: "#F7931A",
        type: "crypto"
    },
    ETH: {
        name: "Ethereum",
        price: 2100,
        change24h: 0,
        marketCap: 250000000000,
        volume24h: 8000000000,
        volatility: 0.09,
        icon: "fab fa-ethereum",
        color: "#627EEA",
        type: "crypto"
    },
    SOL: {
        name: "Solana",
        price: 42.50,
        change24h: 0,
        marketCap: 17000000000,
        volume24h: 600000000,
        volatility: 0.12,
        icon: "fas fa-fire",
        color: "#00FFA3",
        type: "crypto"
    },
    ADA: {
        name: "Cardano",
        price: 0.38,
        change24h: 0,
        marketCap: 13000000000,
        volume24h: 300000000,
        volatility: 0.10,
        icon: "fas fa-chart-line",
        color: "#0033AD",
        type: "crypto"
    },
    XRP: {
        name: "Ripple",
        price: 0.62,
        change24h: 0,
        marketCap: 33000000000,
        volume24h: 1500000000,
        volatility: 0.07,
        icon: "fas fa-bolt",
        color: "#23292F",
        type: "crypto"
    },
    DOGE: {
        name: "Dogecoin",
        price: 0.075,
        change24h: 0,
        marketCap: 10000000000,
        volume24h: 400000000,
        volatility: 0.15,
        icon: "fas fa-dog",
        color: "#C2A633",
        type: "crypto"
    },
    LTC: {
        name: "Litecoin",
        price: 85.50,
        change24h: 0,
        marketCap: 6200000000,
        volume24h: 300000000,
        volatility: 0.06,
        icon: "fab fa-btc",
        color: "#BFBBBB",
        type: "crypto"
    },
    BNB: {
        name: "Binance Coin",
        price: 240.00,
        change24h: 0,
        marketCap: 37000000000,
        volume24h: 900000000,
        volatility: 0.08,
        icon: "fas fa-exchange-alt",
        color: "#F0B90B",
        type: "crypto"
    },
    AVAX: {
        name: "Avalanche",
        price: 18.75,
        change24h: 0,
        marketCap: 6000000000,
        volume24h: 250000000,
        volatility: 0.11,
        icon: "fas fa-snowflake",
        color: "#E84142",
        type: "crypto"
    },
    MATIC: {
        name: "Polygon",
        price: 0.85,
        change24h: 0,
        marketCap: 8000000000,
        volume24h: 350000000,
        volatility: 0.10,
        icon: "fas fa-bezier-curve",
        color: "#8247E5",
        type: "crypto"
    },
    SHIB: {
        name: "Shiba Inu",
        price: 0.0000085,
        change24h: 0,
        marketCap: 5000000000,
        volume24h: 150000000,
        volatility: 0.20,
        icon: "fas fa-paw",
        color: "#FFA500",
        type: "crypto"
    },
    // Stocks
    AAPL: {
        name: "Apple Inc.",
        price: 175.25,
        change24h: 0,
        marketCap: 2750000000000,
        volume24h: 75000000,
        volatility: 0.02,
        icon: "fas fa-apple-alt",
        color: "#A2AAAD",
        type: "stock"
    },
    MSFT: {
        name: "Microsoft",
        price: 330.50,
        change24h: 0,
        marketCap: 2460000000000,
        volume24h: 25000000,
        volatility: 0.02,
        icon: "fab fa-windows",
        color: "#F25022",
        type: "stock"
    },
    GOOGL: {
        name: "Alphabet (Google)",
        price: 135.75,
        change24h: 0,
        marketCap: 1700000000000,
        volume24h: 1500000,
        volatility: 0.03,
        icon: "fab fa-google",
        color: "#4285F4",
        type: "stock"
    },
    AMZN: {
        name: "Amazon",
        price: 142.80,
        change24h: 0,
        marketCap: 1460000000000,
        volume24h: 45000000,
        volatility: 0.03,
        icon: "fab fa-amazon",
        color: "#FF9900",
        type: "stock"
    },
    TSLA: {
        name: "Tesla",
        price: 240.00,
        change24h: 0,
        marketCap: 760000000000,
        volume24h: 120000000,
        volatility: 0.05,
        icon: "fas fa-car",
        color: "#CC0000",
        type: "stock"
    },
    META: {
        name: "Meta Platforms",
        price: 305.40,
        change24h: 0,
        marketCap: 780000000000,
        volume24h: 18000000,
        volatility: 0.04,
        icon: "fab fa-facebook",
        color: "#1877F2",
        type: "stock"
    },
    NVDA: {
        name: "NVIDIA",
        price: 450.00,
        change24h: 0,
        marketCap: 1110000000000,
        volume24h: 45000000,
        volatility: 0.04,
        icon: "fas fa-microchip",
        color: "#76B900",
        type: "stock"
    },
    JPM: {
        name: "JPMorgan Chase",
        price: 155.75,
        change24h: 0,
        marketCap: 450000000000,
        volume24h: 10000000,
        volatility: 0.02,
        icon: "fas fa-university",
        color: "#0066CC",
        type: "stock"
    },
    V: {
        name: "Visa Inc.",
        price: 250.60,
        change24h: 0,
        marketCap: 500000000000,
        volume24h: 6500000,
        volatility: 0.02,
        icon: "fas fa-credit-card",
        color: "#1A1F71",
        type: "stock"
    },
    WMT: {
        name: "Walmart",
        price: 162.30,
        change24h: 0,
        marketCap: 437000000000,
        volume24h: 5500000,
        volatility: 0.01,
        icon: "fas fa-shopping-cart",
        color: "#0071CE",
        type: "stock"
    }
};

// Initialize portfolio for all assets
let portfolio = {};
for (let symbol in assets) {
    portfolio[symbol] = { amount: 0, avgPrice: 0, totalCost: 0 };
}

// Transaction history
let transactions = [];

// Expanded News Headlines
const newsHeadlines = [
    // Cryptocurrency News
    "Bitcoin ETF Approval Imminent: SEC Expected to Rule This Month",
    "Ethereum Shanghai Upgrade Successfully Reduces Gas Fees by 40%",
    "Global Crypto Regulations: New Framework Proposed by G20 Nations",
    "Major Investment Bank Launches Bitcoin Custody Services for Institutions",
    "NFT Market Sees 300% Growth as Digital Art Collections Gain Popularity",
    "New Blockchain Protocol Achieves 500,000 Transactions Per Second",
    "Crypto Donations Reach Record $2B for Global Humanitarian Efforts",
    "Stablecoin Legislation Advances in US Congress with Bipartisan Support",
    "Web3 Gaming Platform Secures $150M Funding from Top Venture Firms",
    "Sustainable Mining Initiative Cuts Crypto Energy Consumption by 70%",
    "DeFi Protocol Implements Enhanced Security Measures After $45M Exploit",
    "Celebrity-Backed Meme Coin Surges 500% Amid Social Media Frenzy",
    "China Launches CBDC Pilot Program in Major Metropolitan Areas",
    "Analysts Predict End of Crypto Winter as Institutional Interest Returns",
    "Layer 2 Solutions Adoption Grows, Processing 60% of Ethereum Transactions",
    
    // Stock Market News
    "Federal Reserve Signals Potential Interest Rate Pause in Upcoming Meeting",
    "Tech Stocks Rally as AI Investments Drive Record Quarterly Earnings",
    "Automotive Industry Faces Supply Chain Challenges Amid Global Tensions",
    "Pharmaceutical Giant Announces Breakthrough in Alzheimer's Treatment",
    "Retail Sector Shows Strong Recovery with Holiday Season Approaching",
    "Energy Companies Invest $200B in Renewable Infrastructure Projects",
    "Banking Sector Reports Highest Profits Since 2008 Financial Crisis",
    "Global Semiconductor Shortage Expected to Ease by Q4 2023",
    "E-commerce Platforms Report 35% Growth in Cross-Border Transactions",
    "Healthcare Stocks Volatile Amid FDA Regulatory Changes",
    "Real Estate Market Shows Signs of Cooling as Mortgage Rates Rise",
    "Entertainment Industry Adapts to Changing Consumer Streaming Habits",
    "Aerospace and Defense Sector Receives Record Government Contracts",
    "Consumer Goods Companies Navigate Inflation and Supply Chain Pressures",
    "Financial Technology Startups Attract Record $85B in Venture Funding"
];

// Initialize price history for charting
function initializePriceHistory() {
    for (let symbol in assets) {
        priceHistory[symbol] = [];
        // Generate 30 days of historical data
        let basePrice = assets[symbol].price;
        for (let i = 0; i < 30; i++) {
            let change = (Math.random() * assets[symbol].volatility * 2 - assets[symbol].volatility);
            basePrice *= (1 + change);
            priceHistory[symbol].push({
                day: i + 1,
                price: basePrice
            });
        }
        // Set current price as last historical price
        assets[symbol].price = Math.round(basePrice * 100) / 100;
        previousPrices[symbol] = assets[symbol].price;
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

// Update market prices with realistic volatility
function updateMarket() {
    tradesToday = 0;
    
    for (let symbol in assets) {
        let asset = assets[symbol];
        let previousPrice = asset.price;
        
        // Store previous price for change calculation
        previousPrices[symbol] = previousPrice;
        
        // Different volatility patterns for crypto vs stocks
        let randomFactor = Math.random();
        let change;
        
        if (asset.type === 'crypto') {
            // Crypto: Higher volatility
            if (randomFactor < 0.1) {
                // 10% chance of a big move (±10-20%)
                change = (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
            } else if (randomFactor < 0.3) {
                // 20% chance of a medium move (±5-10%)
                change = (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
            } else {
                // 70% chance of normal volatility
                change = (Math.random() * asset.volatility * 2 - asset.volatility);
            }
        } else {
            // Stocks: Lower volatility
            if (randomFactor < 0.05) {
                // 5% chance of a significant move (±5-8%)
                change = (Math.random() * 0.06 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
            } else if (randomFactor < 0.2) {
                // 15% chance of a moderate move (±2-4%)
                change = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
            } else {
                // 80% chance of normal volatility
                change = (Math.random() * asset.volatility * 2 - asset.volatility);
            }
        }
        
        // Add some momentum (if price was rising, more likely to continue)
        if (asset.change24h > 0) {
            change += Math.random() * 0.02;
        } else if (asset.change24h < 0) {
            change -= Math.random() * 0.02;
        }
        
        // Update price
        asset.price *= (1 + change);
        asset.price = Math.round(asset.price * 100) / 100;
        
        // Update 24h change
        asset.change24h = ((asset.price - previousPrice) / previousPrice) * 100;
        
        // Update price history for chart
        priceHistory[symbol].push({
            day: day,
            price: asset.price
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
    
    // Filter for currently selected type (all, crypto, or stock)
    let assetTypeFilter = document.getElementById('assetTypeFilter') ? 
                         document.getElementById('assetTypeFilter').value : 'all';
    
    let filteredAssets = {};
    for (let symbol in assets) {
        if (assetTypeFilter === 'all' || assets[symbol].type === assetTypeFilter) {
            filteredAssets[symbol] = assets[symbol];
        }
    }
    
    for (let symbol in filteredAssets) {
        let asset = assets[symbol];
        let changeClass = asset.change24h >= 0 ? 'positive' : 'negative';
        let changeIcon = asset.change24h >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        marketGrid.innerHTML += `
            <div class="crypto-card" onclick="selectAsset('${symbol}')" style="border-left-color: ${asset.color}">
                <div class="crypto-header">
                    <div class="crypto-name">
                        <i class="${asset.icon}"></i> ${symbol}
                        <small style="color: #888; font-size: 0.8em;">${asset.type === 'crypto' ? 'CRYPTO' : 'STOCK'}</small>
                    </div>
                    <div class="crypto-price">$${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</div>
                </div>
                <div class="crypto-change ${changeClass}">
                    <i class="${changeIcon}"></i> ${Math.abs(asset.change24h).toFixed(2)}%
                </div>
                <div style="margin-top: 5px; font-size: 0.8rem; color: #aaa;">
                    Market Cap: $${(asset.marketCap / 1000000000).toFixed(1)}B
                </div>
            </div>
        `;
    }
    
    // Render asset selector
    let assetSelector = document.getElementById('assetSelector');
    if (assetSelector) {
        assetSelector.innerHTML = '';
        let count = 0;
        for (let symbol in assets) {
            if (count >= 10) break; // Show only first 10 for space
            let isActive = symbol === selectedAsset ? 'active' : '';
            assetSelector.innerHTML += `
                <button class="asset-btn ${isActive}" onclick="selectAsset('${symbol}')">
                    ${symbol}
                </button>
            `;
            count++;
        }
    }
    
    // Update datalist
    let assetsList = document.getElementById('assetsList');
    assetsList.innerHTML = '';
    for (let symbol in assets) {
        assetsList.innerHTML += `<option value="${symbol}">${assets[symbol].name} (${symbol})</option>`;
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
        let asset = assets[symbol];
        
        if (holding.amount > 0) {
            let currentValue = holding.amount * asset.price;
            totalPortfolioValue += currentValue;
            totalCostBasis += holding.totalCost;
            
            let profitLoss = currentValue - holding.totalCost;
            let profitLossPercent = holding.totalCost > 0 ? (profitLoss / holding.totalCost * 100) : 0;
            let plClass = profitLoss >= 0 ? 'positive' : 'negative';
            
            portfolioGrid.innerHTML += `
                <div class="portfolio-item">
                    <div class="portfolio-header">
                        <div style="font-weight: bold; font-size: 1.1rem;">
                            <i class="${asset.icon}"></i> ${symbol}
                            <small style="color: #888; font-size: 0.7em;">${asset.type === 'crypto' ? 'CRYPTO' : 'STOCK'}</small>
                        </div>
                        <div style="font-size: 1.2rem; font-weight: bold;">
                            $${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.9rem;">
                        <div>Amount: ${holding.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</div>
                        <div>Avg Price: $${holding.avgPrice.toFixed(2)}</div>
                        <div>Current Price: $${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</div>
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

// Improved News Ticker - FIXED to not show duplicates
function renderNewsTicker() {
    let newsContent = document.getElementById('newsContent');
    newsContent.innerHTML = '';
    
    // Shuffle and pick 8 unique news items (instead of 5)
    let shuffledNews = [...newsHeadlines].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    // Create one continuous stream of news instead of duplicating
    for (let headline of shuffledNews) {
        newsContent.innerHTML += `
            <div class="news-item">
                <i class="fas fa-newspaper"></i> ${headline}
            </div>
        `;
    }
    
    // Update the animation to match the new content length
    newsContent.style.animation = 'ticker 60s linear infinite';
}

// Update CSS for better news ticker
function addNewsTickerCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .news-ticker {
            background: rgba(20, 20, 30, 0.9);
            border-radius: 10px;
            padding: 8px 15px;
            margin-top: 20px;
            border-left: 4px solid #9C27B0;
            overflow: hidden;
            height: 40px;
            position: relative;
        }
        
        .news-content {
            position: absolute;
            white-space: nowrap;
            will-change: transform;
            animation: ticker 60s linear infinite;
        }
        
        @keyframes ticker {
            0% {
                transform: translateX(100%);
            }
            100% {
                transform: translateX(-100%);
            }
        }
        
        .news-item {
            display: inline-block;
            margin-right: 40px;
            color: #aaa;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
}

// Render price chart
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
        selectedHistory = [{ day: 1, price: assets[selectedAsset].price }];
    }
    
    let labels = selectedHistory.map(item => `Day ${item.day}`);
    let prices = selectedHistory.map(item => item.price);
    
    // Create gradient for chart
    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, `${assets[selectedAsset].color}40`);
    gradient.addColorStop(1, `${assets[selectedAsset].color}00`);
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${selectedAsset} Price (${assets[selectedAsset].type === 'crypto' ? 'Cryptocurrency' : 'Stock'})`,
                data: prices,
                borderColor: assets[selectedAsset].color,
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.2,
                pointRadius: 2,
                pointBackgroundColor: assets[selectedAsset].color,
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
                    borderColor: assets[selectedAsset].color,
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
            let priceChange = assets[symbol].price - previousPrices[symbol];
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
    
    // Update risk level
    let riskLevel = calculateRiskLevel();
    document.getElementById('riskLevel').textContent = riskLevel;
    document.getElementById('riskLevel').className = riskLevel === 'High' ? 'stat-value negative-stat' : 
                                                   riskLevel === 'Medium' ? 'stat-value' : 'stat-value positive-stat';
    
    // Update day counter
    document.getElementById('dayCounter').textContent = day;
    
    // Update best performer
    let bestPerformer = findBestPerformer();
    document.getElementById('bestPerformer').textContent = bestPerformer;
    
    // Update asset breakdown
    updateAssetBreakdown();
}

// Calculate risk level
function calculateRiskLevel() {
    let totalValue = cash;
    for (let symbol in portfolio) {
        totalValue += portfolio[symbol].amount * assets[symbol].price;
    }
    
    if (totalValue === 0) return 'Low';
    
    // Calculate crypto exposure percentage (crypto is riskier)
    let cryptoExposure = 0;
    for (let symbol in portfolio) {
        if (assets[symbol].type === 'crypto') {
            let holdingValue = portfolio[symbol].amount * assets[symbol].price;
            cryptoExposure += holdingValue;
        }
    }
    
    let exposurePercent = (cryptoExposure / totalValue) * 100;
    
    if (exposurePercent > 70) return 'Very High';
    if (exposurePercent > 50) return 'High';
    if (exposurePercent > 30) return 'Medium';
    return 'Low';
}

// Find best performing asset
function findBestPerformer() {
    let bestSymbol = 'None';
    let bestReturn = -Infinity;
    
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        if (holding.amount > 0 && holding.avgPrice > 0) {
            let currentPrice = assets[symbol].price;
            let returnPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
            
            if (returnPercent > bestReturn) {
                bestReturn = returnPercent;
                bestSymbol = symbol;
            }
        }
    }
    
    return bestSymbol;
}

// Update asset breakdown (crypto vs stocks)
function updateAssetBreakdown() {
    let cryptoValue = 0;
    let stockValue = 0;
    
    for (let symbol in portfolio) {
        let holdingValue = portfolio[symbol].amount * assets[symbol].price;
        if (assets[symbol].type === 'crypto') {
            cryptoValue += holdingValue;
        } else {
            stockValue += holdingValue;
        }
    }
    
    // Create or update breakdown display
    let breakdownElement = document.getElementById('assetBreakdown');
    if (!breakdownElement) {
        // Create it if it doesn't exist
        breakdownElement = document.createElement('div');
        breakdownElement.id = 'assetBreakdown';
        breakdownElement.className = 'stat-card';
        breakdownElement.innerHTML = `
            <div class="stat-label">Asset Allocation</div>
            <div class="stat-value">
                <span style="color: #F7931A">Crypto: $${cryptoValue.toFixed(0)}</span><br>
                <span style="color: #4285F4">Stocks: $${stockValue.toFixed(0)}</span><br>
                <span style="color: #4CAF50">Cash: $${cash.toFixed(0)}</span>
            </div>
        `;
        
        // Find where to insert it
        let statsContainer = document.querySelector('.stats');
        if (statsContainer) {
            statsContainer.appendChild(breakdownElement);
        }
    } else {
        // Update existing
        breakdownElement.innerHTML = `
            <div class="stat-label">Asset Allocation</div>
            <div class="stat-value">
                <span style="color: #F7931A">Crypto: $${cryptoValue.toFixed(0)}</span><br>
                <span style="color: #4285F4">Stocks: $${stockValue.toFixed(0)}</span><br>
                <span style="color: #4CAF50">Cash: $${cash.toFixed(0)}</span>
            </div>
        `;
    }
}

// Select an asset for trading
function selectAsset(symbol) {
    selectedAsset = symbol;
    document.getElementById('asset').value = symbol;
    render();
}

// Buy asset
function buy() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    let orderType = document.getElementById('orderType').value;
    let limitPrice = orderType === 'limit' ? parseFloat(document.getElementById('limitPrice').value) : null;
    
    // Input validation
    if (!asset || !assets[asset]) {
        alert(`Invalid asset. Available assets: ${Object.keys(assets).slice(0, 5).join(', ')}...`);
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
    
    let price = orderType === 'limit' ? limitPrice : assets[asset].price;
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

// Sell asset
function sell() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    let orderType = document.getElementById('orderType').value;
    let limitPrice = orderType === 'limit' ? parseFloat(document.getElementById('limitPrice').value) : null;
    
    // Input validation
    if (!asset || !assets[asset]) {
        alert(`Invalid asset. Available assets: ${Object.keys(assets).slice(0, 5).join(', ')}...`);
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
    
    let price = orderType === 'limit' ? limitPrice : assets[asset].price;
    
    // For limit orders, check if current price meets our limit
    if (orderType === 'limit' && price > assets[asset].price) {
        alert(`Limit price ($${price}) is higher than current price ($${assets[asset].price}). Order not executed.`);
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
    // Add custom CSS for news ticker
    addNewsTickerCSS();
    
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
        if (assets[value]) {
            selectAsset(value);
        }
    });
    
    // Add asset type filter if it doesn't exist
    addAssetTypeFilter();
    
    // Initial render - wait for DOM
    setTimeout(() => {
        render();
    }, 100);
}

// Add asset type filter to UI
function addAssetTypeFilter() {
    let tradePanel = document.querySelector('.trade-panel');
    if (tradePanel && !document.getElementById('assetTypeFilter')) {
        let filterHTML = `
            <div class="form-group">
                <label for="assetTypeFilter"><i class="fas fa-filter"></i> Filter Assets</label>
                <select id="assetTypeFilter" class="form-control" onchange="renderMarket()">
                    <option value="all">All Assets</option>
                    <option value="crypto">Cryptocurrencies Only</option>
                    <option value="stock">Stocks Only</option>
                </select>
            </div>
        `;
        
        let tradeForm = tradePanel.querySelector('.trade-form');
        if (tradeForm) {
            tradeForm.insertAdjacentHTML('beforebegin', filterHTML);
        }
    }
}

// Start the simulation when page loads
window.onload = init;
