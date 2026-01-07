// ====================
// CASINO SYSTEM
// ====================

let casino = {
    unlocked: false,
    balance: 0,
    totalWins: 0,
    totalLosses: 0,
    currentGame: null,
    minBet: 10,
    maxBet: 10000
};

// Casino Upgrade - Add to your existing upgrades array:
const casinoUpgrade = {
    id: 'casino_access',
    name: 'VIP Casino Access',
    description: 'Unlock the exclusive casino with roulette, blackjack, and poker',
    icon: 'fas fa-dice',
    cost: 100000,
    effect: () => unlockCasino()
};

// Add this upgrade to your existing upgrades array
upgrades.push(casinoUpgrade);

// ====================
// CASINO UNLOCK
// ====================
function unlockCasino() {
    casino.unlocked = true;
    casino.balance = 0; // Start with $0 in casino
    
    // Show casino tab
    document.getElementById('casinoTabBtn').style.display = 'flex';
    
    // Update casino status
    document.getElementById('casinoStatus').style.display = 'block';
    updateCasinoStats();
    
    // Show success message
    showEventPopup(
        '🎰 VIP CASINO UNLOCKED! 🎰',
        'Congratulations! You now have access to the exclusive casino!',
        'Transfer money from your portfolio to start playing'
    );
}

function transferToCasino() {
    const amount = parseInt(prompt("How much do you want to transfer to the casino?"));
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }
    
    if (amount > cash) {
        alert(`Insufficient funds! You have $${cash} but trying to transfer $${amount}`);
        return;
    }
    
    if (!casino.unlocked) {
        alert("You need to unlock the casino first!");
        return;
    }
    
    cash -= amount;
    casino.balance += amount;
    
    updateCasinoStats();
    render();
    
    showEventPopup(
        '💰 Transfer Complete',
        `Transferred $${amount} to your casino balance`,
        `Casino Balance: $${casino.balance}`
    );
}

function withdrawFromCasino() {
    if (casino.balance <= 0) {
        alert("No money to withdraw from casino!");
        return;
    }
    
    const confirmWithdraw = confirm(`Withdraw $${casino.balance} from casino?`);
    if (confirmWithdraw) {
        cash += casino.balance;
        casino.balance = 0;
        
        updateCasinoStats();
        render();
        
        showEventPopup(
            '💰 Withdrawal Complete',
            `Withdrew all money from casino back to portfolio`,
            `Portfolio Cash: $${cash}`
        );
    }
}

function updateCasinoStats() {
    document.getElementById('casinoBalance').textContent = casino.balance.toLocaleString();
    document.getElementById('casinoWins').textContent = casino.totalWins.toLocaleString();
    document.getElementById('casinoLosses').textContent = casino.totalLosses.toLocaleString();
    document.getElementById('casinoNet').textContent = (casino.totalWins - casino.totalLosses).toLocaleString();
}

// ====================
// GAME SELECTION
// ====================
function selectGame(game) {
    if (!casino.unlocked) {
        alert("You need to unlock the casino first!");
        return;
    }
    
    if (casino.balance < 100) {
        alert("You need at least $100 in your casino balance to play!");
        return;
    }
    
    casino.currentGame = game;
    
    // Hide all games
    document.getElementById('gameSelector').style.display = 'none';
    document.getElementById('rouletteGame').style.display = 'none';
    document.getElementById('blackjackGame').style.display = 'none';
    document.getElementById('pokerGame').style.display = 'none';
    
    // Show selected game
    switch(game) {
        case 'roulette':
            document.getElementById('rouletteGame').style.display = 'block';
            initializeRoulette();
            break;
        case 'blackjack':
            document.getElementById('blackjackGame').style.display = 'block';
            initializeBlackjack();
            break;
        case 'poker':
            document.getElementById('pokerGame').style.display = 'block';
            initializePoker();
            break;
    }
}

function backToGameSelection() {
    casino.currentGame = null;
    document.getElementById('gameSelector').style.display = 'grid';
    document.getElementById('rouletteGame').style.display = 'none';
    document.getElementById('blackjackGame').style.display = 'none';
    document.getElementById('pokerGame').style.display = 'none';
}

// ====================
// ROULETTE GAME
// ====================
let rouletteState = {
    bets: [],
    wheelSpinning: false,
    result: null
};

function initializeRoulette() {
    const wheel = document.getElementById('rouletteWheel');
    wheel.innerHTML = '';
    
    // Create roulette numbers (0-36)
    const numbers = [
        {number: 0, color: 'green'},
        {number: 32, color: 'red'}, {number: 15, color: 'black'}, {number: 19, color: 'red'},
        {number: 4, color: 'black'}, {number: 21, color: 'red'}, {number: 2, color: 'black'},
        {number: 25, color: 'red'}, {number: 17, color: 'black'}, {number: 34, color: 'red'},
        {number: 6, color: 'black'}, {number: 27, color: 'red'}, {number: 13, color: 'black'},
        {number: 36, color: 'red'}, {number: 11, color: 'black'}, {number: 30, color: 'red'},
        {number: 8, color: 'black'}, {number: 23, color: 'red'}, {number: 10, color: 'black'},
        {number: 5, color: 'red'}, {number: 24, color: 'black'}, {number: 16, color: 'red'},
        {number: 33, color: 'black'}, {number: 1, color: 'red'}, {number: 20, color: 'black'},
        {number: 14, color: 'red'}, {number: 31, color: 'black'}, {number: 9, color: 'red'},
        {number: 22, color: 'black'}, {number: 18, color: 'red'}, {number: 29, color: 'black'},
        {number: 7, color: 'red'}, {number: 28, color: 'black'}, {number: 12, color: 'red'},
        {number: 35, color: 'black'}, {number: 3, color: 'red'}, {number: 26, color: 'black'}
    ];
    
    // Position numbers around the wheel
    numbers.forEach((num, index) => {
        const angle = (index / numbers.length) * 360;
        const element = document.createElement('div');
        element.className = `roulette-number ${num.color}`;
        element.textContent = num.number;
        element.style.transform = `rotate(${angle}deg) translate(125px) rotate(-${angle}deg)`;
        wheel.appendChild(element);
    });
    
    // Create betting grid
    const grid = document.getElementById('rouletteGrid');
    grid.innerHTML = '';
    
    // Add betting cells
    for (let i = 0; i <= 36; i++) {
        const cell = document.createElement('div');
        cell.className = 'bet-cell';
        cell.textContent = i;
        cell.onclick = () => selectRouletteBet(i);
        grid.appendChild(cell);
    }
    
    // Add special bets
    const specialBets = [
        {label: '1-12', type: 'dozen', value: 1},
        {label: '13-24', type: 'dozen', value: 2},
        {label: '25-36', type: 'dozen', value: 3},
        {label: 'Red', type: 'color', value: 'red'},
        {label: 'Black', type: 'color', value: 'black'},
        {label: 'Even', type: 'even'},
        {label: 'Odd', type: 'odd'},
        {label: '1-18', type: 'low'},
        {label: '19-36', type: 'high'}
    ];
    
    specialBets.forEach(bet => {
        const cell = document.createElement('div');
        cell.className = 'bet-cell';
        cell.textContent = bet.label;
        cell.onclick = () => selectRouletteBet(bet.type, bet.value);
        grid.appendChild(cell);
    });
    
    rouletteState.bets = [];
    document.getElementById('rouletteResult').innerHTML = '';
}

function selectRouletteBet(type, value = null) {
    if (rouletteState.wheelSpinning) {
        alert("Wait for the wheel to stop spinning!");
        return;
    }
    
    const betAmount = parseInt(document.getElementById('rouletteBet').value);
    if (isNaN(betAmount) || betAmount < casino.minBet || betAmount > casino.maxBet) {
        alert(`Bet must be between $${casino.minBet} and $${casino.maxBet}`);
        return;
    }
    
    if (betAmount > casino.balance) {
        alert(`Insufficient casino balance! You have $${casino.balance}`);
        return;
    }
    
    // Add bet
    rouletteState.bets.push({type, value, amount: betAmount});
    
    // Highlight selected bet
    event.target.classList.add('selected');
    
    // Update UI
    document.getElementById('rouletteResult').innerHTML = 
        `Bet placed: $${betAmount} on ${typeof value === 'number' ? 'Number ' + value : type}<br>Total bets: $${rouletteState.bets.reduce((sum, bet) => sum + bet.amount, 0)}`;
}

function setRouletteBet(amount) {
    document.getElementById('rouletteBet').value = amount;
}

function clearRouletteBets() {
    rouletteState.bets = [];
    document.querySelectorAll('.bet-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    document.getElementById('rouletteResult').innerHTML = '';
}

function placeRouletteBet() {
    if (rouletteState.bets.length === 0) {
        alert("Place some bets first!");
        return;
    }
    
    const totalBet = rouletteState.bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    if (totalBet > casino.balance) {
        alert(`Insufficient casino balance! You have $${casino.balance}`);
        return;
    }
    
    casino.balance -= totalBet;
    updateCasinoStats();
    
    showEventPopup(
        '🎯 Bets Placed',
        `Total bet: $${totalBet}`,
        'Click "Spin Wheel" to play!'
    );
}

function spinRoulette() {
    if (rouletteState.bets.length === 0) {
        alert("Place some bets first!");
        return;
    }
    
    if (rouletteState.wheelSpinning) {
        return;
    }
    
    rouletteState.wheelSpinning = true;
    
    // Spin animation
    const wheel = document.getElementById('rouletteWheel');
    const spins = 5 + Math.random() * 3; // 5-8 spins
    const rotation = spins * 360 + Math.floor(Math.random() * 360);
    
    wheel.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
    wheel.style.transform = `rotate(${rotation}deg)`;
    
    // Determine result after spin
    setTimeout(() => {
        const winningNumber = Math.floor(Math.random() * 37); // 0-36
        const winningColor = winningNumber === 0 ? 'green' : 
                           [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(winningNumber) ? 'red' : 'black';
        
        rouletteState.result = {
            number: winningNumber,
            color: winningColor,
            even: winningNumber % 2 === 0 && winningNumber !== 0,
            dozen: winningNumber === 0 ? 0 : Math.ceil(winningNumber / 12)
        };
        
        // Calculate winnings
        let totalWinnings = 0;
        let winDetails = [];
        
        rouletteState.bets.forEach(bet => {
            let wins = false;
            let multiplier = 0;
            
            if (typeof bet.value === 'number') {
                // Number bet
                if (bet.value === winningNumber) {
                    wins = true;
                    multiplier = 35;
                }
            } else if (bet.type === 'color') {
                // Color bet
                if (bet.value === winningColor) {
                    wins = true;
                    multiplier = 1;
                }
            } else if (bet.type === 'dozen') {
                // Dozen bet
                if (bet.value === rouletteState.result.dozen) {
                    wins = true;
                    multiplier = 2;
                }
            } else if (bet.type === 'even' && winningNumber !== 0) {
                // Even bet
                if (rouletteState.result.even) {
                    wins = true;
                    multiplier = 1;
                }
            } else if (bet.type === 'odd' && winningNumber !== 0) {
                // Odd bet
                if (!rouletteState.result.even) {
                    wins = true;
                    multiplier = 1;
                }
            } else if (bet.type === 'low') {
                // Low bet (1-18)
                if (winningNumber >= 1 && winningNumber <= 18) {
                    wins = true;
                    multiplier = 1;
                }
            } else if (bet.type === 'high') {
                // High bet (19-36)
                if (winningNumber >= 19 && winningNumber <= 36) {
                    wins = true;
                    multiplier = 1;
                }
            }
            
            if (wins) {
                const winAmount = bet.amount * multiplier;
                totalWinnings += winAmount;
                winDetails.push(`$${bet.amount} → $${winAmount} (${multiplier}x)`);
            }
        });
        
        // Update casino balance
        casino.balance += totalWinnings;
        if (totalWinnings > 0) {
            casino.totalWins += totalWinnings;
            showWinAnimation();
        } else {
            casino.totalLosses += rouletteState.bets.reduce((sum, bet) => sum + bet.amount, 0);
        }
        
        // Show result
        const resultDiv = document.getElementById('rouletteResult');
        resultDiv.innerHTML = `
            <h3 style="color: ${winningColor === 'red' ? '#D32F2F' : winningColor === 'black' ? '#212121' : '#388E3C'}">
                Winning Number: ${winningNumber} ${winningColor.toUpperCase()}
            </h3>
            ${totalWinnings > 0 ? 
                `<div style="color: #4CAF50; font-size: 1.5rem;">You won $${totalWinnings}!</div>` :
                `<div style="color: #F44336;">You lost $${rouletteState.bets.reduce((sum, bet) => sum + bet.amount, 0)}</div>`
            }
            ${winDetails.length > 0 ? `<div>${winDetails.join('<br>')}</div>` : ''}
        `;
        
        updateCasinoStats();
        rouletteState.wheelSpinning = false;
        rouletteState.bets = [];
        
    }, 3000);
}

// ====================
// BLACKJACK GAME
// ====================
let blackjackState = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    gameActive: false,
    currentBet: 0
};

function initializeBlackjack() {
    blackjackState = {
        deck: [],
        playerHand: [],
        dealerHand: [],
        playerScore: 0,
        dealerScore: 0,
        gameActive: false,
        currentBet: 0
    };
    
    // Reset UI
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerTotal').textContent = '0';
    document.getElementById('playerTotal').textContent = '0';
    document.getElementById('blackjackResult').innerHTML = '';
    
    // Disable game buttons initially
    document.querySelectorAll('#blackjackButtons button:not(:first-child)').forEach(btn => {
        btn.disabled = true;
    });
    document.querySelector('#blackjackButtons button:first-child').disabled = false;
}

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({value, suit, color: suit === '♥' || suit === '♦' ? 'red' : 'black'});
        });
    });
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11; // Will handle Ace as 1 later if needed
    return parseInt(card.value);
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    hand.forEach(card => {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else {
            score += getCardValue(card);
        }
    });
    
    // Handle aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function dealCard(hand, isDealer = false, faceDown = false) {
    if (blackjackState.deck.length === 0) {
        blackjackState.deck = createDeck();
    }
    
    const card = blackjackState.deck.pop();
    hand.push(card);
    
    // Update UI
    const cardArea = isDealer ? document.getElementById('dealerCards') : document.getElementById('playerCards');
    const cardElement = document.createElement('div');
    
    if (faceDown) {
        cardElement.className = 'card card-back';
        cardElement.textContent = '?';
    } else {
        cardElement.className = `card ${card.color}`;
        cardElement.textContent = `${card.value}${card.suit}`;
    }
    
    cardArea.appendChild(cardElement);
    
    return card;
}

function updateScores() {
    blackjackState.playerScore = calculateScore(blackjackState.playerHand);
    blackjackState.dealerScore = calculateScore(blackjackState.dealerHand.filter(card => card.faceDown !== true));
    
    document.getElementById('playerTotal').textContent = blackjackState.playerScore;
    document.getElementById('dealerTotal').textContent = blackjackState.dealerScore;
}

function setBlackjackBet(amount) {
    document.getElementById('blackjackBet').value = amount;
}

function startBlackjack() {
    const betAmount = parseInt(document.getElementById('blackjackBet').value);
    
    if (isNaN(betAmount) || betAmount < casino.minBet || betAmount > casino.maxBet) {
        alert(`Bet must be between $${casino.minBet} and $${casino.maxBet}`);
        return;
    }
    
    if (betAmount > casino.balance) {
        alert(`Insufficient casino balance! You have $${casino.balance}`);
        return;
    }
    
    // Place bet
    casino.balance -= betAmount;
    blackjackState.currentBet = betAmount;
    blackjackState.gameActive = true;
    
    // Initialize deck and hands
    blackjackState.deck = createDeck();
    blackjackState.playerHand = [];
    blackjackState.dealerHand = [];
    
    // Clear card areas
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('blackjackResult').innerHTML = '';
    
    // Deal initial cards
    dealCard(blackjackState.playerHand, false);
    dealCard(blackjackState.dealerHand, true, true); // Face down
    dealCard(blackjackState.playerHand, false);
    dealCard(blackjackState.dealerHand, true);
    
    // Update scores
    updateScores();
    
    // Enable/disable buttons
    document.querySelectorAll('#blackjackButtons button').forEach(btn => {
        if (btn.textContent.includes('Start')) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> New Game';
            btn.onclick = () => initializeBlackjack();
        } else {
            btn.disabled = false;
        }
    });
    
    // Check for blackjack
    if (blackjackState.playerScore === 21) {
        endBlackjack('blackjack');
    }
    
    updateCasinoStats();
}

function blackjackHit() {
    if (!blackjackState.gameActive) return;
    
    dealCard(blackjackState.playerHand, false);
    updateScores();
    
    if (blackjackState.playerScore > 21) {
        endBlackjack('bust');
    }
}

function blackjackStand() {
    if (!blackjackState.gameActive) return;
    
    // Reveal dealer's face down card
    const dealerCards = document.getElementById('dealerCards');
    if (dealerCards.children.length > 0 && dealerCards.children[0].classList.contains('card-back')) {
        dealerCards.children[0].className = `card ${blackjackState.dealerHand[0].color}`;
        dealerCards.children[0].textContent = `${blackjackState.dealerHand[0].value}${blackjackState.dealerHand[0].suit}`;
    }
    
    // Dealer draws until 17 or higher
    while (blackjackState.dealerScore < 17) {
        dealCard(blackjackState.dealerHand, true);
        updateScores();
    }
    
    // Determine winner
    if (blackjackState.dealerScore > 21) {
        endBlackjack('dealer_bust');
    } else if (blackjackState.playerScore > blackjackState.dealerScore) {
        endBlackjack('win');
    } else if (blackjackState.playerScore < blackjackState.dealerScore) {
        endBlackjack('lose');
    } else {
        endBlackjack('push');
    }
}

function blackjackDouble() {
    if (!blackjackState.gameActive) return;
    
    const additionalBet = blackjackState.currentBet;
    
    if (additionalBet > casino.balance) {
        alert("Not enough money to double!");
        return;
    }
    
    casino.balance -= additionalBet;
    blackjackState.currentBet *= 2;
    
    // Take one more card
    dealCard(blackjackState.playerHand, false);
    updateScores();
    
    // Then stand automatically
    setTimeout(blackjackStand, 500);
}

function endBlackjack(result) {
    blackjackState.gameActive = false;
    
    let winnings = 0;
    let message = '';
    let color = '';
    
    switch(result) {
        case 'blackjack':
            winnings = blackjackState.currentBet * 2.5; // 3:2 payout
            message = `BLACKJACK! You win $${winnings}!`;
            color = '#4CAF50';
            casino.totalWins += winnings;
            showWinAnimation();
            break;
        case 'win':
            winnings = blackjackState.currentBet * 2;
            message = `You win $${winnings}!`;
            color = '#4CAF50';
            casino.totalWins += winnings;
            showWinAnimation();
            break;
        case 'dealer_bust':
            winnings = blackjackState.currentBet * 2;
            message = `Dealer busts! You win $${winnings}!`;
            color = '#4CAF50';
            casino.totalWins += winnings;
            showWinAnimation();
            break;
        case 'lose':
            message = `You lose $${blackjackState.currentBet}`;
            color = '#F44336';
            casino.totalLosses += blackjackState.currentBet;
            break;
        case 'bust':
            message = `Bust! You lose $${blackjackState.currentBet}`;
            color = '#F44336';
            casino.totalLosses += blackjackState.currentBet;
            break;
        case 'push':
            winnings = blackjackState.currentBet;
            message = `Push! You get your $${winnings} back`;
            color = '#FF9800';
            break;
    }
    
    casino.balance += winnings;
    
    document.getElementById('blackjackResult').innerHTML = `
        <div style="color: ${color}; font-size: 1.5rem; font-weight: bold;">
            ${message}
        </div>
        <div>Your score: ${blackjackState.playerScore} | Dealer score: ${blackjackState.dealerScore}</div>
    `;
    
    // Disable game buttons
    document.querySelectorAll('#blackjackButtons button:not(:first-child)').forEach(btn => {
        btn.disabled = true;
    });
    
    updateCasinoStats();
}

// ====================
// POKER GAME (Texas Hold'em)
// ====================
let pokerState = {
    deck: [],
    playerHand: [],
    aiHand: [],
    communityCards: [],
    pot: 0,
    playerBet: 0,
    aiBet: 0,
    gamePhase: 'preflop', // preflop, flop, turn, river, showdown
    gameActive: false,
    minBet: 50,
    maxBet: 10000
};

function initializePoker() {
    pokerState = {
        deck: [],
        playerHand: [],
        aiHand: [],
        communityCards: [],
        pot: 0,
        playerBet: 0,
        aiBet: 0,
        gamePhase: 'preflop',
        gameActive: false,
        minBet: 50,
        maxBet: 10000
    };
    
    // Reset UI
    document.getElementById('communityCards').innerHTML = '';
    document.getElementById('playerHand').innerHTML = '';
    document.getElementById('dealerHand').innerHTML = '';
    document.getElementById('playerBet').textContent = '0';
    document.getElementById('aiBet').textContent = '0';
    document.getElementById('pokerResult').innerHTML = '';
    
    // Disable game buttons initially
    document.querySelectorAll('#pokerButtons button:not(:first-child)').forEach(btn => {
        btn.disabled = true;
    });
    document.querySelector('#pokerButtons button:first-child').disabled = false;
}

function createPokerDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({value, suit, color: suit === '♥' || suit === '♦' ? 'red' : 'black'});
        });
    });
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

function dealPokerCard(faceDown = false) {
    if (pokerState.deck.length === 0) {
        pokerState.deck = createPokerDeck();
    }
    
    const card = pokerState.deck.pop();
    
    // Create card element
    const cardElement = document.createElement('div');
    if (faceDown) {
        cardElement.className = 'card card-back';
        cardElement.textContent = '?';
    } else {
        cardElement.className = `card ${card.color}`;
        cardElement.textContent = `${card.value}${card.suit}`;
    }
    
    return {card, element: cardElement};
}

function startPoker() {
    const minBet = pokerState.minBet * 2; // Big blind + small blind
    
    if (casino.balance < minBet) {
        alert(`You need at least $${minBet} to play (blinds are $${pokerState.minBet}/$${pokerState.minBet * 2})`);
        return;
    }
    
    // Post blinds
    casino.balance -= minBet;
    pokerState.playerBet = minBet;
    pokerState.pot = minBet;
    pokerState.gameActive = true;
    
    // Initialize deck
    pokerState.deck = createPokerDeck();
    pokerState.playerHand = [];
    pokerState.aiHand = [];
    pokerState.communityCards = [];
    
    // Clear UI
    document.getElementById('communityCards').innerHTML = '';
    document.getElementById('playerHand').innerHTML = '';
    document.getElementById('dealerHand').innerHTML = '';
    document.getElementById('pokerResult').innerHTML = '';
    
    // Deal hands
    const playerHandArea = document.getElementById('playerHand');
    const aiHandArea = document.getElementById('dealerHand');
    
    for (let i = 0; i < 2; i++) {
        // Player cards (face up)
        const playerCard = dealPokerCard(false);
        pokerState.playerHand.push(playerCard.card);
        playerHandArea.appendChild(playerCard.element);
        
        // AI cards (face down)
        const aiCard = dealPokerCard(true);
        pokerState.aiHand.push(aiCard.card);
        aiHandArea.appendChild(aiCard.element);
    }
    
    // Update UI
    document.getElementById('playerBet').textContent = pokerState.playerBet;
    document.getElementById('aiBet').textContent = '0';
    
    // Enable game buttons
    document.querySelectorAll('#pokerButtons button').forEach(btn => {
        btn.disabled = false;
    });
    
    updateCasinoStats();
}

function addPokerChip(amount) {
    if (!pokerState.gameActive) return;
    
    const currentBet = parseInt(document.getElementById('playerBet').textContent);
    const newBet = currentBet + amount;
    
    if (newBet > casino.balance) {
        alert("Not enough money!");
        return;
    }
    
    pokerState.playerBet = newBet;
    document.getElementById('playerBet').textContent = newBet;
}

function pokerCall() {
    if (!pokerState.gameActive) return;
    
    const callAmount = pokerState.aiBet - pokerState.playerBet;
    
    if (callAmount > 0) {
        if (callAmount > casino.balance) {
            alert("Not enough money to call!");
            return;
        }
        
        casino.balance -= callAmount;
        pokerState.playerBet += callAmount;
        pokerState.pot += callAmount;
    }
    
    advancePokerGame();
}

function pokerRaise() {
    if (!pokerState.gameActive) return;
    
    const raiseAmount = pokerState.playerBet;
    
    if (raiseAmount > casino.balance) {
        alert("Not enough money to raise!");
        return;
    }
    
    casino.balance -= raiseAmount;
    pokerState.pot += raiseAmount;
    
    // AI decision
    const aiDecision = Math.random();
    if (aiDecision > 0.3) { // 70% chance AI calls
        pokerState.aiBet = pokerState.playerBet;
        pokerState.pot += raiseAmount;
    } else { // 30% chance AI folds
        endPokerGame('ai_fold');
        return;
    }
    
    document.getElementById('aiBet').textContent = pokerState.aiBet;
    advancePokerGame();
}

function pokerFold() {
    if (!pokerState.gameActive) return;
    
    endPokerGame('player_fold');
}

function advancePokerGame() {
    switch(pokerState.gamePhase) {
        case 'preflop':
            // Deal flop (3 community cards)
            pokerState.gamePhase = 'flop';
            dealCommunityCards(3);
            break;
        case 'flop':
            // Deal turn (1 community card)
            pokerState.gamePhase = 'turn';
            dealCommunityCards(1);
            break;
        case 'turn':
            // Deal river (1 community card)
            pokerState.gamePhase = 'river';
            dealCommunityCards(1);
            break;
        case 'river':
            // Showdown
            pokerState.gamePhase = 'showdown';
            showdown();
            break;
    }
    
    // AI makes a bet
    if (pokerState.gamePhase !== 'showdown') {
        makeAIBet();
    }
}

function dealCommunityCards(count) {
    const communityArea = document.getElementById('communityCards');
    
    for (let i = 0; i < count; i++) {
        const card = dealPokerCard(false);
        pokerState.communityCards.push(card.card);
        communityArea.appendChild(card.element);
    }
}

function makeAIBet() {
    const aiDecision = Math.random();
    const betAmount = Math.floor(Math.random() * 500) + 100; // $100-$600
    
    if (aiDecision > 0.6 && betAmount <= casino.balance * 0.1) { // 40% chance to bet
        pokerState.aiBet = betAmount;
        pokerState.pot += betAmount;
        document.getElementById('aiBet').textContent = betAmount;
    }
}

function showdown() {
    // Reveal AI cards
    const aiCards = document.querySelectorAll('#dealerHand .card-back');
    aiCards.forEach((card, index) => {
        const aiCard = pokerState.aiHand[index];
        card.className = `card ${aiCard.color}`;
        card.textContent = `${aiCard.value}${aiCard.suit}`;
    });
    
    // Evaluate hands
    const playerScore = evaluatePokerHand([...pokerState.playerHand, ...pokerState.communityCards]);
    const aiScore = evaluatePokerHand([...pokerState.aiHand, ...pokerState.communityCards]);
    
    // Determine winner
    if (playerScore > aiScore) {
        endPokerGame('win');
    } else if (playerScore < aiScore) {
        endPokerGame('lose');
    } else {
        endPokerGame('split');
    }
}

function evaluatePokerHand(cards) {
    // Simplified hand evaluation (returns a numeric score)
    // In a real game, you'd use proper poker hand ranking
    let score = 0;
    
    // Count pairs, three of a kind, etc.
    const valueCounts = {};
    cards.forEach(card => {
        valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    });
    
    // Check for pairs, three of a kind, four of a kind
    Object.values(valueCounts).forEach(count => {
        if (count === 2) score += 10; // Pair
        if (count === 3) score += 30; // Three of a kind
        if (count === 4) score += 80; // Four of a kind
    });
    
    // Add random element for simulation
    score += Math.floor(Math.random() * 20);
    
    return score;
}

function endPokerGame(result) {
    pokerState.gameActive = false;
    
    let winnings = 0;
    let message = '';
    let color = '';
    
    switch(result) {
        case 'win':
            winnings = pokerState.pot;
            message = `You win $${winnings}!`;
            color = '#4CAF50';
            casino.totalWins += winnings;
            showWinAnimation();
            break;
        case 'lose':
            message = `You lose! Pot: $${pokerState.pot}`;
            color = '#F44336';
            casino.totalLosses += pokerState.playerBet;
            break;
        case 'player_fold':
            winnings = pokerState.pot - pokerState.playerBet;
            message = `You fold. Lost $${pokerState.playerBet}`;
            color = '#F44336';
            casino.totalLosses += pokerState.playerBet;
            break;
        case 'ai_fold':
            winnings = pokerState.pot;
            message = `AI folds! You win $${winnings}!`;
            color = '#4CAF50';
            casino.totalWins += winnings;
            showWinAnimation();
            break;
        case 'split':
            winnings = pokerState.pot / 2;
            message = `Split pot! You get $${winnings}`;
            color = '#FF9800';
            break;
    }
    
    casino.balance += winnings;
    
    document.getElementById('pokerResult').innerHTML = `
        <div style="color: ${color}; font-size: 1.5rem; font-weight: bold;">
            ${message}
        </div>
        <div>Pot: $${pokerState.pot}</div>
    `;
    
    // Disable game buttons
    document.querySelectorAll('#pokerButtons button:not(:first-child)').forEach(btn => {
        btn.disabled = true;
    });
    
    updateCasinoStats();
}

// ====================
// WIN ANIMATION
// ====================
function showWinAnimation() {
    const animation = document.getElementById('winAnimation');
    animation.style.display = 'block';
    
    // Random emoji
    const emojis = ['🎉', '💰', '🎰', '🤑', '💎', '👑', '⭐', '🏆'];
    animation.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    setTimeout(() => {
        animation.style.display = 'none';
    }, 2000);
}

// ====================
// INITIALIZATION UPDATE
// ====================
// Update your existing init function to include casino initialization
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
    
    // Add Transfer to Casino button to header
    const headerContainer = document.querySelector('.header-container');
    const transferButton = document.createElement('button');
    transferButton.innerHTML = '<i class="fas fa-exchange-alt"></i> Transfer to Casino';
    transferButton.style.cssText = `
        background: linear-gradient(135deg, #9C27B0, #673AB7);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        margin-left: 10px;
    `;
    transferButton.onclick = transferToCasino;
    document.querySelector('.player-stats').appendChild(transferButton);
    
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
