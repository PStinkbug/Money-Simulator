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
    activeChallenges: [],
    upgrades: [],
    totalProfit: 0,
    highestPortfolioValue: 10000
};

// ====================
// ACHIEVEMENTS SYSTEM
// ====================
const achievements = [
    {
        id: 'first_trade',
        name: 'First Trade',
        description: 'Execute your first trade',
        icon: 'fas fa-handshake',
        xp: 50,
        tokens: 25,
        condition: (state) => state.totalTrades >= 1
    },
    {
        id: 'first_profit',
        name: 'First Profit',
        description: 'Make your first profitable trade',
        icon: 'fas fa-chart-line',
        xp: 100,
        tokens: 50,
        condition: (state) => state.profitableTrades >= 1
    },
    {
        id: 'day_trader',
        name: 'Day Trader',
        description: 'Make 10 trades in a single day',
        icon: 'fas fa-calendar-day',
        xp: 200,
        tokens: 100,
        condition: (state) => state.tradesToday >= 10
    },
    {
        id: 'crypto_whale',
        name: 'Crypto Whale',
        description: 'Hold $5,000 worth of cryptocurrency',
        icon: 'fas fa-fish',
        xp: 300,
        tokens: 150,
        condition: (state) => calculateCryptoValue() >= 5000
    },
    {
        id: 'diversified',
        name: 'Diversified',
        description: 'Own 5 different cryptocurrencies',
        icon: 'fas fa-layer-group',
        xp: 250,
        tokens: 125,
        condition: (state) => Object.keys(portfolio).filter(sym => portfolio[sym].amount > 0 && assets[sym].type === 'crypto').length >= 5
    },
    {
        id: 'stock_master',
        name: 'Stock Master',
        description: 'Own $3,000 worth of stocks',
        icon: 'fas fa-chart-bar',
        xp: 300,
        tokens: 150,
        condition: (state) => calculateStockValue() >= 3000
    },
    {
        id: 'portfolio_15k',
        name: 'Fifteen Grand',
        description: 'Reach $15,000 total portfolio value',
        icon: 'fas fa-money-bill-wave',
        xp: 400,
        tokens: 200,
        condition: (state) => calculateTotalPortfolioValue() >= 15000
    },
    {
        id: 'portfolio_25k',
        name: 'Twenty-Five Grand',
        description: 'Reach $25,000 total portfolio value',
        icon: 'fas fa-money-bill-wave',
        xp: 600,
        tokens: 300,
        condition: (state) => calculateTotalPortfolioValue() >= 25000
    },
    {
        id: 'win_streak',
        name: 'Win Streak',
        description: 'Make 5 profitable trades in a row',
        icon: 'fas fa-fire',
        xp: 500,
        tokens: 250,
        condition: (state) => checkWinStreak() >= 5
    },
    {
        id: 'market_timer',
        name: 'Market Timer',
        description: 'Buy at the lowest price and sell at the highest for any asset',
        icon: 'fas fa-clock',
        xp: 750,
        tokens: 375,
        condition: (state) => checkMarketTiming()
    },
    {
        id: 'seven_day_streak',
        name: 'Week Warrior',
        description: 'Play for 7 consecutive days',
        icon: 'fas fa-calendar-week',
        xp: 400,
        tokens: 200,
        condition: (state) => player.dailyStreak >= 7
    },
    {
        id: 'risk_taker',
        name: 'Risk Taker',
        description: 'Make a trade worth 50% of your portfolio',
        icon: 'fas fa-dice',
        xp: 300,
        tokens: 150,
        condition: (state) => checkLargeTrade()
    },
    {
        id: 'crypto_collector',
        name: 'Crypto Collector',
        description: 'Own all available cryptocurrencies',
        icon: 'fas fa-coins',
        xp: 1000,
        tokens: 500,
        condition: (state) => Object.keys(assets).filter(sym => assets[sym].type === 'crypto').every(sym => portfolio[sym].amount > 0)
    },
    {
        id: 'perfect_timing',
        name: 'Perfect Timing',
        description: 'Buy and sell the same asset for 100% profit in one day',
        icon: 'fas fa-bullseye',
        xp: 800,
        tokens: 400,
        condition: (state) => checkPerfectTiming()
    },
    {
        id: 'volume_trader',
        name: 'Volume Trader',
        description: 'Trade 100 times total',
        icon: 'fas fa-exchange-alt',
        xp: 600,
        tokens: 300,
        condition: (state) => totalTrades >= 100
    },
    {
        id: 'crypto_expert',
        name: 'Crypto Expert',
        description: 'Reach level 10',
        icon: 'fas fa-user-graduate',
        xp: 1000,
        tokens: 500,
        condition: (state) => player.level >= 10
    },
    {
        id: 'millionaire',
        name: 'Millionaire',
        description: 'Reach $1,000,000 portfolio value',
        icon: 'fas fa-gem',
        xp: 5000,
        tokens: 2500,
        condition: (state) => calculateTotalPortfolioValue() >= 1000000
    },
    {
        id: 'market_dominator',
        name: 'Market Dominator',
        description: 'Own 51% of any single asset',
        icon: 'fas fa-chess-king',
        xp: 1500,
        tokens: 750,
        condition: (state) => checkMarketDominance()
    },
    {
        id: 'patience_pays',
        name: 'Patience Pays',
        description: 'Hold an asset for 30 days without selling',
        icon: 'fas fa-hourglass-half',
        xp: 400,
        tokens: 200,
        condition: (state) => checkLongHold()
    },
    {
        id: 'all_achievements',
        name: 'Completionist',
        description: 'Unlock all achievements',
        icon: 'fas fa-trophy',
        xp: 5000,
        tokens: 2500,
        condition: (state) => player.achievements.length === achievements.length
    }
];

// ====================
// CHALLENGES SYSTEM
// ====================
const challenges = [
    // Daily Challenges
    {
        id: 'daily_trade_5',
        name: 'Active Trader',
        description: 'Make 5 trades today',
        type: 'daily',
        target: 5,
        progress: 0,
        reward: { xp: 100, tokens: 50 },
        resetsDaily: true
    },
    {
        id: 'daily_profit_500',
        name: 'Profit Hunter',
        description: 'Make $500 profit today',
        type: 'daily',
        target: 500,
        progress: 0,
        reward: { xp: 150, tokens: 75 },
        resetsDaily: true
    },
    {
        id: 'daily_diversify',
        name: 'Diversify Daily',
        description: 'Trade 3 different assets today',
        type: 'daily',
        target: 3,
        progress: 0,
        reward: { xp: 80, tokens: 40 },
        resetsDaily: true
    },
    
    // Milestone Quests
    {
        id: 'quest_portfolio_50k',
        name: 'Fifty Grand Quest',
        description: 'Reach $50,000 portfolio value',
        type: 'milestone',
        target: 50000,
        progress: 0,
        reward: { xp: 1000, tokens: 500 },
        resetsDaily: false
    },
    {
        id: 'quest_level_20',
        name: 'Level Up Quest',
        description: 'Reach level 20',
        type: 'milestone',
        target: 20,
        progress: 1,
        reward: { xp: 2000, tokens: 1000 },
        resetsDaily: false
    },
    {
        id: 'quest_tokens_5000',
        name: 'Token Collector',
        description: 'Collect 5,000 tokens',
        type: 'milestone',
        target: 5000,
        progress: 100,
        reward: { xp: 1500, tokens: 750 },
        resetsDaily: false
    },
    {
        id: 'quest_achievements_10',
        name: 'Achievement Hunter',
        description: 'Unlock 10 achievements',
        type: 'milestone',
        target: 10,
        progress: 0,
        reward: { xp: 800, tokens: 400 },
        resetsDaily: false
    },
    {
        id: 'quest_days_30',
        name: 'Month of Trading',
        description: 'Play for 30 days',
        type: 'milestone',
        target: 30,
        progress: 1,
        reward: { xp: 3000, tokens: 1500 },
        resetsDaily: false
    }
];

// ====================
// UPGRADES SYSTEM
// ====================
const upgrades = [
    {
        id: 'upgrade_trading_fee_1',
        name: 'Reduced Fees I',
        description: 'Reduce trading fees by 10%',
        icon: 'fas fa-percentage',
        cost: 500,
        effect: () => { tradingFeeMultiplier = 0.9; },
        category: 'trading'
    },
    {
        id: 'upgrade_trading_fee_2',
        name: 'Reduced Fees II',
        description: 'Reduce trading fees by an additional 15%',
        icon: 'fas fa-percentage',
        cost: 1000,
        effect: () => { tradingFeeMultiplier = 0.85; },
        category: 'trading',
        requires: 'upgrade_trading_fee_1'
    },
    {
        id: 'upgrade_chart_insight',
        name: 'Chart Insight',
        description: 'See price predictions on charts',
        icon: 'fas fa-chart-line',
        cost: 800,
        effect: () => { enableChartPredictions = true; },
        category: 'analysis'
    },
    {
        id: 'upgrade_market_news',
        name: 'Market News Feed',
        description: 'Get early access to market-moving news',
        icon: 'fas fa-newspaper',
        cost: 1200,
        effect: () => { enableEarlyNews = true; },
        category: 'analysis'
    },
    {
        id: 'upgrade_auto_trader',
        name: 'Auto Trader',
        description: 'Automatically execute limit orders',
        icon: 'fas fa-robot',
        cost: 2000,
        effect: () => { enableAutoTrading = true; },
        category: 'trading'
    },
    {
        id: 'upgrade_portfolio_tracker',
        name: 'Portfolio Tracker',
        description: 'Track detailed portfolio analytics',
        icon: 'fas fa-chart-pie',
        cost: 600,
        effect: () => { enablePortfolioAnalytics = true; },
        category: 'analysis'
    },
    {
        id: 'upgrade_advanced_charts',
        name: 'Advanced Charts',
        description: 'Unlock technical indicators (RSI, MACD)',
        icon: 'fas fa-chart-area',
        cost: 1500,
        effect: () => { enableTechnicalIndicators = true; },
        category: 'analysis'
    },
    {
        id: 'upgrade_trading_bot',
        name: 'Trading Bot',
        description: 'AI-powered trading suggestions',
        icon: 'fas fa-brain',
        cost: 3000,
        effect: () => { enableTradingBot = true; },
        category: 'trading',
        requires: 'upgrade_auto_trader'
    }
];

// ====================
// LEADERBOARD SYSTEM
// ====================
let leaderboard = [];

// ====================
// ASSETS DATA
// ====================
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
    }
};

// ====================
// PORTFOLIO
// ====================
let portfolio = {};
for (let symbol in assets) {
    portfolio[symbol] = { amount: 0, avgPrice: 0, totalCost: 0, purchaseDay: 0 };
}

// ====================
// GAME VARIABLES
// ====================
let transactions = [];
let tradingFeeMultiplier = 1.0;
let enableChartPredictions = false;
let enableEarlyNews = false;
let enableAutoTrading = false;
let enablePortfolioAnalytics = false;
let enableTechnicalIndicators = false;
let enableTradingBot = false;
let dailyProfit = 0;
let winStreak = 0;
let lastTradeWasProfitable = false;

// ====================
// NEWS SYSTEM
// ====================
const newsHeadlines = [
    "Bitcoin ETF Approval Expected by End of Quarter",
    "Ethereum Network Upgrade Reduces Fees by 40%",
    "Federal Reserve Considers Digital Dollar Pilot",
    "Tech Stocks Rally on Strong Earnings Reports",
    "Regulatory Clarity Boosts Crypto Market Confidence",
    "Major Bank Launches Crypto Trading for Retail Clients",
    "NFT Market Shows Signs of Recovery After Slump",
    "AI Chip Demand Drives Semiconductor Stocks Higher",
    "Elon Musk Announces Twitter Integration with Dogecoin",
    "Sustainable Mining Initiative Gains Traction"
];

// ====================
// INITIALIZATION
// ====================
function initializePriceHistory() {
    for (let symbol in assets) {
        priceHistory[symbol] = [];
        let basePrice = assets[symbol].price;
        for (let i = 0; i < 30; i++) {
            let change = (Math.random() * assets[symbol].volatility * 2 - assets[symbol].volatility);
            basePrice *= (1 + change);
            priceHistory[symbol].push({
                day: i + 1,
                price: basePrice
            });
        }
        assets[symbol].price = Math.round(basePrice * 100) / 100;
        previousPrices[symbol] = assets[symbol].price;
    }
}

function generateWalletAddress() {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
}

// ====================
// GAME FUNCTIONS
// ====================
function updateMarket() {
    tradesToday = 0;
    dailyProfit = 0;
    
    // Check daily streak
    const today = new Date().toDateString();
    if (player.lastPlayed !== today) {
        if (new Date(player.lastPlayed).getTime() === new Date(today).getTime() - 86400000) {
            player.dailyStreak++;
        } else {
            player.dailyStreak = 1;
        }
        player.lastPlayed = today;
    }
    
    for (let symbol in assets) {
        let asset = assets[symbol];
        let previousPrice = asset.price;
        previousPrices[symbol] = previousPrice;
        
        let change;
        if (asset.type === 'crypto') {
            if (Math.random() < 0.1) {
                change = (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
            } else if (Math.random() < 0.3) {
                change = (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
            } else {
                change = (Math.random() * asset.volatility * 2 - asset.volatility);
            }
        } else {
            if (Math.random() < 0.05) {
                change = (Math.random() * 0.06 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
            } else if (Math.random() < 0.2) {
                change = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
            } else {
                change = (Math.random() * asset.volatility * 2 - asset.volatility);
            }
        }
        
        if (asset.change24h > 0) change += Math.random() * 0.02;
        else if (asset.change24h < 0) change -= Math.random() * 0.02;
        
        asset.price *= (1 + change);
        asset.price = Math.round(asset.price * 100) / 100;
        asset.change24h = ((asset.price - previousPrice) / previousPrice) * 100;
        
        priceHistory[symbol].push({
            day: day,
            price: asset.price
        });
        if (priceHistory[symbol].length > 30) {
            priceHistory[symbol].shift();
        }
    }
    
    day++;
    checkAchievements();
    checkChallenges();
    saveGame();
    render();
}

// ====================
// ACHIEVEMENT FUNCTIONS
// ====================
function checkAchievements() {
    const gameState = {
        totalTrades,
        profitableTrades,
        tradesToday,
        dailyProfit,
        player,
        day
    };
    
    for (let achievement of achievements) {
        if (!player.achievements.includes(achievement.id) && achievement.condition(gameState)) {
            unlockAchievement(achievement);
        }
    }
}

function unlockAchievement(achievement) {
    player.achievements.push(achievement.id);
    addXP(achievement.xp);
    player.tokens += achievement.tokens;
    
    // Show popup
    showEventPopup(
        '🎉 Achievement Unlocked! 🎉',
        achievement.name,
        `+${achievement.xp} XP & ${achievement.tokens} Tokens`
    );
    
    renderAchievements();
}

function calculateCryptoValue() {
    let value = 0;
    for (let symbol in portfolio) {
        if (assets[symbol].type === 'crypto' && portfolio[symbol].amount > 0) {
            value += portfolio[symbol].amount * assets[symbol].price;
        }
    }
    return value;
}

function calculateStockValue() {
    let value = 0;
    for (let symbol in portfolio) {
        if (assets[symbol].type === 'stock' && portfolio[symbol].amount > 0) {
            value += portfolio[symbol].amount * assets[symbol].price;
        }
    }
    return value;
}

function calculateTotalPortfolioValue() {
    let value = cash;
    for (let symbol in portfolio) {
        value += portfolio[symbol].amount * assets[symbol].price;
    }
    return value;
}

function checkWinStreak() {
    return winStreak;
}

function checkMarketTiming() {
    // Simplified check - look for any trade with 100%+ profit
    for (let tx of transactions) {
        if (tx.type === 'sell' && tx.profitLoss && tx.profitLoss > 0) {
            let profitPercent = (tx.profitLoss / (tx.total - tx.profitLoss)) * 100;
            if (profitPercent >= 100) return true;
        }
    }
    return false;
}

function checkLargeTrade() {
    // Check if any trade was > 50% of portfolio at time
    for (let tx of transactions.slice(-10)) {
        let tradeValue = tx.amount * tx.price;
        if (tradeValue > calculateTotalPortfolioValue() * 0.5) {
            return true;
        }
    }
    return false;
}

function checkPerfectTiming() {
    // Check for 100% profit in one day
    for (let i = 0; i < transactions.length - 1; i++) {
        if (transactions[i].type === 'buy' && transactions[i+1].type === 'sell' && 
            transactions[i].asset === transactions[i+1].asset &&
            transactions[i].day === transactions[i+1].day) {
            let profitPercent = ((transactions[i+1].price - transactions[i].price) / transactions[i].price) * 100;
            if (profitPercent >= 100) return true;
        }
    }
    return false;
}

function checkMarketDominance() {
    // Simplified - check if any holding is large
    for (let symbol in portfolio) {
        let holdingValue = portfolio[symbol].amount * assets[symbol].price;
        if (holdingValue > assets[symbol].marketCap * 0.51) {
            return true;
        }
    }
    return false;
}

function checkLongHold() {
    for (let symbol in portfolio) {
        if (portfolio[symbol].amount > 0 && portfolio[symbol].purchaseDay > 0) {
            if (day - portfolio[symbol].purchaseDay >= 30) {
                return true;
            }
        }
    }
    return false;
}

// ====================
// CHALLENGE FUNCTIONS
// ====================
function checkChallenges() {
    const totalValue = calculateTotalPortfolioValue();
    
    for (let challenge of challenges) {
        if (player.completedChallenges.includes(challenge.id)) continue;
        
        switch(challenge.id) {
            case 'daily_trade_5':
                challenge.progress = tradesToday;
                break;
            case 'daily_profit_500':
                challenge.progress = dailyProfit;
                break;
            case 'daily_diversify':
                // Count unique assets traded today
                let uniqueAssets = new Set(transactions
                    .filter(tx => tx.day === day - 1)
                    .map(tx => tx.asset));
                challenge.progress = uniqueAssets.size;
                break;
            case 'quest_portfolio_50k':
                challenge.progress = totalValue;
                break;
            case 'quest_level_20':
                challenge.progress = player.level;
                break;
            case 'quest_tokens_5000':
                challenge.progress = player.tokens;
                break;
            case 'quest_achievements_10':
                challenge.progress = player.achievements.length;
                break;
            case 'quest_days_30':
                challenge.progress = day;
                break;
        }
        
        if (challenge.progress >= challenge.target) {
            completeChallenge(challenge);
        }
    }
    
    renderChallenges();
}

function completeChallenge(challenge) {
    player.completedChallenges.push(challenge.id);
    addXP(challenge.reward.xp);
    player.tokens += challenge.reward.tokens;
    
    showEventPopup(
        '🏆 Challenge Completed! 🏆',
        challenge.name,
        `+${challenge.reward.xp} XP & ${challenge.reward.tokens} Tokens`
    );
}

// ====================
// UPGRADE FUNCTIONS
// ====================
function purchaseUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (player.tokens >= upgrade.cost && !player.upgrades.includes(upgradeId)) {
        // Check requirements
        if (upgrade.requires && !player.upgrades.includes(upgrade.requires)) {
            alert(`You need to purchase ${upgrades.find(u => u.id === upgrade.requires).name} first!`);
            return;
        }
        
        player.tokens -= upgrade.cost;
        player.upgrades.push(upgradeId);
        upgrade.effect();
        
        showEventPopup(
            '⚡ Upgrade Purchased! ⚡',
            upgrade.name,
            `Now active in your game!`
        );
        
        renderUpgrades();
        render();
    } else if (player.upgrades.includes(upgradeId)) {
        alert("You already own this upgrade!");
    } else {
        alert(`Not enough tokens! Need ${upgrade.cost}, have ${player.tokens}`);
    }
}

// ====================
// XP & LEVEL SYSTEM
// ====================
function addXP(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        
        // Level up reward
        player.tokens += player.level * 50;
        
        showEventPopup(
            '🌟 Level Up! 🌟',
            `You've reached Level ${player.level}!`,
            `Reward: ${player.level * 50} Tokens`
        );
    }
    updatePlayerStats();
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
    let cost = price * amount * tradingFeeMultiplier;
    
    if (cost > cash) {
        alert(`Insufficient funds! You need $${cost.toFixed(2)} but only have $${cash.toFixed(2)}`);
        return;
    }
    
    cash -= cost;
    portfolio[asset].amount += amount;
    portfolio[asset].totalCost += cost;
    portfolio[asset].avgPrice = portfolio[asset].totalCost / portfolio[asset].amount;
    portfolio[asset].purchaseDay = day;
    
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
    
    // Add XP for trading
    addXP(Math.floor(cost / 100));
    
    document.getElementById('amount').value = '';
    
    // Reset win streak if last trade was profitable
    lastTradeWasProfitable = false;
    
    checkAchievements();
    render();
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
        alert(`Insufficient ${asset}! You have ${portfolio[asset].amount.toFixed(8)} but trying to sell ${amount}`);
        return;
    }
    
    let price = assets[asset].price;
    let revenue = price * amount * tradingFeeMultiplier;
    
    let costOfGoodsSold = (portfolio[asset].totalCost / portfolio[asset].amount) * amount;
    let profitLoss = revenue - costOfGoodsSold;
    
    // Update daily profit
    dailyProfit += profitLoss;
    player.totalProfit += profitLoss;
    
    if (profitLoss > 0) {
        profitableTrades++;
        if (lastTradeWasProfitable) {
            winStreak++;
        } else {
            winStreak = 1;
        }
        lastTradeWasProfitable = true;
    } else {
        winStreak = 0;
        lastTradeWasProfitable = false;
    }
    
    cash += revenue;
    portfolio[asset].amount -= amount;
    portfolio[asset].totalCost -= costOfGoodsSold;
    
    if (portfolio[asset].amount === 0) {
        portfolio[asset].avgPrice = 0;
        portfolio[asset].purchaseDay = 0;
    } else {
        portfolio[asset].avgPrice = portfolio[asset].totalCost / portfolio[asset].amount;
    }
    
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
        addXP(Math.floor(profitLoss / 10));
    }
    
    document.getElementById('amount').value = '';
    
    checkAchievements();
    render();
}

// ====================
// RENDER FUNCTIONS
// ====================
function render() {
    renderMarket();
    renderPortfolio();
    renderTransactionHistory();
    renderNewsTicker();
    renderChart();
    updatePlayerStats();
    updateLeaderboards();
}

function renderMarket() {
    let marketGrid = document.getElementById('marketGrid');
    marketGrid.innerHTML = '';
    
    for (let symbol in assets) {
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
                ${enablePortfolioAnalytics ? `
                <div style="margin-top: 5px; font-size: 0.8rem; color: #aaa;">
                    24h Vol: $${(asset.volume24h / 1000000).toFixed(1)}M
                </div>
                ` : ''}
            </div>
        `;
    }
    
    let assetSelector = document.getElementById('assetSelector');
    assetSelector.innerHTML = '';
    for (let symbol in assets) {
        let isActive = symbol === selectedAsset ? 'active' : '';
        assetSelector.innerHTML += `
            <button class="asset-btn ${isActive}" onclick="selectAsset('${symbol}')">
                ${symbol}
            </button>
        `;
    }
    
    document.getElementById('asset').value = selectedAsset;
}

function renderPortfolio() {
    let portfolioGrid = document.getElementById('portfolioGrid');
    portfolioGrid.innerHTML = '';
    
    let totalPortfolioValue = cash;
    
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        let asset = assets[symbol];
        
        if (holding.amount > 0) {
            let currentValue = holding.amount * asset.price;
            totalPortfolioValue += currentValue;
            
            let profitLoss = currentValue - holding.totalCost;
            let profitLossPercent = holding.totalCost > 0 ? (profitLoss / holding.totalCost * 100) : 0;
            let plClass = profitLoss >= 0 ? 'positive' : 'negative';
            
            let holdingDays = holding.purchaseDay > 0 ? day - holding.purchaseDay : 0;
            
            portfolioGrid.innerHTML += `
                <div class="portfolio-item">
                    <div class="portfolio-header">
                        <div style="font-weight: bold; font-size: 1.1rem;">
                            <i class="${asset.icon}"></i> ${symbol}
                        </div>
                        <div style="font-size: 1.2rem; font-weight: bold;">
                            $${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.9rem;">
                        <div>Amount: ${holding.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</div>
                        <div>Avg Price: $${holding.avgPrice.toFixed(2)}</div>
                        <div>P&L: <span class="${plClass}">${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${profitLossPercent.toFixed(2)}%)</span></div>
                        ${holdingDays > 0 ? `<div>Held for: ${holdingDays} days</div>` : ''}
                    </div>
                </div>
            `;
        }
    }
    
    document.getElementById('totalValue').textContent = `$${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    let totalPnl = totalPortfolioValue - 10000;
    document.getElementById('totalPnl').textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    document.getElementById('totalPnl').className = totalPnl >= 0 ? 'stat-value positive-stat' : 'stat-value negative-stat';
    
    let dailyPnl = 0;
    for (let symbol in portfolio) {
        let holding = portfolio[symbol];
        if (holding.amount > 0 && previousPrices[symbol]) {
            dailyPnl += holding.amount * (assets[symbol].price - previousPrices[symbol]);
        }
    }
    
    document.getElementById('dailyPnl').textContent = `${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toFixed(2)}`;
    document.getElementById('dailyPnl').className = dailyPnl >= 0 ? 'stat-value positive-stat' : 'stat-value negative-stat';
    
    let winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100) : 0;
    document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
}

function renderAchievements() {
    let achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    achievementsGrid.innerHTML = '';
    
    for (let achievement of achievements) {
        let unlocked = player.achievements.includes(achievement.id);
        let statusClass = unlocked ? 'unlocked' : 'locked';
        
        achievementsGrid.innerHTML += `
            <div class="achievement-card ${statusClass}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-reward">${unlocked ? '✓ Unlocked' : `Reward: ${achievement.xp} XP + ${achievement.tokens} Tokens`}</div>
            </div>
        `;
    }
    
    document.getElementById('achievementsProgress').textContent = 
        `${player.achievements.length}/${achievements.length}`;
}

function renderChallenges() {
    let dailyChallenges = document.getElementById('dailyChallenges');
    let milestoneQuests = document.getElementById('milestoneQuests');
    
    if (!dailyChallenges || !milestoneQuests) return;
    
    dailyChallenges.innerHTML = '';
    milestoneQuests.innerHTML = '';
    
    for (let challenge of challenges) {
        let completed = player.completedChallenges.includes(challenge.id);
        let progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
        
        const challengeHTML = `
            <div class="challenge-card ${completed ? 'completed' : 'active'}">
                <div class="challenge-header">
                    <div class="challenge-title">${challenge.name}</div>
                    <div class="challenge-progress">${challenge.progress.toFixed(0)}/${challenge.target}</div>
                </div>
                <div class="challenge-desc">${challenge.description}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="challenge-reward">
                    <div>${completed ? 'Completed ✓' : 'In Progress'}</div>
                    <div class="reward-amount">${challenge.reward.xp} XP + ${challenge.reward.tokens} Tokens</div>
                </div>
            </div>
        `;
        
        if (challenge.type === 'daily') {
            dailyChallenges.innerHTML += challengeHTML;
        } else {
            milestoneQuests.innerHTML += challengeHTML;
        }
    }
}

function renderUpgrades() {
    let tradingUpgrades = document.getElementById('tradingUpgrades');
    let analysisUpgrades = document.getElementById('analysisUpgrades');
    
    if (!tradingUpgrades || !analysisUpgrades) return;
    
    tradingUpgrades.innerHTML = '';
    analysisUpgrades.innerHTML = '';
    
    for (let upgrade of upgrades) {
        let purchased = player.upgrades.includes(upgrade.id);
        let available = player.tokens >= upgrade.cost && !purchased;
        let statusClass = purchased ? 'purchased' : available ? 'available' : '';
        
        const upgradeHTML = `
            <div class="upgrade-card ${statusClass}" ${available ? `onclick="purchaseUpgrade('${upgrade.id}')"` : ''}>
                <div style="font-size: 2rem; margin-bottom: 10px; color: ${available ? '#00d4ff' : purchased ? '#4CAF50' : '#666'}">
                    <i class="${upgrade.icon}"></i>
                </div>
                <div style="font-weight: bold; margin-bottom: 5px;">${upgrade.name}</div>
                <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 10px;">${upgrade.description}</div>
                <div class="upgrade-cost">Cost: ${upgrade.cost} Tokens</div>
                ${purchased ? '<div class="upgrade-effect">✓ Purchased</div>' : ''}
            </div>
        `;
        
        if (upgrade.category === 'trading') {
            tradingUpgrades.innerHTML += upgradeHTML;
        } else {
            analysisUpgrades.innerHTML += upgradeHTML;
        }
    }
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
    
    document.getElementById('totalTradesCount').textContent = totalTrades;
    let profitRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100) : 0;
    document.getElementById('profitRate').textContent = `${profitRate.toFixed(1)}%`;
    document.getElementById('daysPlayed').textContent = day - 1;
}

function updateLeaderboards() {
    let globalLeaderboard = document.getElementById('globalLeaderboard');
    let friendsLeaderboard = document.getElementById('friendsLeaderboard');
    
    if (!globalLeaderboard || !friendsLeaderboard) return;
    
    // Update player's score
    const playerScore = {
        name: "You",
        score: calculateTotalPortfolioValue(),
        level: player.level
    };
    
    // Global leaderboard (simulated)
    let globalScores = [
        { name: "CryptoKing", score: 1250000, level: 45 },
        { name: "BitcoinBaron", score: 980000, level: 38 },
        { name: "EthereumEagle", score: 750000, level: 32 },
        playerScore,
        { name: "StockShark", score: 45000, level: 15 },
        { name: "TradingTiger", score: 32000, level: 12 },
        { name: "MarketMage", score: 28000, level: 10 },
        { name: "PortfolioPro", score: 21000, level: 8 },
        { name: "DayTraderDan", score: 18000, level: 7 },
        { name: "NewbieNick", score: 10500, level: 3 }
    ];
    
    globalScores.sort((a, b) => b.score - a.score);
    
    globalLeaderboard.innerHTML = '';
    globalScores.forEach((score, index) => {
        let rankClass = index < 3 ? `rank-${index + 1}` : '';
        let isPlayer = score.name === "You";
        
        globalLeaderboard.innerHTML += `
            <div class="leaderboard-item" style="${isPlayer ? 'background: rgba(247, 147, 26, 0.2);' : ''}">
                <div class="rank ${rankClass}">${index + 1}</div>
                <div class="player-name">
                    ${score.name}
                    <div style="font-size: 0.8rem; color: #aaa;">Level ${score.level}</div>
                </div>
                <div class="player-score">$${score.score.toLocaleString()}</div>
            </div>
        `;
    });
    
    // Friends leaderboard
    friendsLeaderboard.innerHTML = `
        <div class="leaderboard-item" style="background: rgba(247, 147, 26, 0.2);">
            <div class="rank">1</div>
            <div class="player-name">
                You
                <div style="font-size: 0.8rem; color: #aaa;">Level ${player.level}</div>
            </div>
            <div class="player-score">$${playerScore.score.toLocaleString()}</div>
        </div>
        <div class="leaderboard-item">
            <div class="rank">2</div>
            <div class="player-name">
                TraderFriend1
                <div style="font-size: 0.8rem; color: #aaa;">Level 8</div>
            </div>
            <div class="player-score">$24,500</div>
        </div>
        <div class="leaderboard-item">
            <div class="rank">3</div>
            <div class="player-name">
                CryptoBuddy
                <div style="font-size: 0.8rem; color: #aaa;">Level 12</div>
            </div>
            <div class="player-score">$42,300</div>
        </div>
    `;
}

// ====================
// UI FUNCTIONS
// ====================
function selectAsset(symbol) {
    selectedAsset = symbol;
    document.getElementById('asset').value = symbol;
    renderChart();
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Activate selected button
    event.currentTarget.classList.add('active');
    
    // Render tab-specific content
    if (tabName === 'achievements') {
        renderAchievements();
    } else if (tabName === 'challenges') {
        renderChallenges();
    } else if (tabName === 'upgrades') {
        renderUpgrades();
    } else if (tabName === 'leaderboard') {
        updateLeaderboards();
    }
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

function nextDay() {
    updateMarket();
}

// ====================
// SAVE/LOAD SYSTEM
// ====================
function saveGame() {
    const gameData = {
        cash,
        day,
        totalTrades,
        profitableTrades,
        selectedAsset,
        portfolio,
        player,
        transactions: transactions.slice(-50), // Save last 50 transactions
        priceHistory
    };
    
    localStorage.setItem('cryptoGameSave', JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem('cryptoGameSave');
    if (saved) {
        const gameData = JSON.parse(saved);
        
        cash = gameData.cash || cash;
        day = gameData.day || day;
        totalTrades = gameData.totalTrades || totalTrades;
        profitableTrades = gameData.profitableTrades || profitableTrades;
        selectedAsset = gameData.selectedAsset || selectedAsset;
        portfolio = gameData.portfolio || portfolio;
        player = gameData.player || player;
        transactions = gameData.transactions || [];
        priceHistory = gameData.priceHistory || priceHistory;
        
        // Fill in missing portfolio entries
        for (let symbol in assets) {
            if (!portfolio[symbol]) {
                portfolio[symbol] = { amount: 0, avgPrice: 0, totalCost: 0, purchaseDay: 0 };
            }
        }
        
        return true;
    }
    return false;
}

// ====================
// INITIALIZATION
// ====================
function init() {
    // Try to load saved game
    if (!loadGame()) {
        // Initialize new game
        initializePriceHistory();
        document.getElementById('walletAddress').textContent = generateWalletAddress();
        
        // Set up event listeners
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
        
        document.getElementById('asset').addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase();
            if (assets[value]) {
                selectAsset(value);
            }
        });
    }
    
    // Initial render
    setTimeout(() => {
        render();
        renderAchievements();
        renderChallenges();
        renderUpgrades();
    }, 100);
    
    // Auto-save every minute
    setInterval(saveGame, 60000);
}

// Start the game
window.onload = init;
