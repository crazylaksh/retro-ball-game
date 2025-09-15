// Game state and configuration
const Game = {
    canvas: null,
    ctx: null,
    gameRunning: false,
    gameMode: null, // 'single' or 'two'
    
    // Game objects
    ball: {
        x: 400,
        y: 200,
        dx: 5,
        dy: 3,
        radius: 8,
        speed: 5
    },
    
    player1: {
        x: 20,
        y: 150,
        width: 15,
        height: 100,
        dy: 0,
        speed: 8,
        score: 0
    },
    
    player2: {
        x: 765,
        y: 150,
        width: 15,
        height: 100,
        dy: 0,
        speed: 8,
        score: 0,
        isAI: false
    },
    
    // Game settings
    winningScore: 5,
    
    // Input handling
    keys: {},
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set up event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    startGame(mode) {
        this.gameMode = mode;
        this.gameRunning = true;
        
        // Reset scores and positions
        this.resetGame();
        
        // Set AI mode
        this.player2.isAI = (mode === 'single');
        
        // Update UI
        document.getElementById('gameMode').textContent = 
            mode === 'single' ? 'Vs CPU' : '2 Players';
        
        // Start game loop
        this.gameLoop();
    },
    
    resetGame() {
        // Reset ball
        this.ball.x = 400;
        this.ball.y = 200;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.ball.speed;
        this.ball.dy = (Math.random() - 0.5) * 4;
        
        // Reset paddles
        this.player1.y = 150;
        this.player1.dy = 0;
        this.player2.y = 150;
        this.player2.dy = 0;
        
        // Reset scores
        this.player1.score = 0;
        this.player2.score = 0;
        this.updateScoreDisplay();
    },
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    },
    
    update() {
        // Update paddles
        this.updatePaddles();
        
        // Update ball
        this.updateBall();
        
        // Check for collision
        this.checkCollisions();
        
        // Check for scoring
        this.checkScoring();
    },
    
    updatePaddles() {
        // Player 1 controls (W/S or Arrow keys)
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.player1.dy = -this.player1.speed;
        } else if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.player1.dy = this.player1.speed;
        } else {
            this.player1.dy = 0;
        }
        
        // Update player 1 position
        this.player1.y += this.player1.dy;
        this.player1.y = Math.max(0, Math.min(this.canvas.height - this.player1.height, this.player1.y));
        
        // Player 2 controls
        if (this.player2.isAI) {
            // AI logic
            const ballCenterY = this.ball.y;
            const paddleCenterY = this.player2.y + this.player2.height / 2;
            const diff = ballCenterY - paddleCenterY;
            
            if (Math.abs(diff) > 10) {
                this.player2.dy = diff > 0 ? this.player2.speed * 0.7 : -this.player2.speed * 0.7;
            } else {
                this.player2.dy = 0;
            }
        } else {
            // Player 2 controls (I/K keys)
            if (this.keys['KeyI']) {
                this.player2.dy = -this.player2.speed;
            } else if (this.keys['KeyK']) {
                this.player2.dy = this.player2.speed;
            } else {
                this.player2.dy = 0;
            }
        }
        
        // Update player 2 position
        this.player2.y += this.player2.dy;
        this.player2.y = Math.max(0, Math.min(this.canvas.height - this.player2.height, this.player2.y));
    },
    
    updateBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Top and bottom wall collision
        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }
    },
    
    checkCollisions() {
        // Player 1 paddle collision
        if (this.ball.x - this.ball.radius <= this.player1.x + this.player1.width &&
            this.ball.x + this.ball.radius >= this.player1.x &&
            this.ball.y >= this.player1.y &&
            this.ball.y <= this.player1.y + this.player1.height) {
            
            this.ball.dx = Math.abs(this.ball.dx);
            
            // Add some angle based on where the ball hits the paddle
            const hitPos = (this.ball.y - this.player1.y) / this.player1.height;
            this.ball.dy = (hitPos - 0.5) * 8;
        }
        
        // Player 2 paddle collision
        if (this.ball.x + this.ball.radius >= this.player2.x &&
            this.ball.x - this.ball.radius <= this.player2.x + this.player2.width &&
            this.ball.y >= this.player2.y &&
            this.ball.y <= this.player2.y + this.player2.height) {
            
            this.ball.dx = -Math.abs(this.ball.dx);
            
            // Add some angle based on where the ball hits the paddle
            const hitPos = (this.ball.y - this.player2.y) / this.player2.height;
            this.ball.dy = (hitPos - 0.5) * 8;
        }
    },
    
    checkScoring() {
        // Player 1 scores (ball goes off right side)
        if (this.ball.x > this.canvas.width) {
            this.player1.score++;
            this.resetBall();
            this.updateScoreDisplay();
            this.checkGameEnd();
        }
        
        // Player 2 scores (ball goes off left side)
        if (this.ball.x < 0) {
            this.player2.score++;
            this.resetBall();
            this.updateScoreDisplay();
            this.checkGameEnd();
        }
    },
    
    resetBall() {
        this.ball.x = 400;
        this.ball.y = 200;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.ball.speed;
        this.ball.dy = (Math.random() - 0.5) * 4;
    },
    
    updateScoreDisplay() {
        document.getElementById('player1Score').textContent = this.player1.score;
        document.getElementById('player2Score').textContent = this.player2.score;
    },
    
    checkGameEnd() {
        if (this.player1.score >= this.winningScore || this.player2.score >= this.winningScore) {
            this.endGame();
        }
    },
    
    endGame() {
        this.gameRunning = false;
        
        const winner = this.player1.score >= this.winningScore ? 'Player 1' : 
                      (this.player2.isAI ? 'CPU' : 'Player 2');
        const isPlayerWin = winner === 'Player 1';
        
        // Save score if user is logged in
        if (Auth.currentUser && isPlayerWin) {
            Leaderboard.saveScore(this.player1.score, this.gameMode);
        }
        
        // Show game over modal
        const content = document.getElementById('gameOverContent');
        content.innerHTML = `
            <h3>${winner} Wins!</h3>
            <p>Final Score: ${this.player1.score} - ${this.player2.score}</p>
            ${Auth.currentUser && isPlayerWin ? '<p>Score saved to leaderboard!</p>' : ''}
        `;
        
        document.getElementById('gameOverModal').classList.remove('hidden');
    },
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        this.ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    },
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        // Prevent scrolling with arrow keys
        if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'KeyI', 'KeyK'].includes(e.code)) {
            e.preventDefault();
        }
    },
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    },
    
    stopGame() {
        this.gameRunning = false;
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});