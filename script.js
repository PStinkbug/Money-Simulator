// ====================
// GAME STATE
// ====================
let cash = 10000;
let day = 1;
let tradesToday = 0;
let totalTrades = 0;
let profitableTrades = 0;
let selectedAsset = "BTC";
let priceHistory = {};
let chart = null;
let previousPrices = {};

// Player progression
let player = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    tokens: 100,
    dailyStreak: 1,
    lastPlayed: new Date().toDateString(),
    achievements: [],
    completedChallenges: [],
    upgrades: [],
    totalProfit: 0,
    highestPortfolioValue: 10000
};

// Transaction history
let transactions = [];

// ====================
// ASSETS DATA
// ====================
let assets = {
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
    }
};

// Initialize portfolio
let portfolio = {};
for (let symbol in assets) {
    portfolio[symbol] = { amount: 0, avgPrice: 0, totalCost: 0, purchaseDay: 0 };
}

// News headlines
const newsHeadlines = [
    "Bitcoin ETF approval expected this quarter",
    "Ethereum completes Shanghai upgrade successfully",
    "Major bank announces crypto custody services",
    "Tech stocks rally on strong earnings reports",
    "Crypto market shows signs of recovery",
    "Regulatory clarity boosts market confidence"
];

// Achievements
const achievements = [
    {
        id: 'first_trade',
        name: 'First Trade',
        description: 'Execute your first trade',
        icon: 'fas fa-handshake',
        xp: 50,
        tokens: 25
    },
    {
        id: 'first_profit',
        name: 'First Profit',
        description: 'Make your first profitable trade',
        icon: 'fas fa-chart-line',
        xp: 100,
        tokens: 50
    },
    {
        id: 'portfolio_20k',
        name: 'Twenty Grand',
        description: 'Reach $20,000 portfolio value',
        icon: 'fas fa-money-bill-wave',
        xp: 300,
        tokens: 150
    },
    {
        id: 'day_trader',
        name: 'Day Trader',
        description: 'Make 10 trades in a day',
        icon: 'fas fa-calendar-day',
        xp: 200,
        tokens: 100
    }
];

// Challenges
const challenges = [
    {
        id: 'daily_trade_3',
        name: 'Active Trader',
        description: 'Make 3 trades today',
        target: 3,
        reward: { xp: 100, tokens: 50 }
    },
    {
        id: 'profit_1000',
        name: 'Profit Hunter',
        description: 'Make $1,000 profit',
        target: 1000,
        reward: { xp: 300, tokens: 150 }
    }
];

// Upgrades
const upgrades = [
    {
        id: 'upgrade_fee_1',
        name: 'Reduced Fees I',
        description: 'Reduce trading fees by 10%',
        icon: 'fas fa-percentage',
        cost: 500,
        effect: 'feeReduction'
    },
    {
        id: 'upgrade_insight',
        name: 'Market Insight',
        description: 'See price trends before they happen',
        icon: 'fas fa-chart-line',
        cost: 1000,
        effect: 'marketInsight'
    }
];

// ====================
// INITIALIZATION
// ====================
function initializePriceHistory() {
    for (let symbol in assets) {
        priceHistory[symbol] = [];
        let basePrice = assets[symbol].price;
        // Generate 30 days of historical data
        for (let i = 0; i < 30; i++) {
            let change = (Math.random() * assets[symbol].volatility * 2 - assets[symbol].volatility);
            basePrice *= (1 + change);
            priceHistory[symbol].push({
                day: i + 1,
                price: Math.round(basePrice * 100) / 100
            });
        }
        // Set current price as the last one
        assets[symbol].price = Math.round(basePrice * 100) / 100;
        previousPrices[symbol] = assets[symbol].price;
    }
}

// ====================
// TAB SWITCHING - FIXED!
// ====================
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.add('active');
    } else {
        console.error(`Tab element not found: ${tabName}-tab`);
        // Fallback to market tab
        document.getElementById('market-tab').classList.add('active');
    }
    
    // Add active class to clicked button
    event.currentTarget.classList.add('active');
    
    // Render specific content for the tab
    switch(tabName) {
        case 'market':
            renderMarket();
            renderChart();
            break;
        case 'portfolio':
            renderPortfolio();
            renderProfileStats();
            renderTransactionHistory();
            break;
        case 'achievements':
            renderAchievements();
            break;
        case 'challenges':
            renderChallenges();
            break;
        case 'upgrades':
            renderUpgrades();
            break;
    }
}

// ====================
// MARKET FUNCTIONS
// ====================
function updateMarket() {
    console.log('Updating market...');
    tradesToday = 0;
    
    for (let symbol in assets) {
        let asset = assets[symbol];
        let previousPrice = asset.price;
        previousPrices[symbol] = previousPrice;
        
        // Calculate price change
        let change;
        if (asset.type === 'crypto') {
            // Crypto: higher volatility
            change = (Math.random() * asset.volatility * 2 - asset.volatility);
            // 10% chance of big move
            if (Math.random() < 0.1) {
                change *= 2;
            }
        } else {
            // Stocks: lower volatility
            change = (Math.random() * asset.volatility * 2 - asset.volatility);
        }
        
        // Update price
        asset.price *= (1 + change);
        asset.price = Math.round(asset.price * 100) / 100;
        asset.change24h = ((asset.price - previousPrice) / previousPrice) * 100;
        
        // Update price history
        priceHistory[symbol].push({
            day: day,
            price: asset.price
        });
        if (priceHistory[symbol].length > 30) {
            priceHistory[symbol].shift();
        }
    }
    
    day++;
    console.log(`Day ${day} completed`);
    
    // Update UI
    renderMarket();
    renderPortfolio();
    renderChart();
    updatePlayerStats();
    
    // Show notification
    showEventPopup(
        '📈 Market Updated',
        'Prices have been updated for the new day!',
        'Check your portfolio performance'
    );
}

// ====================
// TRADING FUNCTIONS
// ====================
function buy() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    
    if (!asset || !assets[asset]) {
        alert(`Invalid asset. Available: ${Object.keys(assets).join(', ')}`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    let price = assets[asset].price;
    let cost = price * amount;
    
    if (cost > cash) {
        alert(`Insufficient funds! You need $${cost.toFixed(2)} but only have $${cash.toFixed(2)}`);
        return;
    }
    
    // Execute buy
    cash -= cost;
    portfolio[asset].amount += amount;
    portfolio[asset].totalCost += cost;
    portfolio[asset].avgPrice = portfolio[asset].totalCost / portfolio[asset].amount;
    portfolio[asset].purchaseDay = day;
    
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
    
    // Add XP
    addXP(Math.floor(cost / 100));
    
    // Clear input
    document.getElementById('amount').value = '';
    
    // Check achievements
    checkAchievements();
    
    // Update UI
    renderMarket();
    renderPortfolio();
    showEventPopup(
        '✅ Buy Order Executed',
        `Bought ${amount} ${asset} at $${price.toFixed(2)}`,
        `Total: $${cost.toFixed(2)}`
    );
}

function sell() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    
    if (!asset || !assets[asset]) {
        alert(`Invalid asset. Available: ${Object.keys(assets).join(', ')}`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    if (portfolio[asset].amount < amount) {
        alert(`Insufficient ${asset}! You have ${portfolio[asset].amount.toFixed(4)} but trying to sell ${amount}`);
        return;
    }
    
    let price = assets[asset].price;
    let revenue = price * amount;
    
    // Calculate profit/loss
    let costOfGoodsSold = (portfolio[asset].totalCost / portfolio[asset].amount) * amount;
    let profitLoss = revenue - costOfGoodsSold;
    
    if (profitLoss > 0) {
        profitableTrades++;
        player.totalProfit += profitLoss;
    }
    
    // Execute sell
    cash += revenue;
    portfolio[asset].amount -= amount;
    portfolio[asset].totalCost -= costOfGoodsSold;
    
    if (portfolio[asset].amount === 0) {
        portfolio[asset].avgPrice = 0;
        portfolio[asset].purchaseDay = 0;
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
    
    // Add XP based on profit
    if (profitLoss > 0) {
        addXP(Math.floor(profitLoss / 50));
    }
    
    // Clear input
    document.getElementById('amount').value = '';
    
    // Check achievements
    checkAchievements();
    
    // Update UI
    renderMarket();
    renderPortfolio();
    
    showEventPopup(
        '✅ Sell Order Executed',
        `Sold ${amount} ${asset} at $${price.toFixed(2)}`,
        profitLoss >= 0 ? `Profit: +$${profitLoss.toFixed(2)}` : `Loss: -$${Math.abs(profitLoss).toFixed(2)}`
    );
}

function nextDay() {
    console.log('Next day button clicked');
    updateMarket();
}

// ====================
// RENDER FUNCTIONS
// ====================
function renderMarket() {
    let marketGrid = document.getElementById('marketGrid');
    if (!marketGrid) return;
    
    marketGrid.innerHTML = '';
    
    for (let symbol in assets) {
        let asset = assets[symbol];
        let changeClass = asset.change24h >= 0 ? 'positive' : 'negative';
        let changeIcon = asset.change24h >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        marketGrid.innerHTML += `
            <div class="crypto-card" onclick="selectAsset('${symbol}')">
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
            </div>
        `;
    }
    
    // Render asset selector
    let assetSelector = document.getElementById('assetSelector');
    if (assetSelector) {
        assetSelector.innerHTML = '';
        let count = 0;
        for (let symbol in assets) {
            if (count >= 8) break;
            let isActive = symbol === selectedAsset ? 'active' : '';
            assetSelector.innerHTML += `
                <button class="asset-btn ${isActive}" onclick="selectAsset('${symbol}')" style="padding: 8px; margin: 5px; background: ${symbol === selectedAsset ? '#f7931a' : '#333'}; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ${symbol}
                </button>
            `;
            count++;
        }
    }
    
    // Update datalist
    let assetsList = document.getElementById('assetsList');
    if (assetsList) {
        assetsList.innerHTML = '';
        for (let symbol in assets) {
            assetsList.innerHTML += `<option value="${symbol}">${assets[symbol].name} (${symbol})</option>`;
        }
    }
    
    // Set selected asset in input
    document.getElementById('asset').value = selectedAsset;
}

function renderPortfolio() {
    let portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    
    portfolioGrid.innerHTML = '';
    
    let totalPortfolioValue = cash;
    let hasHoldings = false;
    
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        if (holding.amount > 0) {
            hasHoldings = true;
            let currentValue = holding.amount * assets[symbol].price;
            totalPortfolioValue += currentValue;
            
            let profitLoss = currentValue - holding.totalCost;
            let profitLossPercent = holding.totalCost > 0 ? (profitLoss / holding.totalCost * 100) : 0;
            let plClass = profitLoss >= 0 ? 'positive' : 'negative';
            
            portfolioGrid.innerHTML += `
                <div class="portfolio-item">
                    <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">
                        <i class="${assets[symbol].icon}"></i> ${symbol}
                    </div>
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">
                        $${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                    <div style="color: #aaa; font-size: 0.9rem;">
                        <div>Amount: ${holding.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</div>
                        <div>Avg Price: $${holding.avgPrice.toFixed(2)}</div>
                        <div>Current: $${assets[symbol].price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</div>
                        <div>P&L: <span class="${plClass}">${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${profitLossPercent.toFixed(2)}%)</span></div>
                    </div>
                </div>
            `;
        }
    }
    
    if (!hasHoldings) {
        portfolioGrid.innerHTML = '<div style="text-align: center; color: #aaa; padding: 40px;">No holdings yet. Start trading!</div>';
    }
    
    document.getElementById('totalValue').textContent = `$${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    player.highestPortfolioValue = Math.max(player.highestPortfolioValue, totalPortfolioValue);
}

// ====================
// CHART FUNCTION - FIXED!
// ====================
function renderChart() {
    console.log('Rendering chart for:', selectedAsset);
    
    const canvas = document.getElementById('priceChart');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // Destroy previous chart if exists
    if (chart) {
        chart.destroy();
    }
    
    // Get price history for selected asset
    let selectedHistory = priceHistory[selectedAsset];
    if (!selectedHistory || selectedHistory.length === 0) {
        console.log('No price history for', selectedAsset, '- generating default data');
        selectedHistory = [];
        let basePrice = assets[selectedAsset] ? assets[selectedAsset].price : 100;
        for (let i = 0; i < 30; i++) {
            let change = (Math.random() * 0.1) - 0.05;
            basePrice *= (1 + change);
            selectedHistory.push({
                day: i + 1,
                price: Math.round(basePrice * 100) / 100
            });
        }
        priceHistory[selectedAsset] = selectedHistory;
    }
    
    // Prepare data
    const labels = selectedHistory.map(item => `Day ${item.day}`);
    const prices = selectedHistory.map(item => item.price);
    const asset = assets[selectedAsset];
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `${asset.color}40`);
    gradient.addColorStop(1, `${asset.color}05`);
    
    // Create chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${selectedAsset} Price`,
                data: prices,
                borderColor: asset.color,
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: asset.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 30, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: asset.color,
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
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 750
            }
        }
    });
    
    console.log('Chart rendered successfully');
}

// ====================
// ACHIEVEMENTS
// ====================
function renderAchievements() {
    let achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    achievementsGrid.innerHTML = '';
    
    for (let achievement of achievements) {
        let unlocked = player.achievements.includes(achievement.id);
        
        achievementsGrid.innerHTML += `
            <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
                <div style="font-size: 2rem; margin-bottom: 10px; color: ${unlocked ? '#f7931a' : '#666'}">
                    <i class="${achievement.icon}"></i>
                </div>
                <div style="font-weight: bold; margin-bottom: 5px;">${achievement.name}</div>
                <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 10px;">${achievement.description}</div>
                <div style="color: ${unlocked ? '#4CAF50' : '#FFD700'}; font-size: 0.8rem;">
                    ${unlocked ? '✓ Unlocked' : `Reward: ${achievement.xp} XP + ${achievement.tokens} Tokens`}
                </div>
            </div>
        `;
    }
}

function checkAchievements() {
    // First trade
    if (totalTrades >= 1 && !player.achievements.includes('first_trade')) {
        player.achievements.push('first_trade');
        addXP(50);
        player.tokens += 25;
        showEventPopup(
            '🎉 Achievement Unlocked!',
            'First Trade',
            '+50 XP & 25 Tokens'
        );
    }
    
    // First profit
    if (profitableTrades >= 1 && !player.achievements.includes('first_profit')) {
        player.achievements.push('first_profit');
        addXP(100);
        player.tokens += 50;
        showEventPopup(
            '🎉 Achievement Unlocked!',
            'First Profit',
            '+100 XP & 50 Tokens'
        );
    }
    
    // Portfolio value
    const totalValue = calculateTotalPortfolioValue();
    if (totalValue >= 20000 && !player.achievements.includes('portfolio_20k')) {
        player.achievements.push('portfolio_20k');
        addXP(300);
        player.tokens += 150;
        showEventPopup(
            '🎉 Achievement Unlocked!',
            'Twenty Grand',
            '+300 XP & 150 Tokens'
        );
    }
}

function calculateTotalPortfolioValue() {
    let total = cash;
    for (let symbol in portfolio) {
        total += portfolio[symbol].amount * assets[symbol].price;
    }
    return total;
}

// ====================
// CHALLENGES
// ====================
function renderChallenges() {
    let challengesList = document.getElementById('challengesList');
    if (!challengesList) return;
    
    challengesList.innerHTML = '';
    
    for (let challenge of challenges) {
        let completed = player.completedChallenges.includes(challenge.id);
        
        challengesList.innerHTML += `
            <div class="challenge-card" style="background: rgba(30, 30, 40, 0.9); border-radius: 10px; padding: 15px; margin-bottom: 10px; border: 2px solid ${completed ? '#4CAF50' : '#333'};">
                <div style="font-weight: bold; color: #f7931a; margin-bottom: 5px;">${challenge.name}</div>
                <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 10px;">${challenge.description}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: ${completed ? '#4CAF50' : '#FFD700'};">
                        ${completed ? 'Completed ✓' : 'In Progress'}
                    </div>
                    <div style="color: #FFD700; font-weight: bold;">
                        ${challenge.reward.xp} XP + ${challenge.reward.tokens} Tokens
                    </div>
                </div>
            </div>
        `;
    }
}

// ====================
// UPGRADES
// ====================
function renderUpgrades() {
    let upgradesGrid = document.getElementById('upgradesGrid');
    if (!upgradesGrid) return;
    
    upgradesGrid.innerHTML = '';
    
    for (let upgrade of upgrades) {
        let purchased = player.upgrades.includes(upgrade.id);
        let canAfford = player.tokens >= upgrade.cost;
        
        upgradesGrid.innerHTML += `
            <div class="upgrade-card" style="background: rgba(30, 30, 40, 0.9); border-radius: 10px; padding: 20px; margin-bottom: 15px; border: 2px solid ${purchased ? '#4CAF50' : canAfford ? '#00d4ff' : '#333'}; cursor: ${canAfford && !purchased ? 'pointer' : 'default'};" 
                 onclick="${canAfford && !purchased ? `purchaseUpgrade('${upgrade.id}')` : ''}">
                <div style="font-size: 2rem; margin-bottom: 10px; color: ${purchased ? '#4CAF50' : canAfford ? '#00d4ff' : '#666'}">
                    <i class="${upgrade.icon}"></i>
                </div>
                <div style="font-weight: bold; margin-bottom: 5px;">${upgrade.name}</div>
                <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 10px;">${upgrade.description}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #FFD700; font-weight: bold;">
                        ${upgrade.cost} Tokens
                    </div>
                    <div style="color: ${purchased ? '#4CAF50' : '#aaa'}">
                        ${purchased ? '✓ Purchased' : (canAfford ? 'Click to Purchase' : 'Too Expensive')}
                    </div>
                </div>
            </div>
        `;
    }
}

function purchaseUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (player.tokens >= upgrade.cost && !player.upgrades.includes(upgradeId)) {
        player.tokens -= upgrade.cost;
        player.upgrades.push(upgradeId);
        
        showEventPopup(
            '⚡ Upgrade Purchased!',
            upgrade.name,
            'Now active in your game!'
        );
        
        renderUpgrades();
        updatePlayerStats();
    }
}

// ====================
// UTILITY FUNCTIONS
// ====================
function selectAsset(symbol) {
    selectedAsset = symbol;
    document.getElementById('asset').value = symbol;
    renderChart();
}

function addXP(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        
        // Level up reward
        player.tokens += player.level * 50;
        
        showEventPopup(
            '🌟 Level Up!',
            `You've reached Level ${player.level}!`,
            `Reward: ${player.level * 50} Tokens`
        );
    }
    updatePlayerStats();
}

function updatePlayerStats() {
    document.getElementById('playerLevel').textContent = player.level;
    document.getElementById('playerXP').textContent = player.xp;
    document.getElementById('playerTokens').textContent = player.tokens;
    document.getElementById('playerStreak').textContent = player.dailyStreak;
    
    document.getElementById('levelDisplay').textContent = player.level;
    document.getElementById('currentXP').textContent = player.xp;
    document.getElementById('nextLevelXP').textContent = player.xpToNextLevel;
    
    let xpPercent = (player.xp / player.xpToNextLevel) * 100;
    document.getElementById('xpBar').style.width = `${xpPercent}%`;
    
    document.getElementById('dayCounter').textContent = day;
}

function renderProfileStats() {
    let profileStats = document.getElementById('profileStats');
    if (!profileStats) return;
    
    const totalValue = calculateTotalPortfolioValue();
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100).toFixed(1) : 0;
    
    profileStats.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div style="background: rgba(30, 30, 40, 0.9); padding: 15px; border-radius: 10px;">
                <div style="color: #aaa; font-size: 0.9rem;">Total Trades</div>
                <div style="color: #fff; font-size: 1.5rem; font-weight: bold;">${totalTrades}</div>
            </div>
            <div style="background: rgba(30, 30, 40, 0.9); padding: 15px; border-radius: 10px;">
                <div style="color: #aaa; font-size: 0.9rem;">Win Rate</div>
                <div style="color: #fff; font-size: 1.5rem; font-weight: bold;">${winRate}%</div>
            </div>
            <div style="background: rgba(30, 30, 40, 0.9); padding: 15px; border-radius: 10px;">
                <div style="color: #aaa; font-size: 0.9rem;">Total Profit</div>
                <div style="color: ${player.totalProfit >= 0 ? '#4CAF50' : '#F44336'}; font-size: 1.5rem; font-weight: bold;">$${player.totalProfit.toFixed(2)}</div>
            </div>
            <div style="background: rgba(30, 30, 40, 0.9); padding: 15px; border-radius: 10px;">
                <div style="color: #aaa; font-size: 0.9rem;">Days Played</div>
                <div style="color: #fff; font-size: 1.5rem; font-weight: bold;">${day - 1}</div>
            </div>
        </div>
    `;
}

function renderTransactionHistory() {
    let historyDiv = document.getElementById('transactionHistory');
    if (!historyDiv) return;
    
    historyDiv.innerHTML = '';
    
    // Show last 10 transactions
    const recentTransactions = transactions.slice(-10).reverse();
    
    if (recentTransactions.length === 0) {
        historyDiv.innerHTML = '<div style="text-align: center; color: #aaa; padding: 40px;">No transactions yet.</div>';
        return;
    }
    
    for (let tx of recentTransactions) {
        const typeClass = tx.type === 'buy' ? 'transaction-buy' : 'transaction-sell';
        const typeIcon = tx.type === 'buy' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        const typeColor = tx.type === 'buy' ? '#4CAF50' : '#F44336';
        
        historyDiv.innerHTML += `
            <div class="${typeClass}" style="background: rgba(30, 30, 40, 0.7); border-radius: 8px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${typeColor};">
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

function renderNewsTicker() {
    let newsContent = document.getElementById('newsContent');
    if (!newsContent) return;
    
    newsContent.innerHTML = '';
    
    // Shuffle and pick 5 news items
    let shuffledNews = [...newsHeadlines].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    for (let headline of shuffledNews) {
        newsContent.innerHTML += `
            <div class="news-item">
                <i class="fas fa-newspaper"></i> ${headline}
            </div>
        `;
    }
    
    // Duplicate for seamless loop
    newsContent.innerHTML += newsContent.innerHTML;
}

function showEventPopup(title, description, reward) {
    document.getElementById('eventTitle').textContent = title;
    document.getElementById('eventDescription').textContent = description;
    document.getElementById('eventReward').textContent = reward;
    document.getElementById('gameEventPopup').style.display = 'block';
}

function closeEventPopup() {
    document.getElementById('gameEventPopup').style.display = 'none';
}

// ====================
// INITIALIZATION
// ====================
function init() {
    console.log('Initializing game...');
    
    // Initialize price history
    initializePriceHistory();
    
    // Set up event listeners
    document.getElementById('asset').addEventListener('input', function(e) {
        let value = e.target.value.toUpperCase();
        if (assets[value]) {
            selectAsset(value);
        }
    });
    
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
    
    // Initial render
    renderMarket();
    renderPortfolio();
    renderNewsTicker();
    renderChart();
    updatePlayerStats();
    renderAchievements();
    renderChallenges();
    renderUpgrades();
    
    // Welcome message
    setTimeout(() => {
        showEventPopup(
            '🎮 Welcome to Crypto Trading Game!',
            'Trade assets, complete challenges, and become a trading legend!',
            'Start with $10,000 and 100 Tokens!'
        );
    }, 1000);
    
    console.log('Game initialized successfully');
}

// Start the game when page loads
window.onload = init;
