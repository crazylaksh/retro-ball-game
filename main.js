// Main application controller
const App = {
    init() {
        this.setupEventListeners();
        this.showMainMenu();
    },
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('singlePlayerBtn').addEventListener('click', () => {
            this.startGame('single');
        });
        
        document.getElementById('twoPlayerBtn').addEventListener('click', () => {
            this.startGame('two');
        });
        
        // Game control buttons
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.backToMenu();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.playAgain();
        });
        
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.backToMenu();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (Game.gameRunning) {
                    this.backToMenu();
                } else {
                    this.closeAllModals();
                }
            }
        });
    },
    
    showMainMenu() {
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('gameOverModal').classList.add('hidden');
        
        // Stop any running game
        Game.stopGame();
    },
    
    startGame(mode) {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
        // Start the game with the selected mode
        Game.startGame(mode);
    },
    
    backToMenu() {
        Game.stopGame();
        this.showMainMenu();
        this.closeAllModals();
    },
    
    playAgain() {
        document.getElementById('gameOverModal').classList.add('hidden');
        Game.startGame(Game.gameMode);
    },
    
    closeAllModals() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('leaderboardModal').classList.add('hidden');
        document.getElementById('gameOverModal').classList.add('hidden');
    },
    
    // Utility methods for other modules to use
    showMessage(text, type = 'info', duration = 3000) {
        // Create a temporary message overlay
        const messageEl = document.createElement('div');
        messageEl.className = `toast-message ${type}`;
        messageEl.textContent = text;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(0, 255, 0, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    // Show instructions for users
    setTimeout(() => {
        if (!Auth.currentUser) {
            App.showMessage('Welcome! Click Login to save your scores to the leaderboard.', 'info', 5000);
        }
    }, 1000);
    
    // Show controls help
    setTimeout(() => {
        App.showMessage('Controls: Player 1: W/S or ↑/↓ | Player 2: I/K', 'info', 7000);
    }, 6000);
});