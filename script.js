/**
 * Retro Pong Game - JavaScript Implementation
 * 
 * This file contains all the game logic for a classic Pong game including:
 * - Game objects (paddles, ball)
 * - Physics and collision detection
 * - AI for computer paddle
 * - Input handling
 * - Game loop and rendering
 * - Scoring system
 */

// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state variables
let gameRunning = false;
let gameLoop = null;

// Score elements
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');
const gameStatusElement = document.getElementById('gameStatus');

// Game settings
const GAME_SETTINGS = {
    PADDLE_HEIGHT: 80,
    PADDLE_WIDTH: 10,
    PADDLE_SPEED: 5,
    BALL_SIZE: 8,
    BALL_SPEED: 4,
    AI_DIFFICULTY: 0.8, // 0.8 means AI follows 80% of the time
    WINNING_SCORE: 10
};

/**
 * Player Paddle Object
 * Represents the left paddle controlled by the player
 */
const playerPaddle = {
    x: 20,
    y: canvas.height / 2 - GAME_SETTINGS.PADDLE_HEIGHT / 2,
    width: GAME_SETTINGS.PADDLE_WIDTH,
    height: GAME_SETTINGS.PADDLE_HEIGHT,
    speed: GAME_SETTINGS.PADDLE_SPEED,
    score: 0,
    
    // Update paddle position based on input
    update() {
        // Boundary checking to keep paddle within canvas
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    },
    
    // Render the paddle
    draw() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

/**
 * Computer/AI Paddle Object
 * Represents the right paddle controlled by AI
 */
const computerPaddle = {
    x: canvas.width - 30,
    y: canvas.height / 2 - GAME_SETTINGS.PADDLE_HEIGHT / 2,
    width: GAME_SETTINGS.PADDLE_WIDTH,
    height: GAME_SETTINGS.PADDLE_HEIGHT,
    speed: GAME_SETTINGS.PADDLE_SPEED,
    score: 0,
    
    // AI logic to follow the ball
    update() {
        const paddleCenter = this.y + this.height / 2;
        const ballCenter = ball.y + ball.size / 2;
        
        // AI decision making with some randomness for realistic difficulty
        if (Math.random() < GAME_SETTINGS.AI_DIFFICULTY) {
            if (paddleCenter < ballCenter - 10) {
                this.y += this.speed;
            } else if (paddleCenter > ballCenter + 10) {
                this.y -= this.speed;
            }
        }
        
        // Boundary checking
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    },
    
    // Render the paddle
    draw() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

/**
 * Ball Object
 * Represents the game ball with physics
 */
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: GAME_SETTINGS.BALL_SIZE,
    speedX: GAME_SETTINGS.BALL_SPEED,
    speedY: GAME_SETTINGS.BALL_SPEED,
    
    // Reset ball to center with random direction
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        // Random direction for X (left or right)
        this.speedX = GAME_SETTINGS.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        // Random direction for Y
        this.speedY = GAME_SETTINGS.BALL_SPEED * (Math.random() * 2 - 1);
    },
    
    // Update ball position and handle collisions
    update() {
        // Move the ball
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Top and bottom wall collisions
        if (this.y <= 0 || this.y + this.size >= canvas.height) {
            this.speedY = -this.speedY;
            // Keep ball within bounds
            if (this.y <= 0) this.y = 0;
            if (this.y + this.size >= canvas.height) this.y = canvas.height - this.size;
        }
        
        // Player paddle collision
        if (this.x <= playerPaddle.x + playerPaddle.width &&
            this.x + this.size >= playerPaddle.x &&
            this.y <= playerPaddle.y + playerPaddle.height &&
            this.y + this.size >= playerPaddle.y &&
            this.speedX < 0) {
            
            this.speedX = -this.speedX;
            // Add some angle based on where ball hits paddle
            const hitPos = (this.y + this.size/2) - (playerPaddle.y + playerPaddle.height/2);
            this.speedY = hitPos * 0.1;
        }
        
        // Computer paddle collision
        if (this.x + this.size >= computerPaddle.x &&
            this.x <= computerPaddle.x + computerPaddle.width &&
            this.y <= computerPaddle.y + computerPaddle.height &&
            this.y + this.size >= computerPaddle.y &&
            this.speedX > 0) {
            
            this.speedX = -this.speedX;
            // Add some angle based on where ball hits paddle
            const hitPos = (this.y + this.size/2) - (computerPaddle.y + computerPaddle.height/2);
            this.speedY = hitPos * 0.1;
        }
        
        // Score detection - ball goes off left or right edge
        if (this.x < 0) {
            // Computer scores
            computerPaddle.score++;
            updateScore();
            this.reset();
            
            // Check for game end
            if (computerPaddle.score >= GAME_SETTINGS.WINNING_SCORE) {
                endGame('Computer Wins!');
            }
        }
        
        if (this.x > canvas.width) {
            // Player scores
            playerPaddle.score++;
            updateScore();
            this.reset();
            
            // Check for game end
            if (playerPaddle.score >= GAME_SETTINGS.WINNING_SCORE) {
                endGame('Player Wins!');
            }
        }
    },
    
    // Render the ball
    draw() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
};

/**
 * Input handling for player paddle
 */
const keys = {
    w: false,
    s: false,
    up: false,
    down: false,
    space: false
};

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w':
            keys.w = true;
            break;
        case 's':
            keys.s = true;
            break;
        case 'arrowup':
            keys.up = true;
            e.preventDefault(); // Prevent page scrolling
            break;
        case 'arrowdown':
            keys.down = true;
            e.preventDefault(); // Prevent page scrolling
            break;
        case ' ':
            if (!keys.space) { // Prevent key repeat
                toggleGame();
            }
            keys.space = true;
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w':
            keys.w = false;
            break;
        case 's':
            keys.s = false;
            break;
        case 'arrowup':
            keys.up = false;
            break;
        case 'arrowdown':
            keys.down = false;
            break;
        case ' ':
            keys.space = false;
            break;
    }
});

/**
 * Handle player paddle movement based on input
 */
function handleInput() {
    if (keys.w || keys.up) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys.s || keys.down) {
        playerPaddle.y += playerPaddle.speed;
    }
}

/**
 * Update score display
 */
function updateScore() {
    playerScoreElement.textContent = playerPaddle.score;
    computerScoreElement.textContent = computerPaddle.score;
}

/**
 * Start the game
 */
function startGame() {
    gameRunning = true;
    gameStatusElement.textContent = 'Game Running - Press SPACE to pause';
    gameLoop = setInterval(update, 1000/60); // 60 FPS
}

/**
 * Pause the game
 */
function pauseGame() {
    gameRunning = false;
    gameStatusElement.textContent = 'Game Paused - Press SPACE to resume';
    clearInterval(gameLoop);
}

/**
 * End the game
 */
function endGame(message) {
    gameRunning = false;
    gameStatusElement.textContent = message + ' - Press SPACE to restart';
    clearInterval(gameLoop);
}

/**
 * Reset the game to initial state
 */
function resetGame() {
    playerPaddle.score = 0;
    computerPaddle.score = 0;
    playerPaddle.y = canvas.height / 2 - GAME_SETTINGS.PADDLE_HEIGHT / 2;
    computerPaddle.y = canvas.height / 2 - GAME_SETTINGS.PADDLE_HEIGHT / 2;
    ball.reset();
    updateScore();
}

/**
 * Toggle game state (start/pause/restart)
 */
function toggleGame() {
    if (!gameRunning) {
        // If game ended (someone won), reset first
        if (playerPaddle.score >= GAME_SETTINGS.WINNING_SCORE || 
            computerPaddle.score >= GAME_SETTINGS.WINNING_SCORE) {
            resetGame();
        }
        startGame();
    } else {
        pauseGame();
    }
}

/**
 * Draw the center line
 */
function drawCenterLine() {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
}

/**
 * Main game update function
 * Called 60 times per second when game is running
 */
function update() {
    // Handle player input
    handleInput();
    
    // Update game objects
    playerPaddle.update();
    computerPaddle.update();
    ball.update();
    
    // Render everything
    render();
}

/**
 * Render all game objects
 */
function render() {
    // Clear the canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    // Draw game objects
    playerPaddle.draw();
    computerPaddle.draw();
    ball.draw();
}

/**
 * Initialize the game
 */
function init() {
    // Set initial game state
    resetGame();
    
    // Initial render
    render();
    
    // Set initial status
    gameStatusElement.textContent = 'Press SPACE to start!';
    
    console.log('Retro Pong Game initialized!');
    console.log('Controls: W/S or Arrow Keys to move, SPACE to start/pause');
}

// Initialize the game when the page loads
window.addEventListener('load', init);