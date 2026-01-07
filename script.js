// ====================
// GAME CONFIGURATION
// ====================
const CONFIG = {
    INITIAL_CASH: 10000,
    MAX_ASSETS: 25,
    CHART_HISTORY_DAYS: 30,
    DAILY_BONUS_BASE: 100,
    LEVEL_MULTIPLIER: 1.5,
    SOUND_ENABLED: true,
    VIBRATION_ENABLED: true
};

// ====================
// GAME STATE
// ====================
let cash = CONFIG.INITIAL_CASH;
let day = 1;
let tradesToday = 0;
let totalTrades = 0;
let profitableTrades = 0;
let selectedAsset = "BTC";
let priceHistory = {};
let chart = null;
let previousPrices = {};
let confetti = null;
let soundEnabled = CONFIG.SOUND_ENABLED;
let lastPriceAnimations = {};

// Player progression
let player = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    tokens: 100,
    dailyStreak: 1,
    lastPlayed: new Date().toDateString(),
    lastBonusClaim: null,
    achievements: [],
    completedChallenges: [],
    activeChallenges: [],
    upgrades: [],
    totalProfit: 0,
    highestPortfolioValue: CONFIG.INITIAL_CASH,
    totalVolume: 0,
    favoriteAsset: "BTC",
    playTime: 0,
    highestWinStreak: 0
};

// Current session stats
let sessionStats = {
    startTime: Date.now(),
    trades: 0,
    profit: 0,
    winStreak: 0,
    currentWinStreak: 0
};

// ====================
// SOUND SYSTEM
// ====================
const SoundSystem = {
    sounds: {
        buy: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'),
        sell: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        levelUp: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        achievement: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'),
        bonus: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-aliens-2023.mp3'),
        error: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'),
        priceUp: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'),
        priceDown: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-bass-buzzer-948.mp3')
    },
    
    init() {
        // Set volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
            sound.preload = 'auto';
        });
    },
    
    play(soundName) {
        if (!soundEnabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {
                // Ignore autoplay restrictions
            });
        }
    }
};

// ====================
// PARTICLE SYSTEM
// ====================
const ParticleSystem = {
    particles: [],
    
    create(type, x, y, count = 20) {
        const colors = {
            coin: ['#FFD700', '#FFA500', '#FFEE58'],
            xp: ['#00D4FF', '#2196F3', '#03A9F4'],
            token: ['#F7931A', '#FF9800', '#FF5722'],
            level: ['#9C27B0', '#673AB7', '#E91E63']
        };
        
        for (let i = 0; i < count; i++) {
            const particle = {
                x,
                y,
                size: Math.random() * 20 + 5,
                speedX: Math.random() * 6 - 3,
                speedY: Math.random() * 6 - 3,
                color: colors[type][Math.floor(Math.random() * colors[type].length)],
                life: 100,
                type
            };
            this.particles.push(particle);
        }
    },
    
    update() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 2;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            const opacity = p.life / 100;
            const element = document.createElement('div');
            element.style.cssText = `
                position: absolute;
                left: ${p.x}px;
                top: ${p.y}px;
                width: ${p.size}px;
                height: ${p.size}px;
                background: ${p.color};
                border-radius: 50%;
                opacity: ${opacity};
                pointer-events: none;
            `;
            container.appendChild(element);
        }
        
        requestAnimationFrame(() => this.update());
    }
};

// ====================
// CONFETTI SYSTEM
// ====================
function launchConfetti() {
    if (!confetti) {
        confetti = new ConfettiGenerator({
            target: 'particles',
            max: 150,
            size: 1.2,
            animate: true,
            props: ['circle', 'square', 'triangle', 'line'],
            colors: [[255, 215, 0], [247, 147, 26], [0, 212, 255], [76, 175, 80], [156, 39, 176]],
            clock: 40
        });
        confetti.render();
    } else {
        confetti.clear();
        setTimeout(() => confetti.render(), 10);
    }
}

// ====================
// ADDICTIVE FEATURES
// ====================

// 1. DAILY BONUS SYSTEM
function checkDailyBonus() {
    const today = new Date().toDateString();
    if (player.lastBonusClaim !== today) {
        document.getElementById('dailyBonusBtn').style.display = 'flex';
    }
}

function claimDailyBonus() {
    const bonusMultiplier = Math.min(player.dailyStreak, 10);
    const xpBonus = CONFIG.DAILY_BONUS_BASE * bonusMultiplier;
    const tokenBonus = 50 * bonusMultiplier;
    
    addXP(xpBonus);
    player.tokens += tokenBonus;
    player.lastBonusClaim = new Date().toDateString();
    
    // Show floating coins
    showFloatingCoins(50);
    
    // Launch confetti
    launchConfetti();
    
    // Play sound
    SoundSystem.play('bonus');
    
    // Show event
    showEventPopup(
        '🎁 DAILY BONUS! 🎁',
        `Day ${player.dailyStreak} streak bonus!`,
        `+${xpBonus} XP & +${tokenBonus} Tokens`
    );
    
    document.getElementById('dailyBonusBtn').style.display = 'none';
}

// 2. PRICE CHANGE ANIMATIONS
function animatePriceChange(symbol, change) {
    const element = document.querySelector(`[data-symbol="${symbol}"] .asset-price`);
    if (!element) return;
    
    element.classList.remove('price-up', 'price-down');
    
    setTimeout(() => {
        if (change > 0) {
            element.classList.add('price-up');
            SoundSystem.play('priceUp');
        } else if (change < 0) {
            element.classList.add('price-down');
            SoundSystem.play('priceDown');
        }
        
        // Create particles
        const rect = element.getBoundingClientRect();
        ParticleSystem.create('coin', rect.left + rect.width / 2, rect.top);
    }, 100);
}

// 3. WIN STREAK BONUSES
function updateWinStreak(isProfitable) {
    if (isProfitable) {
        sessionStats.currentWinStreak++;
        sessionStats.winStreak = Math.max(sessionStats.winStreak, sessionStats.currentWinStreak);
        player.highestWinStreak = Math.max(player.highestWinStreak, sessionStats.currentWinStreak);
        
        // Streak bonuses
        if (sessionStats.currentWinStreak >= 3) {
            const streakBonus = Math.floor(sessionStats.currentWinStreak / 3) * 10;
            addXP(streakBonus);
            player.tokens += streakBonus;
            
            if (sessionStats.currentWinStreak % 3 === 0) {
                showEventPopup(
                    '🔥 WIN STREAK! 🔥',
                    `${sessionStats.currentWinStreak} profitable trades in a row!`,
                    `+${streakBonus} XP & Tokens`
                );
            }
        }
    } else {
        sessionStats.currentWinStreak = 0;
    }
}

// 4. LEVEL UP CELEBRATION
function showLevelUpAnimation() {
    const anim = document.getElementById('levelUpAnimation');
    anim.style.display = 'block';
    
    SoundSystem.play('levelUp');
    launchConfetti();
    
    setTimeout(() => {
        anim.style.display = 'none';
    }, 2000);
}

// 5. FLOATING COINS EFFECT
function showFloatingCoins(count = 20) {
    const container = document.getElementById('floatingCoins');
    container.style.display = 'block';
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.innerHTML = '<i class="fas fa-coins"></i>';
        coin.style.left = `${Math.random() * 100}vw`;
        coin.style.animationDelay = `${Math.random() * 0.5}s`;
        coin.style.color = i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#F7931A' : '#FF9800';
        
        container.appendChild(coin);
    }
    
    setTimeout(() => {
        container.style.display = 'none';
    }, 2000);
}

// ====================
// ENHANCED ASSETS DATA
// ====================
let assets = {
    // Cryptocurrencies
    BTC: {
        name: "Bitcoin",
        price: 45000,
        change24h: 0,
        marketCap: 880000000000,
        volume24h: 25000000000,
        volatility: 0.08,
        icon: "fab fa-bitcoin",
        color: "#F7931A",
        type: "crypto",
        trend: "bullish",
        popularity: 95
    },
    ETH: {
        name: "Ethereum",
        price: 3200,
        change24h: 0,
        marketCap: 385000000000,
        volume24h: 15000000000,
        volatility: 0.09,
        icon: "fab fa-ethereum",
        color: "#627EEA",
        type: "crypto",
        trend: "bullish",
        popularity: 90
    },
    SOL: {
        name: "Solana",
        price: 120,
        change24h: 0,
        marketCap: 52000000000,
        volume24h: 3500000000,
        volatility: 0.15,
        icon: "fas fa-fire",
        color: "#00FFA3",
        type: "crypto",
        trend: "volatile",
        popularity: 85
    },
    DOGE: {
        name: "Dogecoin",
        price: 0.15,
        change24h: 0,
        marketCap: 21000000000,
        volume24h: 1200000000,
        volatility: 0.25,
        icon: "fas fa-dog",
        color: "#C2A633",
        type: "crypto",
        trend: "meme",
        popularity: 80
    },
    ADA: {
        name: "Cardano",
        price: 0.55,
        change24h: 0,
        marketCap: 19500000000,
        volume24h: 450000000,
        volatility: 0.12,
        icon: "fas fa-chart-line",
        color: "#0033AD",
        type: "crypto",
        trend: "stable",
        popularity: 75
    },
    XRP: {
        name: "Ripple",
        price: 0.75,
        change24h: 0,
        marketCap: 40000000000,
        volume24h: 2000000000,
        volatility: 0.10,
        icon: "fas fa-bolt",
        color: "#23292F",
        type: "crypto",
        trend: "legal",
        popularity: 70
    },
    
    // Stocks
    AAPL: {
        name: "Apple",
        price: 185,
        change24h: 0,
        marketCap: 2900000000000,
        volume24h: 60000000,
        volatility: 0.03,
        icon: "fab fa-apple",
        color: "#A2AAAD",
        type: "stock",
        trend: "growth",
        popularity: 95
    },
    TSLA: {
        name: "Tesla",
        price: 250,
        change24h: 0,
        marketCap: 800000000000,
        volume24h: 100000000,
        volatility: 0.06,
        icon: "fas fa-car",
        color: "#CC0000",
        type: "stock",
        trend: "volatile",
        popularity: 85
    },
    NVDA: {
        name: "NVIDIA",
        price: 650,
        change24h: 0,
        marketCap: 1600000000000,
        volume24h: 50000000,
        volatility: 0.05,
        icon: "fas fa-microchip",
        color: "#76B900",
        type: "stock",
        trend: "bullish",
        popularity: 90
    },
    MSFT: {
        name: "Microsoft",
        price: 420,
        change24h: 0,
        marketCap: 3120000000000,
        volume24h: 25000000,
        volatility: 0.02,
        icon: "fab fa-windows",
        color: "#00A4EF",
        type: "stock",
        trend: "stable",
        popularity: 88
    },
    GME: {
        name: "GameStop",
        price: 18.50,
        change24h: 0,
        marketCap: 5700000000,
        volume24h: 30000000,
        volatility: 0.20,
        icon: "fas fa-gamepad",
        color: "#FF0000",
        type: "stock",
        trend: "meme",
        popularity: 75
    }
};

// ====================
// PORTFOLIO INIT
// ====================
let portfolio = {};
for (let symbol in assets) {
    portfolio[symbol] = { amount: 0, avgPrice: 0, totalCost: 0, purchaseDay: 0 };
}

// ====================
// TRANSACTIONS
// ====================
let transactions = [];

// ====================
// ENHANCED NEWS
// ====================
const newsHeadlines = [
    "🚀 BITCOIN HITS $50K: Institutional adoption reaches new highs!",
    "📈 TESLA ANNOUNCES BITCOIN PAYMENTS: Elon Musk confirms integration",
    "💎 DIAMOND HANDS: Retail investors hold strong through volatility",
    "🌙 ALT SEASON INCOMING: Analysts predict major altcoin rallies",
    "🏦 FED ANNOUNCES RATE DECISION: Markets react positively",
    "🦍 APES TOGETHER STRONG: Meme stocks surge on social sentiment",
    "🔮 CRYPTO PREDICTIONS 2024: Experts share bullish forecasts",
    "⚡ LIGHTNING NETWORK GROWS: Bitcoin scalability reaches new milestones",
    "🎮 GAMEFI EXPLOSION: Play-to-earn games dominate crypto space",
    "🌍 GREEN MINING INITIATIVE: Major miners switch to renewable energy",
    "🤖 AI TRADING BOTS: Automated systems outperform human traders",
    "🎯 SHORT SQUEEZE ALERT: Heavy short positions in popular stocks",
    "💰 MICROSTRATEGY BUYS MORE BITCOIN: Corporate treasury strategy expands",
    "📊 STOCK SPLIT ANNOUNCEMENTS: Major tech companies announce splits",
    "🌊 MARKET SENTIMENT TURNS BULLISH: Fear & Greed Index hits extreme greed"
];

// ====================
// ACHIEVEMENTS (ENHANCED)
// ====================
const achievements = [
    {
        id: 'first_trade',
        name: 'Baby Steps',
        description: 'Execute your first trade',
        icon: 'fas fa-baby',
        xp: 100,
        tokens: 50,
        condition: (state) => state.totalTrades >= 1
    },
    {
        id: 'first_profit',
        name: 'Profit Hunter',
        description: 'Make your first profitable trade',
        icon: 'fas fa-money-bill-wave',
        xp: 200,
        tokens: 100,
        condition: (state) => state.profitableTrades >= 1
    },
    {
        id: 'crypto_whale',
        name: 'Crypto Whale',
        description: 'Hold $10,000 worth of cryptocurrency',
        icon: 'fas fa-whale',
        xp: 500,
        tokens: 250,
        condition: (state) => calculateCryptoValue() >= 10000
    },
    {
        id: 'day_trader',
        name: 'Day Trader Pro',
        description: 'Make 20 trades in a single day',
        icon: 'fas fa-chart-line',
        xp: 300,
        tokens: 150,
        condition: (state) => state.tradesToday >= 20
    },
    {
        id: 'diamond_hands',
        name: 'Diamond Hands',
        description: 'Hold an asset through a 30% dip without selling',
        icon: 'fas fa-gem',
        xp: 750,
        tokens: 375,
        condition: (state) => checkDiamondHands()
    },
    {
        id: 'portfolio_100k',
        name: '100K Club',
        description: 'Reach $100,000 total portfolio value',
        icon: 'fas fa-trophy',
        xp: 1000,
        tokens: 500,
        condition: (state) => calculateTotalPortfolioValue() >= 100000
    },
    {
        id: 'win_streak_10',
        name: 'Unstoppable',
        description: 'Achieve 10 profitable trades in a row',
        icon: 'fas fa-fire',
        xp: 800,
        tokens: 400,
        condition: (state) => sessionStats.currentWinStreak >= 10
    },
    {
        id: 'diversification',
        name: 'Diversified King',
        description: 'Own 10 different assets at once',
        icon: 'fas fa-layer-group',
        xp: 600,
        tokens: 300,
        condition: (state) => Object.keys(portfolio).filter(sym => portfolio[sym].amount > 0).length >= 10
    },
    {
        id: 'volume_trader',
        name: 'Volume Legend',
        description: 'Trade $1,000,000 total volume',
        icon: 'fas fa-chart-bar',
        xp: 1500,
        tokens: 750,
        condition: (state) => player.totalVolume >= 1000000
    },
    {
        id: 'level_50',
        name: 'Trading God',
        description: 'Reach level 50',
        icon: 'fas fa-crown',
        xp: 5000,
        tokens: 2500,
        condition: (state) => player.level >= 50
    }
];

// ====================
// GAME INITIALIZATION
// ====================
function initializeGame() {
    SoundSystem.init();
    ParticleSystem.update();
    initializePriceHistory();
    checkDailyBonus();
    
    // Start play time tracking
    setInterval(() => {
        player.playTime++;
    }, 1000);
    
    // Auto-save every 30 seconds
    setInterval(saveGame, 30000);
    
    // Initialize confetti
    setTimeout(() => {
        confetti = new ConfettiGenerator({ target: 'particles' });
    }, 1000);
}

// ====================
// PRICE HISTORY INIT
// ====================
function initializePriceHistory() {
    for (let symbol in assets) {
        priceHistory[symbol] = [];
        let basePrice = assets[symbol].price;
        
        // Generate realistic historical data
        for (let i = 0; i < CONFIG.CHART_HISTORY_DAYS; i++) {
            const volatility = assets[symbol].volatility;
            let change;
            
            // Add some trends based on asset type
            if (assets[symbol].trend === 'bullish') {
                change = (Math.random() * volatility * 1.5 - volatility * 0.5);
            } else if (assets[symbol].trend === 'bearish') {
                change = (Math.random() * volatility * 1.5 - volatility);
            } else {
                change = (Math.random() * volatility * 2 - volatility);
            }
            
            basePrice *= (1 + change);
            priceHistory[symbol].push({
                day: i + 1,
                price: basePrice
            });
        }
        
        // Set current price
        assets[symbol].price = Math.round(basePrice * 100) / 100;
        previousPrices[symbol] = assets[symbol].price;
    }
}

// ====================
// MARKET UPDATE WITH EVENTS
// ====================
function updateMarket() {
    tradesToday = 0;
    
    // Check daily streak
    const today = new Date().toDateString();
    if (player.lastPlayed !== today) {
        if (isConsecutiveDay(player.lastPlayed, today)) {
            player.dailyStreak++;
        } else {
            player.dailyStreak = 1;
        }
        player.lastPlayed = today;
    }
    
    // Random market events (15% chance)
    if (Math.random() < 0.15) {
        triggerMarketEvent();
    }
    
    // Update prices with enhanced volatility
    for (let symbol in assets) {
        let asset = assets[symbol];
        let previousPrice = asset.price;
        previousPrices[symbol] = previousPrice;
        
        // Calculate change with trend influence
        let change = calculatePriceChange(asset);
        
        // Apply change
        asset.price *= (1 + change);
        asset.price = Math.round(asset.price * 100) / 100;
        
        // Store change for animation
        const priceChange = ((asset.price - previousPrice) / previousPrice) * 100;
        asset.change24h = priceChange;
        
        // Animate significant changes (>2%)
        if (Math.abs(priceChange) > 2) {
            animatePriceChange(symbol, priceChange);
        }
        
        // Update history
        priceHistory[symbol].push({
            day: day,
            price: asset.price
        });
        if (priceHistory[symbol].length > CONFIG.CHART_HISTORY_DAYS) {
            priceHistory[symbol].shift();
        }
    }
    
    day++;
    checkAchievements();
    updatePlayerStats();
    render();
}

function calculatePriceChange(asset) {
    const volatility = asset.volatility;
    let baseChange = (Math.random() * volatility * 2 - volatility);
    
    // Add trend bias
    switch(asset.trend) {
        case 'bullish': baseChange += volatility * 0.3; break;
        case 'bearish': baseChange -= volatility * 0.3; break;
        case 'meme': baseChange *= 1.5; break;
    }
    
    // Add momentum from previous change
    if (asset.change24h > 5) baseChange += volatility * 0.2;
    if (asset.change24h < -5) baseChange -= volatility * 0.2;
    
    return baseChange;
}

// ====================
// MARKET EVENTS
// ====================
function triggerMarketEvent() {
    const events = [
        {
            name: "🚀 BULL RUN!",
            description: "Market sentiment turns extremely bullish! All assets surge!",
            effect: () => {
                for (let symbol in assets) {
                    const boost = 0.1 + Math.random() * 0.15;
                    assets[symbol].price *= (1 + boost);
                }
                showEventPopup("🚀 MARKET EVENT", "Bull Run!", "All assets +10-25%!");
            }
        },
        {
            name: "🐻 MARKET CRASH!",
            description: "Panic selling hits the markets! Prices plummet!",
            effect: () => {
                for (let symbol in assets) {
                    const drop = 0.08 + Math.random() * 0.12;
                    assets[symbol].price *= (1 - drop);
                }
                showEventPopup("🐻 MARKET EVENT", "Market Crash!", "All assets -8-20%!");
            }
        },
        {
            name: "⚡ BITCOIN SURGE",
            description: "Bitcoin breaks key resistance level! Crypto rally incoming!",
            effect: () => {
                if (assets.BTC) {
                    assets.BTC.price *= 1.25;
                    showEventPopup("⚡ MARKET EVENT", "Bitcoin Surge!", "BTC +25%!");
                }
            }
        },
        {
            name: "🎮 MEMECOIN MANIA",
            description: "Social media frenzy drives meme assets crazy!",
            effect: () => {
                for (let symbol in assets) {
                    if (assets[symbol].trend === 'meme') {
                        const pump = 0.3 + Math.random() * 0.4;
                        assets[symbol].price *= (1 + pump);
                    }
                }
                showEventPopup("🎮 MARKET EVENT", "Memecoin Mania!", "Meme assets +30-70%!");
            }
        },
        {
            name: "💎 DIAMOND HANDS REWARD",
            description: "Market rewards long-term holders!",
            effect: () => {
                for (let symbol in assets) {
                    if (portfolio[symbol].amount > 0) {
                        const heldDays = day - portfolio[symbol].purchaseDay;
                        if (heldDays > 7) {
                            const reward = Math.min(heldDays * 0.01, 0.3);
                            assets[symbol].price *= (1 + reward);
                        }
                    }
                }
                showEventPopup("💎 MARKET EVENT", "Diamond Hands!", "Long-term holdings rewarded!");
            }
        }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
}

// ====================
// TRADING FUNCTIONS (ENHANCED)
// ====================
function buy() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    
    if (!asset || !assets[asset]) {
        showError(`Invalid asset! Available: ${Object.keys(assets).slice(0, 5).join(', ')}...`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showError('Enter a valid amount!');
        return;
    }
    
    let price = assets[asset].price;
    let cost = price * amount;
    
    if (cost > cash) {
        showError(`Need $${cost.toFixed(2)} but have $${cash.toFixed(2)}!`);
        return;
    }
    
    // Execute trade
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
    
    // Update stats
    tradesToday++;
    totalTrades++;
    sessionStats.trades++;
    player.totalVolume += cost;
    
    // Add XP
    const xpGain = Math.floor(cost / 100);
    addXP(xpGain);
    
    // Show particles
    const inputRect = document.getElementById('amount').getBoundingClientRect();
    ParticleSystem.create('coin', inputRect.left, inputRect.top);
    
    // Play sound
    SoundSystem.play('buy');
    
    // Clear input
    document.getElementById('amount').value = '';
    
    checkAchievements();
    render();
}

function sell() {
    let asset = document.getElementById('asset').value.toUpperCase().trim();
    let amount = parseFloat(document.getElementById('amount').value);
    
    if (!asset || !assets[asset]) {
        showError(`Invalid asset! Available: ${Object.keys(assets).slice(0, 5).join(', ')}...`);
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showError('Enter a valid amount!');
        return;
    }
    
    if (portfolio[asset].amount < amount) {
        showError(`Only have ${portfolio[asset].amount.toFixed(4)} ${asset}!`);
        return;
    }
    
    let price = assets[asset].price;
    let revenue = price * amount;
    
    // Calculate profit/loss
    let costOfGoodsSold = (portfolio[asset].totalCost / portfolio[asset].amount) * amount;
    let profitLoss = revenue - costOfGoodsSold;
    
    // Update stats
    if (profitLoss > 0) {
        profitableTrades++;
        updateWinStreak(true);
        sessionStats.profit += profitLoss;
        player.totalProfit += profitLoss;
    } else {
        updateWinStreak(false);
    }
    
    // Execute trade
    cash += revenue;
    portfolio[asset].amount -= amount;
    portfolio[asset].totalCost -= costOfGoodsSold;
    
    if (portfolio[asset].amount === 0) {
        portfolio[asset].avgPrice = 0;
        portfolio[ymbol].purchaseDay = 0;
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
    
    // Update stats
    tradesToday++;
    totalTrades++;
    sessionStats.trades++;
    player.totalVolume += revenue;
    
    // Add XP based on profit
    if (profitLoss > 0) {
        const xpGain = Math.floor(profitLoss / 50);
        addXP(xpGain);
        
        // Show floating coins for big profits
        if (profitLoss > 1000) {
            showFloatingCoins(Math.min(Math.floor(profitLoss / 500), 100));
        }
    }
    
    // Show particles
    const inputRect = document.getElementById('amount').getBoundingClientRect();
    ParticleSystem.create('token', inputRect.left, inputRect.top);
    
    // Play sound
    SoundSystem.play('sell');
    
    // Clear input
    document.getElementById('amount').value = '';
    
    checkAchievements();
    render();
}

// ====================
// RENDER FUNCTIONS (ENHANCED)
// ====================
function render() {
    renderMarket();
    renderPortfolio();
    renderTransactionHistory();
    renderNewsTicker();
    renderChart();
    updatePlayerStats();
}

function renderMarket() {
    let marketGrid = document.getElementById('marketGrid');
    marketGrid.innerHTML = '';
    
    for (let symbol in assets) {
        let asset = assets[symbol];
        let changeClass = asset.change24h >= 0 ? 'positive' : 'negative';
        let changeIcon = asset.change24h >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        let changeText = `${asset.change24h >= 0 ? '+' : ''}${asset.change24h.toFixed(2)}%`;
        
        marketGrid.innerHTML += `
            <div class="asset-card" data-symbol="${symbol}" onclick="selectAsset('${symbol}')">
                <div class="asset-header">
                    <div class="asset-name">
                        <i class="${asset.icon}"></i> ${symbol}
                        <span style="font-size: 0.8rem; color: ${asset.type === 'crypto' ? '#f7931a' : '#2196F3'}">
                            ${asset.type === 'crypto' ? 'CRYPTO' : 'STOCK'}
                        </span>
                    </div>
                    <div class="asset-price">$${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>
                <div class="asset-change ${changeClass}">
                    <i class="${changeIcon}"></i> ${changeText}
                </div>
                <div style="margin-top: 10px; font-size: 0.9rem; color: #aaa;">
                    Vol: $${(asset.volume24h / 1000000).toFixed(0)}M
                </div>
            </div>
        `;
    }
}

function renderPortfolio() {
    let portfolioGrid = document.getElementById('portfolioGrid');
    portfolioGrid.innerHTML = '';
    
    let totalValue = cash;
    let holdings = [];
    
    for (let symbol in portfolio) {
        if (portfolio[symbol].amount > 0) {
            let asset = assets[symbol];
            let holdingValue = portfolio[symbol].amount * asset.price;
            totalValue += holdingValue;
            
            holdings.push({
                symbol,
                value: holdingValue,
                amount: portfolio[symbol].amount,
                profit: holdingValue - portfolio[symbol].totalCost
            });
        }
    }
    
    // Sort by value
    holdings.sort((a, b) => b.value - a.value);
    
    // Display top 6 holdings
    holdings.slice(0, 6).forEach(holding => {
        let asset = assets[holding.symbol];
        let profitPercent = ((holding.value - portfolio[holding.symbol].totalCost) / portfolio[holding.symbol].totalCost * 100) || 0;
        let profitClass = profitPercent >= 0 ? 'positive' : 'negative';
        
        portfolioGrid.innerHTML += `
            <div class="portfolio-item">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 1.2rem;">
                        <i class="${asset.icon}"></i> ${holding.symbol}
                    </div>
                    <div style="font-size: 1.3rem; font-weight: bold;">
                        $${holding.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                </div>
                <div style="color: #aaa; font-size: 0.9rem;">
                    Amount: ${holding.amount.toFixed(4)}
                    <br>P&L: <span class="${profitClass}">${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%</span>
                </div>
            </div>
        `;
    });
    
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    player.highestPortfolioValue = Math.max(player.highestPortfolioValue, totalValue);
}

function renderChart() {
    const canvas = document.getElementById('priceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous chart
    if (chart) {
        chart.destroy();
    }
    
    const selectedHistory = priceHistory[selectedAsset] || [];
    if (selectedHistory.length === 0) return;
    
    const labels = selectedHistory.map(item => `Day ${item.day}`);
    const prices = selectedHistory.map(item => item.price);
    const asset = assets[selectedAsset];
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `${asset.color}40`);
    gradient.addColorStop(1, `${asset.color}10`);
    
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
                pointRadius: 2,
                pointBackgroundColor: asset.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 1
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
                            size: 14,
                            family: 'Orbitron'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 40, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: asset.color,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => `${selectedAsset}: $${context.parsed.y.toLocaleString()}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#aaa' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { 
                        color: '#aaa',
                        callback: (value) => `$${value.toLocaleString()}`
                    }
                }
            }
        }
    });
}

// ====================
// UTILITY FUNCTIONS
// ====================
function selectAsset(symbol) {
    selectedAsset = symbol;
    document.getElementById('asset').value = symbol;
    renderChart();
}

function nextDay() {
    updateMarket();
}

function showEventPopup(title, description, reward) {
    document.getElementById('eventTitle').textContent = title;
    document.getElementById('eventDescription').textContent = description;
    document.getElementById('eventReward').textContent = reward;
    document.getElementById('gameEventPopup').style.display = 'block';
    
    SoundSystem.play('achievement');
    
    // Launch confetti for major events
    if (title.includes('ACHIEVEMENT') || title.includes('LEVEL')) {
        launchConfetti();
    }
}

function closeEventPopup() {
    document.getElementById('gameEventPopup').style.display = 'none';
}

function showError(message) {
    showEventPopup('⚠️ ERROR', message, 'Try again!');
    SoundSystem.play('error');
}

function addXP(amount) {
    const oldLevel = player.level;
    player.xp += amount;
    
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * CONFIG.LEVEL_MULTIPLIER);
        
        // Level up reward
        const tokenReward = player.level * 100;
        player.tokens += tokenReward;
        
        // Show celebration
        showLevelUpAnimation();
        showEventPopup(
            '🌟 LEVEL UP! 🌟',
            `You've reached Level ${player.level}!`,
            `Reward: ${tokenReward} Tokens`
        );
    }
    
    // Show XP particles
    if (amount > 0) {
        ParticleSystem.create('xp', window.innerWidth / 2, window.innerHeight / 2);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.querySelector('#soundToggle i');
    icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    
    if (soundEnabled) {
        SoundSystem.play('bonus');
    }
}

function saveGame() {
    const gameData = {
        cash, day, totalTrades, profitableTrades, portfolio, player, transactions,
        priceHistory, selectedAsset, sessionStats
    };
    localStorage.setItem('cryptoGameSave', JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem('cryptoGameSave');
    if (saved) {
        const gameData = JSON.parse(saved);
        Object.assign(this, gameData);
        return true;
    }
    return false;
}

// ====================
// GAME START
// ====================
window.onload = function() {
    if (!loadGame()) {
        initializeGame();
    }
    
    setTimeout(() => {
        render();
        renderChart();
        
        // Welcome message
        showEventPopup(
            '🎮 WELCOME TO CRYPTO TRADING GAME! 🎮',
            'Trade assets, complete challenges, and become a trading legend!',
            'Start with $10,000 and 100 Tokens!'
        );
    }, 1000);
};

// Switch tabs
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
}
