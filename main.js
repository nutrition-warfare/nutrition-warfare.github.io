// ============================================
// MAIN INITIALIZATION
// ============================================

// Global variables for game data
let gameData = {
    QUESTIONS: [],
    FACTS: [],
    EXERCISE_CHALLENGES: [],
    WIN_MESSAGES: []
};

// Initialize DOM elements
function initializeDOMElements() {
    startScreen = document.getElementById('startScreen');
    winScreen = document.getElementById('winScreen');
    gameInterface = document.getElementById('gameInterface');
    gameBoard = document.getElementById('gameBoard');
    boardPath = document.getElementById('boardPath');
    playersContainer = document.getElementById('playersContainer');
    diceResult = document.getElementById('diceResult');
    questionPanel = document.getElementById('questionPanel');
    questionText = document.getElementById('questionText');
    questionIcon = document.getElementById('questionIcon');
    questionType = document.getElementById('questionType');
    optionsContainer = document.getElementById('optionsContainer');
    feedback = document.getElementById('feedback');
    rollBtn = document.getElementById('rollBtn');
    newGameBtn = document.getElementById('newGameBtn');
    startGameBtn = document.getElementById('startGameBtn');
    playAgainBtn = document.getElementById('playAgainBtn');
    winnerMessage = document.getElementById('winnerMessage');
    nutritionMessage = document.getElementById('nutritionMessage');
    statsContainer = document.getElementById('statsContainer');
    turnMessage = document.getElementById('turnMessage');
    loadingScreen = document.getElementById('loadingScreen');
    playerCountDisplay = document.getElementById('playerCountDisplay');
    playerInputsContainer = document.getElementById('playerInputsContainer');
    tileCountDisplay = document.getElementById('tileCountDisplay');
    advancedSettingsToggle = document.getElementById('advancedSettingsToggle');
    advancedSettingsContent = document.getElementById('advancedSettingsContent');
    addTileBtn = document.getElementById('addTileBtn');
    removeTileBtn = document.getElementById('removeTileBtn');
    
    // Hide screens initially
    if (winScreen) winScreen.style.display = 'none';
    if (gameInterface) gameInterface.style.display = 'none';
}

// Load game data with fallback
function loadGameData() {
    updateLoadingMessage("Loading game data...");
    
    // Try to fetch the data file
    fetch('nutriquest-data.js')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            // Execute the data file to populate global variables
            try {
                // Extract the data from the file
                const script = document.createElement('script');
                script.textContent = data;
                document.head.appendChild(script);
                
                // Check if data was loaded
                setTimeout(() => {
                    if (typeof QUESTIONS !== 'undefined' && 
                        typeof FACTS !== 'undefined' && 
                        typeof EXERCISE_CHALLENGES !== 'undefined' && 
                        typeof WIN_MESSAGES !== 'undefined') {
                        
                        // Store the data in our gameData object
                        gameData.QUESTIONS = QUESTIONS;
                        gameData.FACTS = FACTS;
                        gameData.EXERCISE_CHALLENGES = EXERCISE_CHALLENGES;
                        gameData.WIN_MESSAGES = WIN_MESSAGES;
                        
                        externalDataLoaded = true;
                        console.log("External data loaded successfully!");
                        console.log(`Loaded ${QUESTIONS.length} questions, ${FACTS.length} facts, ${EXERCISE_CHALLENGES.length} exercises, ${WIN_MESSAGES.length} win messages`);
                        
                        updateLoadingMessage("Game data loaded!");
                        
                        // Add a small delay to show the success message
                        setTimeout(() => {
                            hideLoadingScreen();
                        }, 1000);
                    } else {
                        console.warn("External data file loaded but variables are missing.");
                        createFallbackData();
                        hideLoadingScreen();
                    }
                }, 100);
                
            } catch (error) {
                console.error("Error executing data file:", error);
                createFallbackData();
                hideLoadingScreen();
            }
        })
        .catch(error => {
            console.error("Failed to load external data:", error);
            updateLoadingMessage("Using fallback data...");
            createFallbackData();
            setTimeout(() => {
                hideLoadingScreen();
            }, 1500);
        });
}

// Create comprehensive fallback data
function createFallbackData() {
    updateLoadingMessage("Creating fallback data...");
    
    // Create comprehensive fallback data
    gameData.QUESTIONS = [
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
        },
        {
            question: "Which of these is a good source of Vitamin C?",
            options: ["Bread", "Orange", "Cheese", "Rice"],
            correct: 1,
            feedback: "Excellent! Oranges are packed with Vitamin C which helps your immune system!",
            icon: "🍊"
        },
        {
            question: "What should you drink plenty of every day to stay hydrated?",
            options: ["Soda", "Water", "Juice", "Milk"],
            correct: 1,
            feedback: "Perfect! Water is essential for keeping your body hydrated and healthy!",
            icon: "💧"
        },
        {
            question: "Which food is a good source of calcium for strong bones?",
            options: ["Chocolate", "Broccoli", "Yogurt", "Potato"],
            correct: 2,
            feedback: "Correct! Yogurt is rich in calcium which helps build strong bones!",
            icon: "🥛"
        },
        {
            question: "What nutrient helps your body absorb vitamins?",
            options: ["Carbohydrates", "Fats", "Protein", "Fiber"],
            correct: 1,
            feedback: "Great! Fats help your body absorb important vitamins!",
            icon: "🥑"
        },
        {
            question: "True or False: Eating a variety of colorful fruits and vegetables is important for health.",
            options: ["True", "False"],
            correct: 0,
            feedback: "Correct! Different colors mean different nutrients - eat the rainbow!",
            icon: "🌈"
        },
        {
            question: "What does a balanced diet include?",
            options: ["Only fruits", "Foods from all food groups", "Only protein", "Lots of sweets"],
            correct: 1,
            feedback: "Correct! A balanced diet includes fruits, vegetables, grains, protein, and dairy.",
            icon: "⚖️"
        },
        {
            question: "Why is exercise important for health?",
            options: ["Makes muscles strong", "Keeps heart healthy", "Makes you feel happy", "All of the above"],
            correct: 3,
            feedback: "Correct! Exercise does all of these things and more!",
            icon: "❤️"
        },
        {
            question: "Which snack is healthier?",
            options: ["Apple with peanut butter", "Potato chips", "Chocolate bar", "Sugary cereal"],
            correct: 0,
            feedback: "Great choice! Apple with peanut butter gives you fiber, vitamins, and protein.",
            icon: "🍎"
        }
    ];
    
    gameData.FACTS = [
        "Drinking water helps your brain work better!",
        "Eating colorful vegetables gives you different vitamins!",
        "Whole grains give you energy that lasts all day!",
        "Protein helps your muscles grow strong!",
        "Calcium from dairy products makes your bones strong!",
        "Fiber helps your digestive system work properly!",
        "Fruits are nature's candy - sweet and healthy!",
        "Exercise releases 'feel-good' chemicals in your brain called endorphins!",
        "Bananas are a great source of potassium, which helps your muscles work!",
        "Sleep is just as important as diet and exercise for good health!"
    ];
    
    gameData.EXERCISE_CHALLENGES = [
        "Do 10 jumping jacks to get your blood flowing!",
        "Touch your toes 5 times to stretch your muscles!",
        "Take 5 deep breaths to relax your mind and body!",
        "March in place for 15 seconds to wake up your body!",
        "Do 5 arm circles forward and backward!",
        "Stretch up high and touch the sky for 10 seconds!",
        "Balance on one foot for 10 seconds!",
        "Do 3 squats like you're sitting in a chair!",
        "Spin around 3 times carefully!",
        "Pretend to jump rope 10 times!"
    ];
    
    gameData.WIN_MESSAGES = [
        "Remember: A balanced diet is key to a healthy life!",
        "Keep eating colorful fruits and vegetables every day!",
        "Don't forget to drink plenty of water!",
        "Exercise and good nutrition work together for health!",
        "Try new healthy foods - you might discover a new favorite!"
    ];
    
    externalDataLoaded = true;
    console.log("Fallback data created successfully!");
}

// Set up event listeners
function setupEventListeners() {
    // Start Game Button
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            console.log("Start button clicked");
            initGame();
        });
    }
    
    // Play Again Button
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', function() {
            console.log("Play again button clicked");
            resetGame();
        });
    }
    
    // Roll Button
    if (rollBtn) {
        rollBtn.addEventListener('click', function() {
            console.log("Roll button clicked");
            rollDice();
        });
    }
    
    // New Game Button
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            console.log("New game button clicked");
            resetGame();
        });
    }
    
    // Music Controls
    const musicControls = document.getElementById('musicControls');
    if (musicControls) {
        musicControls.addEventListener('click', toggleMusic);
    }
    
    // Player Configuration Buttons
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    const removePlayerBtn = document.getElementById('removePlayerBtn');
    
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', function() {
            console.log("Add player button clicked");
            addPlayer();
        });
    }
    
    if (removePlayerBtn) {
        removePlayerBtn.addEventListener('click', function() {
            console.log("Remove player button clicked");
            removePlayer();
        });
    }
    
    // Tile Configuration Buttons
    if (addTileBtn) {
        addTileBtn.addEventListener('click', function() {
            console.log("Add tile button clicked");
            addTile();
        });
    }
    
    if (removeTileBtn) {
        removeTileBtn.addEventListener('click', function() {
            console.log("Remove tile button clicked");
            removeTile();
        });
    }
    
    // Advanced Settings Toggle
    if (advancedSettingsToggle) {
        advancedSettingsToggle.addEventListener('click', function() {
            console.log("Advanced settings toggle clicked");
            const isExpanded = advancedSettingsContent.classList.contains('expanded');
            if (isExpanded) {
                advancedSettingsContent.classList.remove('expanded');
                advancedSettingsToggle.classList.remove('expanded');
            } else {
                advancedSettingsContent.classList.add('expanded');
                advancedSettingsToggle.classList.add('expanded');
            }
        });
    }
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log("Preset button clicked:", this.dataset.tiles);
            const tiles = parseInt(this.dataset.tiles);
            setTileCount(tiles);
            
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add color picker event listeners (delegated)
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('color-option')) {
            const playerNum = parseInt(event.target.dataset.player);
            const colorIndex = parseInt(event.target.dataset.colorIndex);
            const color = PLAYER_COLORS[colorIndex];
            
            // Update input border color
            const input = document.getElementById(`player${playerNum}Input`);
            if (input) {
                input.style.borderColor = color.value;
                
                // Update selected state
                document.querySelectorAll(`.color-option[data-player="${playerNum}"]`).forEach(opt => {
                    opt.classList.remove('selected');
                });
                event.target.classList.add('selected');
            }
        }
    });
}

// Main initialization function
function initializeGame() {
    console.log("Initializing game...");
    
    // Initialize DOM elements
    initializeDOMElements();

    initializeContinueButton();
    
    // Show loading screen immediately
    showLoadingScreen();
    
    // Initialize configuration UI
    initializeConfiguration();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start loading game data
    setTimeout(() => {
        loadGameData();
    }, 500);
    
    console.log("Game initialization complete!");
}

// Start the game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already ready
    initializeGame();
}