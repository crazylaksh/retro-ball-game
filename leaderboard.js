// Leaderboard module
const Leaderboard = {
    demoScores: [
        { player_name: 'ProPlayer', score: 5, game_mode: 'single', created_at: '2024-01-15' },
        { player_name: 'GameMaster', score: 5, game_mode: 'two', created_at: '2024-01-14' },
        { player_name: 'PongChamp', score: 4, game_mode: 'single', created_at: '2024-01-13' },
        { player_name: 'Retro_Fan', score: 4, game_mode: 'two', created_at: '2024-01-12' },
        { player_name: 'ArcadeKing', score: 3, game_mode: 'single', created_at: '2024-01-11' }
    ],
    
    init() {
        this.setupEventListeners();
        this.createTable();
    },
    
    setupEventListeners() {
        const leaderboardBtn = document.getElementById('leaderboardBtn');
        leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
    },
    
    async showLeaderboard() {
        document.getElementById('leaderboardModal').classList.remove('hidden');
        await this.loadScores();
    },
    
    async loadScores() {
        const content = document.getElementById('leaderboardContent');
        content.innerHTML = '<div class="loading">Loading scores...</div>';
        
        try {
            let scores;
            
            if (supabase) {
                scores = await this.loadFromSupabase();
            } else {
                scores = this.demoScores;
            }
            
            this.displayScores(scores);
        } catch (error) {
            console.error('Error loading scores:', error);
            content.innerHTML = '<div class="message error">Error loading leaderboard</div>';
        }
    },
    
    async loadFromSupabase() {
        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .order('score', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        return data || [];
    },
    
    displayScores(scores) {
        const content = document.getElementById('leaderboardContent');
        
        if (scores.length === 0) {
            content.innerHTML = '<div class="message">No scores yet. Be the first to play!</div>';
            return;
        }
        
        let html = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Mode</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        scores.forEach((score, index) => {
            const date = new Date(score.created_at).toLocaleDateString();
            const mode = score.game_mode === 'single' ? 'Vs CPU' : '2 Players';
            
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${score.player_name}</td>
                    <td>${score.score}</td>
                    <td>${mode}</td>
                    <td>${date}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        content.innerHTML = html;
    },
    
    async saveScore(score, gameMode) {
        if (!Auth.currentUser) {
            console.log('No user logged in, score not saved');
            return;
        }
        
        const playerName = Auth.currentUser.user_metadata?.full_name || 
                          Auth.currentUser.email.split('@')[0];
        
        try {
            if (supabase && Auth.currentUser.id !== 'demo-user') {
                await this.saveToSupabase(playerName, score, gameMode);
            } else {
                this.saveToDemoScores(playerName, score, gameMode);
            }
            
            console.log('Score saved successfully');
        } catch (error) {
            console.error('Error saving score:', error);
        }
    },
    
    async saveToSupabase(playerName, score, gameMode) {
        const { error } = await supabase
            .from('scores')
            .insert([
                {
                    player_name: playerName,
                    score: score,
                    game_mode: gameMode,
                    user_id: Auth.currentUser.id
                }
            ]);
        
        if (error) throw error;
    },
    
    saveToDemoScores(playerName, score, gameMode) {
        const newScore = {
            player_name: playerName,
            score: score,
            game_mode: gameMode,
            created_at: new Date().toISOString()
        };
        
        this.demoScores.unshift(newScore);
        
        // Keep only top 10 scores
        this.demoScores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.created_at) - new Date(a.created_at);
        });
        
        this.demoScores = this.demoScores.slice(0, 10);
    },
    
    createTable() {
        // This method is called during initialization
        // The actual table is created dynamically in displayScores
    }
};

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Leaderboard.init();
});