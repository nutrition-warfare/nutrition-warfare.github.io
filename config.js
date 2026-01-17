// ============================================
// GAME CONFIGURATION & CONSTANTS
// ============================================

// Game configuration
const CONFIG = {
    diceSides: 6,
    startTile: 0,
    initialScore: 0,
    extraMoveReward: 2,
    penaltyMove: -1
};

// The 7 nutrients for reference throughout the game
const NUTRIENTS = [
    { name: "Carbohydrates", function: "Provide energy for your body", emoji: "🍞", color: "nutrient-1", examples: ["Whole grain bread", "Rice", "Pasta", "Fruits"] },
    { name: "Proteins", function: "Build and repair muscles and tissues", emoji: "🍗", color: "nutrient-2", examples: ["Chicken", "Fish", "Eggs", "Beans"] },
    { name: "Fats", function: "Store energy and protect organs", emoji: "🥑", color: "nutrient-3", examples: ["Avocado", "Nuts", "Olive oil", "Cheese"] },
    { name: "Vitamins", function: "Help your body work properly and fight illness", emoji: "🥦", color: "nutrient-4", examples: ["Broccoli", "Oranges", "Carrots", "Spinach"] },
    { name: "Minerals", function: "Build strong bones and teeth", emoji: "🥛", color: "nutrient-5", examples: ["Milk", "Yogurt", "Bananas", "Leafy greens"] },
    { name: "Water", function: "Hydrates your body and helps digestion", emoji: "💧", color: "nutrient-6", examples: ["Water", "Cucumber", "Watermelon", "Soup"] },
    { name: "Fiber", function: "Helps digestion and keeps you full", emoji: "🌾", color: "nutrient-7", examples: ["Whole grains", "Apples", "Beans", "Berries"] }
];

// Tile types configuration
const TILE_TYPES = {
    QUESTION: { 
        name: "Question", 
        emoji: "❓", 
        color: "tile-question", 
        description: "Answer a nutrition question correctly to earn extra moves!",
        probability: 0.35
    },
    EXERCISE: { 
        name: "Exercise", 
        emoji: "🏃", 
        color: "tile-exercise", 
        description: "Complete a fun exercise challenge!",
        probability: 0.15
    },
    FACT: { 
        name: "Fact", 
        emoji: "💡", 
        color: "tile-fact", 
        description: "Learn an interesting health fact!",
        probability: 0.20
    },
    EMPTY: { 
        name: "Rest", 
        emoji: "😌", 
        color: "tile-empty", 
        description: "Take a break and rest on this space.",
        probability: 0.30
    },
    START: { 
        name: "Start", 
        emoji: "🚀", 
        color: "tile-start", 
        description: "Begin your nutrition adventure here!"
    },
    FINISH: { 
        name: "Finish", 
        emoji: "🏆", 
        color: "tile-finish", 
        description: "Complete your journey to win the game!"
    }
};

// Player configuration
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

// All player colors
const PLAYER_COLORS = [
    { name: 'Green', value: '#4CAF50', class: 'player-1' },
    { name: 'Orange', value: '#FF9800', class: 'player-2' },
    { name: 'Blue', value: '#2196F3', class: 'player-3' },
    { name: 'Purple', value: '#9C27B0', class: 'player-4' },
    { name: 'Red', value: '#F44336', class: 'player-5' },
    { name: 'Yellow', value: '#FFEB3B', class: 'player-6', textColor: '#333' },
    { name: 'Teal', value: '#009688', class: 'player-7' },
    { name: 'Pink', value: '#E91E63', class: 'player-8' }
];

// Player positions on tile (4 corners)
const TOKEN_POSITIONS = [
    { top: '4px', left: '4px' },
    { top: '4px', right: '4px' },
    { bottom: '4px', left: '4px' },
    { bottom: '4px', right: '4px' }
];

// Game state & variables
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    gameActive: false,
    tiles: [],
    diceValue: 0,
    questionActive: false,
    isRolling: false,
    lastRandomSeed: Date.now()
};

// Configuration variables
let currentPlayerCount = 2;
let currentTileCount = 30;
let externalDataLoaded = false;
let dataLoadAttempts = 0;
const MAX_DATA_LOAD_ATTEMPTS = 5;
let notificationTimeout = null;