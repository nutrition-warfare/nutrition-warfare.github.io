// ============================================
// GAME LOGIC FUNCTIONS
// ============================================

// ============================================
// EXTERNAL DATA LOADING
// ============================================

function loadExternalData() {
    updateLoadingMessage("Loading game data...");

    // Check if external data is already loaded
    if (typeof QUESTIONS !== 'undefined' && 
        typeof FACTS !== 'undefined' && 
        typeof EXERCISE_CHALLENGES !== 'undefined' && 
        typeof WIN_MESSAGES !== 'undefined') {
        
        externalDataLoaded = true;
        console.log("External data already loaded!");
        hideLoadingScreen();
        return;
    }
    
    // Try to load the external data file
    const script = document.createElement('script');
    script.src = 'nutriquest-data.js';
    script.onload = function() {
        dataLoadAttempts = 0;
        if (typeof QUESTIONS !== 'undefined' && 
            typeof FACTS !== 'undefined' && 
            typeof EXERCISE_CHALLENGES !== 'undefined' && 
            typeof WIN_MESSAGES !== 'undefined') {
            
            externalDataLoaded = true;
            console.log("External data loaded successfully!");
            updateLoadingMessage("Data loaded successfully!");
            
            // Add a small delay to show the success message
            setTimeout(() => {
                hideLoadingScreen();
            }, 1000);
        } else {
            console.warn("External data file loaded but variables are missing.");
            createFallbackData();
            hideLoadingScreen();
        }
    };
    
    script.onerror = function() {
        dataLoadAttempts++;
        if (dataLoadAttempts < MAX_DATA_LOAD_ATTEMPTS) {
            console.warn(`Failed to load external data. Attempt ${dataLoadAttempts} of ${MAX_DATA_LOAD_ATTEMPTS}. Retrying...`);
            updateLoadingMessage(`Loading data (attempt ${dataLoadAttempts})...`);
            
            // Retry after a delay
            setTimeout(() => {
                loadExternalData();
            }, 2000);
        } else {
            console.error("Failed to load external data after multiple attempts. Using fallback data.");
            updateLoadingMessage("Using fallback data...");
            createFallbackData();
            
            setTimeout(() => {
                hideLoadingScreen();
            }, 1500);
        }
    };
    
    document.head.appendChild(script);
}

function createFallbackData() {
    updateLoadingMessage("Creating fallback data...");
    
    // Create comprehensive fallback data
    window.QUESTIONS = window.QUESTIONS || [
        {
            question: "Which food group gives you the most energy?",
            options: ["Fruits", "Vegetables", "Carbohydrates", "Protein"],
            correct: 2,
            feedback: "Correct! Carbohydrates are your body's main source of energy!",
            icon: "🍞"
        },
        {
            question: "What nutrient helps build and repair muscles?",
            options: ["Carbohydrates", "Protein", "Fats", "Vitamins"],
            correct: 1,
            feedback: "Great job! Protein is essential for building and repairing muscles!",
            icon: "🍗"
        }
    ];
    
    window.FACTS = window.FACTS || [
        "Drinking water helps your brain work better!",
        "Eating colorful vegetables gives you different vitamins!"
    ];
    
    window.EXERCISE_CHALLENGES = window.EXERCISE_CHALLENGES || [
        "Do 10 jumping jacks to get your blood flowing!",
        "Touch your toes 5 times to stretch your muscles!"
    ];
    
    window.WIN_MESSAGES = window.WIN_MESSAGES || [
        "Congratulations on completing your nutrition adventure!",
        "Great job! Remember to eat a rainbow of fruits and vegetables every day!"
    ];
    
    externalDataLoaded = true;
}

// ============================================
// GAME INITIALIZATION
// ============================================

function initGame() {
    // Check if external data is loaded
    if (!externalDataLoaded) {
        showTurnMessage("Game data still loading. Please wait...", 3000);
        return;
    }
    
    // Update CONFIG with chosen tile count
    CONFIG.finishTile = currentTileCount - 1;
    
    // Get player names and colors from inputs
    const players = [];
    const usedColors = new Set();
    
    for (let i = 1; i <= currentPlayerCount; i++) {
        const input = document.getElementById(`player${i}Input`);
        const name = input ? input.value.trim() : `Player ${i}`;
        
        // Get selected color for this player
        const selectedColorOption = document.querySelector(`.color-option[data-player="${i}"].selected`);
        const colorIndex = selectedColorOption ? parseInt(selectedColorOption.dataset.colorIndex) : (i - 1) % PLAYER_COLORS.length;
        const color = PLAYER_COLORS[colorIndex];
        
        // Ensure unique colors
        let finalColorIndex = colorIndex;
        while (usedColors.has(finalColorIndex)) {
            finalColorIndex = (finalColorIndex + 1) % PLAYER_COLORS.length;
        }
        usedColors.add(finalColorIndex);
        const finalColor = PLAYER_COLORS[finalColorIndex];
        
        players.push({
            id: i,
            name: name || `Player ${i}`,
            position: CONFIG.startTile,
            score: CONFIG.initialScore,
            colorClass: finalColor.class,
            colorValue: finalColor.value,
            textColor: finalColor.textColor || 'white',
            positionIndex: i - 1,
            questionsAnswered: 0,
            correctAnswers: 0,
            tilesLandedOn: 0,
            exerciseCompleted: 0
        });
    }
    
    // Initialize players
    gameState.players = players;
    
    // Generate new random seed for board layout
    gameState.lastRandomSeed = Date.now();
    
    // Initialize tiles with random layout
    generateTiles();
    
    // Adjust tile type probabilities based on board size
    adjustTileProbabilities();
    
    // Calculate dynamic rewards based on board size
    calculateDynamicRewards();
    
    // Render game board
    renderBoard();
    
    // Render player info
    renderPlayerInfo();
    
    // Hide start screen, show game
    if (startScreen) {
        startScreen.style.opacity = '0';
        startScreen.style.pointerEvents = 'none';
        setTimeout(() => {
            startScreen.style.display = 'none';
            startScreen.style.opacity = '1';
        }, 300);
    }
    
    // Show game interface
    if (gameInterface) {
        gameInterface.style.display = 'block';
    }
    
    gameState.gameActive = true;
    gameState.isRolling = false;
    
    // Reset roll button state
    if (rollBtn) {
        rollBtn.disabled = false;
        rollBtn.style.opacity = '1';
    }
    
    // Set first player as active
    updateCurrentPlayerDisplay();
    
    // Show initial turn message
    showTurnMessage(`${gameState.players[0].name}'s turn to start! Click "Roll & Move!" to begin.`, 5000);
}

function calculateDynamicRewards() {
    // Make rewards scale with board size
    const baseExtra = Math.max(2, Math.floor(currentTileCount / 15));
    const basePenalty = Math.max(-2, -Math.floor(currentTileCount / 20));
    
    CONFIG.extraMoveReward = baseExtra;
    CONFIG.penaltyMove = basePenalty;
}

function adjustTileProbabilities() {
    const tileCount = currentTileCount;
    
    // Adjust probabilities based on board size
    if (tileCount <= 30) {
        TILE_TYPES.QUESTION.probability = 0.6;
        TILE_TYPES.EXERCISE.probability = 0.05;
        TILE_TYPES.FACT.probability = 0.1;
        TILE_TYPES.EMPTY.probability = 0.2;
    } else if (tileCount <= 45) {
        TILE_TYPES.QUESTION.probability = 0.5;
        TILE_TYPES.EXERCISE.probability = 0.1;
        TILE_TYPES.FACT.probability = 0.15;
        TILE_TYPES.EMPTY.probability = 0.25;
    } else {
        TILE_TYPES.QUESTION.probability = 0.4;
        TILE_TYPES.EXERCISE.probability = 0.2;
        TILE_TYPES.FACT.probability = 0.25;
        TILE_TYPES.EMPTY.probability = 0.20;
    }
}

function generateTiles() {
    gameState.tiles = [];
    
    // Create start tile
    gameState.tiles.push({
        number: 0,
        type: 'start',
        name: 'Start',
        emoji: '🚀',
        colorClass: 'tile-start',
        description: 'Begin your nutrition adventure here!'
    });
    
    // Use random seed for consistent random generation
    const seed = gameState.lastRandomSeed;
    let randomIndex = 0;
    
    // Create middle tiles with random types based on probabilities
    for (let i = 1; i < currentTileCount - 1; i++) {
        // Use seeded random for consistent board generation
        randomIndex++;
        const randomValue = Math.sin(seed + i * 100 + randomIndex) * 10000;
        const rand = Math.abs(randomValue - Math.floor(randomValue));
        
        let tileType;
        let accumulated = 0;
        
        // Check each tile type in order of probability
        const types = [TILE_TYPES.QUESTION, TILE_TYPES.EXERCISE, TILE_TYPES.FACT, TILE_TYPES.EMPTY];
        const probabilities = [TILE_TYPES.QUESTION.probability, TILE_TYPES.EXERCISE.probability, 
                              TILE_TYPES.FACT.probability, TILE_TYPES.EMPTY.probability];
        
        for (let j = 0; j < types.length; j++) {
            accumulated += probabilities[j];
            if (rand < accumulated) {
                tileType = types[j];
                break;
            }
        }
        
        // Add some random variation
        if (i % 7 === 0 && rand > 0.5) {
            tileType = TILE_TYPES.FACT;
        } else if (i % 5 === 0 && rand < 0.3) {
            tileType = TILE_TYPES.EXERCISE;
        }
        
        // Ensure tile type exists
        if (!tileType) {
            tileType = TILE_TYPES.EMPTY;
        }
        
        gameState.tiles.push({
            number: i,
            type: tileType.name,
            name: tileType.name,
            emoji: tileType.emoji,
            colorClass: tileType.color,
            description: tileType.description
        });
    }
    
    // Create finish tile
    gameState.tiles.push({
        number: currentTileCount - 1,
        type: 'finish',
        name: 'Finish',
        emoji: '🏆',
        colorClass: 'tile-finish',
        description: 'Complete your nutrition journey! First player to reach here wins!'
    });
}

// ============================================
// GAME LOGIC
// ============================================

function rollDice() {
    if (!gameState.gameActive || gameState.questionActive || gameState.isRolling) {
        return;
    }
    
    gameState.isRolling = true;
    if (rollBtn) rollBtn.disabled = true;
    
    // Generate random dice value
    gameState.diceValue = Math.floor(Math.random() * CONFIG.diceSides) + 1;
    
    // Show dice result with animation
    if (diceResult) {
        diceResult.style.display = 'block';
        diceResult.textContent = `🎲 ${gameState.diceValue}`;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    showTurnMessage(`${currentPlayer.name} rolled a ${gameState.diceValue}!`);
    
    // Move player with animation
    setTimeout(() => {
        animateMovement(gameState.diceValue);
    }, 1000);
}

function animateMovement(spaces) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const startPosition = currentPlayer.position;
    const targetPosition = Math.min(startPosition + spaces, CONFIG.finishTile);
    
    // Track tiles landed on
    currentPlayer.tilesLandedOn += spaces;
    
    let currentStep = 0;
    const stepDelay = 300; // ms between steps
    
    function moveStep() {
        if (currentStep < spaces && currentPlayer.position < CONFIG.finishTile) {
            currentPlayer.position = startPosition + currentStep + 1;
            updatePlayerPositions();
            currentStep++;
            setTimeout(moveStep, stepDelay);
        } else {
            // Animation complete
            updatePlayerPositions();
            renderPlayerInfo();
            
            // Check for win condition
            if (currentPlayer.position === CONFIG.finishTile) {
                setTimeout(() => endGame(currentPlayer), 800);
                return;
            }
            
            // Check tile action after animation
            setTimeout(() => {
                checkTileAction(currentPlayer.position);
            }, 500);
        }
    }
    
    moveStep();
}

function checkTileAction(tileIndex) {
    const tile = gameState.tiles[tileIndex];
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Skip action for start and finish tiles
    if (tile.type === 'start' || tile.type === 'finish') {
        endTurn();
        return;
    }
    
    // Handle empty tiles
    if (tile.type === 'rest') {
        showTurnMessage(`${currentPlayer.name} landed on a rest space. Time to relax! 🍃`, 3000);
        setTimeout(() => endTurn(), 1500);
        return;
    }
    
    gameState.questionActive = true;
    if (questionPanel) questionPanel.classList.add('active');
    if (feedback) feedback.classList.remove('show');
    
    // Handle different tile types
    switch (tile.type) {
        case 'Question':
            showQuestion();
            break;
        case 'Exercise':
            showExerciseChallenge();
            break;
        case 'Fact':
            showFact();
            break;
        default:
            endTurn();
    }
}

let nextActionAfterContinue = null;
let continueBtn = null;

// Initialize continue button in DOM
function initializeContinueButton() {
    continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            if (nextActionAfterContinue) {
                // Hide feedback and continue button
                if (feedback) {
                    feedback.classList.remove('show');
                    continueBtn.style.display = 'none';
                }
                
                // Execute the stored action
                const action = nextActionAfterContinue;
                nextActionAfterContinue = null; // Clear the action
                action();
            }
        });
    }
}

function showQuestion() {
    // Make sure game data is loaded
    if (!externalDataLoaded || !gameData.QUESTIONS || gameData.QUESTIONS.length === 0) {
        console.error("No questions available!");
        showFeedback("No questions available. Please check the data file.", false, function() {
            setTimeout(() => endTurn(), 1500);
        });
        return;
    }
    
    const questions = gameData.QUESTIONS;
    if (questions.length === 0) {
        console.error("Questions array is empty!");
        showFeedback("No questions available. Please check the data file.", false, function() {
            setTimeout(() => endTurn(), 1500);
        });
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    
    // Update question panel
    if (questionIcon) questionIcon.textContent = question.icon || "❓";
    if (questionType) questionType.textContent = "Nutrition Question";
    if (questionText) questionText.textContent = question.question;
    
    // Clear and add options
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => checkAnswer(index, question));
            optionsContainer.appendChild(optionBtn);
        });
    }
}

function showExerciseChallenge() {
    // Make sure game data is loaded
    if (!externalDataLoaded || !gameData.EXERCISE_CHALLENGES || gameData.EXERCISE_CHALLENGES.length === 0) {
        console.error("No exercise challenges available!");
        showFeedback("No exercise challenges available. Please check the data file.", false, function() {
            setTimeout(() => endTurn(), 1500);
        });
        return;
    }
    
    const exercises = gameData.EXERCISE_CHALLENGES;
    if (exercises.length === 0) {
        console.error("Exercise challenges array is empty!");
        showFeedback("No exercise challenges available. Please check the data file.", false, function() {
            setTimeout(() => endTurn(), 1500);
        });
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * exercises.length);
    const challenge = exercises[randomIndex];
    
    if (questionIcon) questionIcon.textContent = "🏃";
    if (questionType) questionType.textContent = "Exercise Challenge";
    if (questionText) questionText.textContent = challenge;
    
    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <button class="option-btn" id="completeExercise">I did it! Feeling energized!</button>
        `;
        
        document.getElementById('completeExercise').addEventListener('click', () => {
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            currentPlayer.score += 3;
            currentPlayer.exerciseCompleted += 1;
            
            showFeedback("Awesome! Exercise keeps your body and mind healthy! 💪", true, function() {
                giveReward(CONFIG.extraMoveReward);
            });
        });
    }
}

function showFact() {
    // Make sure game data is loaded
    if (!externalDataLoaded || !gameData.FACTS || gameData.FACTS.length === 0) {
        console.error("No facts available!");
        showFeedback("No facts available. Please check the data file.", false, function() {
            setTimeout(() => endTurn(), 1500);
        });
        return;
    }
    
    const facts = gameData.FACTS;
    if (facts.length === 0) {
        console.error("Facts array is empty!");
        showFeedback("No facts available. Please check the data file.", false, function() {
            setTimeout(() => endTurn(), 1500);
        });
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * facts.length);
    const fact = facts[randomIndex];
    
    if (questionIcon) questionIcon.textContent = "💡";
    if (questionType) questionType.textContent = "Healthy Fact";
    if (questionText) questionText.textContent = fact;
    
    if (optionsContainer) {
        optionsContainer.innerHTML = `
            <button class="option-btn" id="learnedFact">I learned something new!</button>
        `;
        
        document.getElementById('learnedFact').addEventListener('click', () => {
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            currentPlayer.score += 2;
            
            showFeedback("Learning about health is a superpower! 🧠", true, function() {
                endTurn();
            });
        });
    }
}

function checkAnswer(selectedIndex, question) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isCorrect = selectedIndex === question.correct;
    
    // Update player stats
    currentPlayer.questionsAnswered += 1;
    if (isCorrect) currentPlayer.correctAnswers += 1;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === question.options[selectedIndex]) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (btn.textContent === question.options[question.correct]) {
            btn.classList.add('correct');
        }
    });
    
    // Show feedback with Continue button
    if (isCorrect) {
        currentPlayer.score += 10;
        showTurnMessage(`Correct! ${currentPlayer.name} earned 10 points!`, 3000);
        showFeedback(question.feedback, true, function() {
            giveReward(CONFIG.extraMoveReward);
        });
    } else {
        currentPlayer.score += 1; // Give 1 point for trying
        showTurnMessage(`${currentPlayer.name} gets 1 point for trying!`, 3000);
        showFeedback(`Good try! The correct answer was: ${question.options[question.correct]}. ${question.feedback}`, false, function() {
            givePenalty(CONFIG.penaltyMove);
        });
    }
    
    // Update player display
    renderPlayerInfo();
}

function giveReward(extraMoves) {
    hideQuestionPanel();
    showTurnMessage(`Great job! You get ${extraMoves} extra move${extraMoves > 1 ? 's' : ''}!`, 3000);
    setTimeout(() => {
        animateMovement(extraMoves);
    }, 1000);
}

function givePenalty(penaltyMoves) {
    hideQuestionPanel();
    if (penaltyMoves < 0) {
        showTurnMessage(`Move back ${Math.abs(penaltyMoves)} space${Math.abs(penaltyMoves) > 1 ? 's' : ''}. Don't worry, you'll get the next one!`, 3000);
        setTimeout(() => {
            animateMovement(penaltyMoves);
        }, 1000);
    } else {
        endTurn();
    }
}

function endTurn() {
    hideQuestionPanel();
    gameState.isRolling = false;
    if (rollBtn) rollBtn.disabled = false;
    
    if (diceResult) diceResult.style.display = 'none';
    
    // Move to next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    updateCurrentPlayerDisplay();
    
    const nextPlayer = gameState.players[gameState.currentPlayerIndex];
    showTurnMessage(`${nextPlayer.name}'s turn! Click "Roll & Move!" to play.`, 4000);
}

function endGame(winner) {
    gameState.gameActive = false;
    gameState.isRolling = false;
    if (rollBtn) rollBtn.disabled = false;
    
    // Show win screen
    if (winnerMessage) winnerMessage.textContent = `${winner.name} wins! 🎉`;
    
    // Random nutrition message
    if (nutritionMessage) {
        const winMessages = gameData.WIN_MESSAGES || [
            "Congratulations on completing your nutrition adventure!",
            "Great job! Remember to eat a rainbow of fruits and vegetables every day!",
            "You're a nutrition champion! Keep making healthy choices!"
        ];
        const randomMessageIndex = Math.floor(Math.random() * winMessages.length);
        nutritionMessage.textContent = winMessages[randomMessageIndex];
    }
    
    // Create leaderboard
    createLeaderboard();
    
    if (winScreen) {
        winScreen.style.display = 'flex';
        setTimeout(() => {
            winScreen.style.opacity = '1';
        }, 10);
    }
    showTurnMessage(`Congratulations ${winner.name}! You won the game! 🏆`, 6000);
}

function resetGame() {
    // Hide win screen with animation
    if (winScreen) {
        winScreen.style.opacity = '0';
        setTimeout(() => {
            winScreen.style.display = 'none';
            winScreen.style.opacity = '1';
        }, 300);
    }
    
    // Hide game interface
    if (gameInterface) {
        gameInterface.style.display = 'none';
    }
    
    // Show start screen with animation
    if (startScreen) {
        startScreen.style.display = 'flex';
        startScreen.style.pointerEvents = 'auto';
        setTimeout(() => {
            startScreen.style.opacity = '1';
        }, 10);
    }
    
    // Reset game state
    gameState = {
        players: [],
        currentPlayerIndex: 0,
        gameActive: false,
        tiles: [],
        diceValue: 0,
        questionActive: false,
        isRolling: false,
        lastRandomSeed: Date.now()
    };
    
    // Reset displays
    if (diceResult) diceResult.style.display = 'none';
    if (questionPanel) questionPanel.classList.remove('active');
    if (turnMessage) {
        turnMessage.style.display = 'none';
        turnMessage.classList.remove('fade-out');
    }
    if (boardPath) boardPath.innerHTML = '';
    if (playersContainer) playersContainer.innerHTML = '';
    if (rollBtn) {
        rollBtn.disabled = false;
        rollBtn.innerHTML = `<i class="fas fa-dice"></i> Roll & Move!`;
    }
    
    // Clear notification timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    
    // Re-initialize configuration
    currentPlayerCount = 2;
    currentTileCount = 30;
    updatePlayerCountDisplay();
    updateTileCountDisplay();
    renderPlayerInputs();
    updateConfigurationButtons();
    
    // Reset preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tiles === "30");
    });
    
    console.log("Game reset successfully!");
}