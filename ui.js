// ============================================
// UI MANAGEMENT FUNCTIONS
// ============================================

// DOM Elements (will be initialized in main.js)
let startScreen, winScreen, gameInterface, gameBoard, boardPath, playersContainer, diceResult, 
    questionPanel, questionText, questionIcon, questionType, optionsContainer, 
    feedback, rollBtn, newGameBtn, startGameBtn, playAgainBtn, winnerMessage, 
    nutritionMessage, statsContainer, turnMessage, tileCountDisplay,
    advancedSettingsToggle, advancedSettingsContent, addTileBtn, removeTileBtn,
    loadingScreen, playerCountDisplay, playerInputsContainer;

// ============================================
// LOADING SCREEN FUNCTIONS
// ============================================

function showLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
}

function hideLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '1';
            
            // Show the start screen after loading
            if (startScreen) {
                startScreen.style.display = 'flex';
                setTimeout(() => {
                    startScreen.style.opacity = '1';
                }, 10);
            }
        }, 500);
    }
}

function updateLoadingMessage(message) {
    const loadingMessageElement = document.getElementById('loadingMessage');
    if (loadingMessageElement) {
        loadingMessageElement.textContent = message;
    }
}

// ============================================
// DYNAMIC PLAYER & BOARD CONFIGURATION
// ============================================

function initializeConfiguration() {
    updatePlayerCountDisplay();
    renderPlayerInputs();
    updateTileCountDisplay();
    updateConfigurationButtons();
}

function addPlayer() {
    if (currentPlayerCount < MAX_PLAYERS) {
        currentPlayerCount++;
        updatePlayerCountDisplay();
        renderPlayerInputs();
        updateConfigurationButtons();
    }
}

function removePlayer() {
    if (currentPlayerCount > MIN_PLAYERS) {
        currentPlayerCount--;
        updatePlayerCountDisplay();
        renderPlayerInputs();
        updateConfigurationButtons();
    }
}

function updatePlayerCountDisplay() {
    if (playerCountDisplay) {
        playerCountDisplay.textContent = `${currentPlayerCount} Player${currentPlayerCount > 1 ? 's' : ''}`;
        playerCountDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            playerCountDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

function renderPlayerInputs() {
    if (!playerInputsContainer) return;
    
    playerInputsContainer.innerHTML = '';
    
    const defaultNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    
    for (let i = 0; i < currentPlayerCount; i++) {
        const playerNum = i + 1;
        const defaultColorIndex = i % PLAYER_COLORS.length;
        
        const playerInputHTML = `
            <div class="player-input-wrapper">
                <label class="player-input-label">Player ${playerNum}</label>
                <input type="text" 
                       class="player-input" 
                       id="player${playerNum}Input" 
                       placeholder="Enter name..." 
                       value="${defaultNames[i] || `Player ${playerNum}`}"
                       maxlength="12"
                       style="border-color: ${PLAYER_COLORS[defaultColorIndex].value};">
                
                <div class="color-picker">
                    ${PLAYER_COLORS.map((colorOption, index) => `
                        <div class="color-option ${index === defaultColorIndex ? 'selected' : ''}" 
                             data-player="${playerNum}" 
                             data-color-index="${index}"
                             style="background-color: ${colorOption.value};"
                             title="${colorOption.name}"></div>
                    `).join('')}
                </div>
            </div>
        `;
        
        playerInputsContainer.innerHTML += playerInputHTML;
    }
    
    // Add event listeners to color pickers
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const playerNum = parseInt(this.dataset.player);
            const colorIndex = parseInt(this.dataset.colorIndex);
            const color = PLAYER_COLORS[colorIndex];
            
            // Update input border color
            const input = document.getElementById(`player${playerNum}Input`);
            if (input) {
                input.style.borderColor = color.value;
                
                // Update selected state
                document.querySelectorAll(`.color-option[data-player="${playerNum}"]`).forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            }
        });
    });
}

function addTile() {
    if (currentTileCount < 67) {
        currentTileCount = Math.min(currentTileCount + 1, 67);
        updateTileCountDisplay();
        updateConfigurationButtons();
    }
}

function removeTile() {
    if (currentTileCount > 20) {
        currentTileCount = Math.max(currentTileCount - 1, 20);
        updateTileCountDisplay();
        updateConfigurationButtons();
    }
}

function setTileCount(count) {
    currentTileCount = Math.max(20, Math.min(count, 67));
    updateTileCountDisplay();
    updateConfigurationButtons();
    
    // Update preset button active states
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const tiles = parseInt(btn.dataset.tiles);
        btn.classList.toggle('active', tiles === currentTileCount);
    });
}

function updateTileCountDisplay() {
    if (tileCountDisplay) {
        tileCountDisplay.textContent = `${currentTileCount} Space${currentTileCount > 1 ? 's' : ''}`;
        tileCountDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            tileCountDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

function updateConfigurationButtons() {
    // Update player buttons
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    const removePlayerBtn = document.getElementById('removePlayerBtn');
    if (addPlayerBtn) addPlayerBtn.disabled = currentPlayerCount >= MAX_PLAYERS;
    if (removePlayerBtn) removePlayerBtn.disabled = currentPlayerCount <= MIN_PLAYERS;
    
    // Update tile buttons
    if (addTileBtn) addTileBtn.disabled = currentTileCount >= 67;
    if (removeTileBtn) removeTileBtn.disabled = currentTileCount <= 20;
}

// ============================================
// BOARD RENDERING FUNCTIONS
// ============================================

function renderBoard() {
    if (!boardPath) return;
    
    boardPath.innerHTML = '';
    gameState.tiles.forEach((tile, i) => {
        const tileElement = document.createElement('div');
        tileElement.className = `tile ${tile.colorClass}`;
        tileElement.setAttribute('data-index', i);
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tile-tooltip';
        tooltip.textContent = tile.description;
        
        tileElement.innerHTML = `
            <div class="tile-number">${i + 1}</div>
            <div class="tile-icon">${tile.emoji}</div>
            <div class="tile-name">${tile.name}</div>
        `;
        
        tileElement.appendChild(tooltip);
        boardPath.appendChild(tileElement);
    });
    
    updatePlayerPositions();
}

function updatePlayerPositions() {
    if (!boardPath) return;
    
    // Remove existing tokens
    document.querySelectorAll('.player-token').forEach(token => token.remove());
    
    // Group players by tile position
    const playersByTile = {};
    gameState.players.forEach(player => {
        if (!playersByTile[player.position]) {
            playersByTile[player.position] = [];
        }
        playersByTile[player.position].push(player);
    });
    
    // Add tokens for each player on each tile
    Object.keys(playersByTile).forEach(tilePos => {
        const playersOnTile = playersByTile[tilePos];
        const tileElement = boardPath.children[tilePos];
        
        if (tileElement) {
            playersOnTile.forEach((player, index) => {
                const token = document.createElement('div');
                token.className = `player-token ${player.colorClass}`;
                token.textContent = player.id;
                token.style.color = player.textColor;
                token.style.backgroundColor = player.colorValue;
                token.title = `${player.name} (Score: ${player.score})`;
                
                // Assign different corners based on player position index
                const positionIndex = index % TOKEN_POSITIONS.length;
                Object.assign(token.style, TOKEN_POSITIONS[positionIndex]);
                
                tileElement.appendChild(token);
            });
        }
    });
}

function renderPlayerInfo() {
    if (!playersContainer) return;
    
    playersContainer.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = `player-card ${player.colorClass} ${index === gameState.currentPlayerIndex ? 'active' : ''}`;
        playerCard.style.cssText = `
            background: ${player.colorValue};
            color: ${player.textColor};
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        `;
        playerCard.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-score">${player.score}</div>
            <div style="font-size: 0.8rem; opacity: 0.9;">Tile: ${player.position + 1}</div>
        `;
        playersContainer.appendChild(playerCard);
    });
}

function updateCurrentPlayerDisplay() {
    if (!rollBtn || !playersContainer) return;
    
    // Update player cards
    document.querySelectorAll('.player-card').forEach((card, index) => {
        if (index === gameState.currentPlayerIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Update roll button text
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    rollBtn.innerHTML = `<i class="fas fa-dice"></i> ${currentPlayer.name}'s Turn - Roll & Move!`;
}

function showTurnMessage(message, duration = 4000) {
    if (!turnMessage) return;
    
    // Clear any existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        turnMessage.classList.remove('fade-out');
    }
    
    turnMessage.textContent = message;
    turnMessage.style.display = 'block';
    turnMessage.style.opacity = '1';
    
    // Set timeout to fade out
    notificationTimeout = setTimeout(() => {
        turnMessage.classList.add('fade-out');
        
        // Remove from DOM after fade out
        setTimeout(() => {
            if (turnMessage.classList.contains('fade-out')) {
                turnMessage.style.display = 'none';
                turnMessage.classList.remove('fade-out');
            }
        }, 1000);
    }, duration);
}

// ============================================
// QUESTION & FEEDBACK FUNCTIONS
// ============================================

function showFeedback(message, isPositive, nextAction) {
    if (!feedback) return;
    
    // Set the feedback text
    const feedbackText = document.getElementById('feedbackText');
    if (feedbackText) {
        feedbackText.textContent = message;
    }
    
    // Style the feedback based on whether it's positive
    feedback.style.borderLeftColor = isPositive ? 'var(--primary)' : 'var(--danger)';
    feedback.classList.add('show');
    
    // Show the continue button
    if (continueBtn) {
        continueBtn.style.display = 'flex';
        continueBtn.innerHTML = `<i class="fas fa-arrow-right"></i> Continue`;
        
        // Store the next action
        nextActionAfterContinue = nextAction;
    } else {
        // If continue button doesn't exist, fall back to automatic timeout
        console.warn("Continue button not found, using automatic timeout");
        setTimeout(() => {
            feedback.classList.remove('show');
            if (nextAction) {
                nextAction();
            }
        }, 3000);
    }
}

function hideQuestionPanel() {
    if (questionPanel) questionPanel.classList.remove('active');
    gameState.questionActive = false;
    
    // Also hide feedback and continue button
    if (feedback) {
        feedback.classList.remove('show');
    }
    if (continueBtn) {
        continueBtn.style.display = 'none';
    }
}

// ============================================
// WIN SCREEN FUNCTIONS
// ============================================

function createLeaderboard() {
    if (!statsContainer) return;
    
    statsContainer.innerHTML = '';
    
    gameState.players.forEach(player => {
        const accuracy = player.questionsAnswered > 0 
            ? Math.round((player.correctAnswers / player.questionsAnswered) * 100) 
            : 0;
        
        const statsHTML = `
            <div class="stat-card" style="border-left-color: ${player.colorValue}">
                <h4>${player.name}</h4>
                <div class="stat-value">${player.score}</div>
                <p>Final Score</p>
                <div style="margin-top: 8px; font-size: 0.9rem;">
                    <div>Questions: ${player.correctAnswers}/${player.questionsAnswered}</div>
                    <div>Accuracy: ${accuracy}%</div>
                    <div>Exercises: ${player.exerciseCompleted}</div>
                </div>
            </div>
        `;
        
        statsContainer.innerHTML += statsHTML;
    });
    
    createScoreChart();
}

function createScoreChart() {
    const ctx = document.getElementById('scoreChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    const playerNames = gameState.players.map(p => p.name);
    const playerScores = gameState.players.map(p => p.score);
    const playerColors = gameState.players.map(p => p.colorValue);
    
    if (window.scoreChartInstance) {
        window.scoreChartInstance.destroy();
    }
    
    window.scoreChartInstance = new Chart(context, {
        type: 'bar',
        data: {
            labels: playerNames,
            datasets: [{
                label: 'Final Scores',
                data: playerScores,
                backgroundColor: playerColors,
                borderColor: playerColors,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Player Scores',
                    font: { size: 18, family: "'Fredoka One', 'Segoe UI', sans-serif" },
                    color: '#333'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { family: "'Comic Neue', 'Comic Sans MS', cursive, sans-serif", size: 12 }
                    }
                },
                x: {
                    ticks: {
                        font: { family: "'Comic Neue', 'Comic Sans MS', cursive, sans-serif", size: 12 }
                    }
                }
            }
        }
    });
}

// ============================================
// MUSIC CONTROL
// ============================================

function toggleMusic() {
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicIcon = document.getElementById('musicIcon');
    
    if (!backgroundMusic || !musicIcon) return;
    
    const isMuted = musicIcon.className.includes('fa-volume-mute');
    
    if (isMuted) {
        backgroundMusic.play().catch(e => {
            console.log("Could not play music:", e);
        });
        musicIcon.className = 'fas fa-volume-up';
    } else {
        backgroundMusic.pause();
        musicIcon.className = 'fas fa-volume-mute';
    }
    
    localStorage.setItem('nutritionMusicMuted', (!isMuted).toString());
}