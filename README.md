# Retro Pong Game

A classic retro-style pong game with modern features including email authentication, cloud-based leaderboard, and multiple game modes.

## Features
- 🎮 Classic pong gameplay with retro aesthetics
- 🤖 Single player mode (vs CPU)
- 👥 Two player mode (local multiplayer)
- 🔐 Email authentication system
- 🏆 Cloud-based leaderboard with Supabase
- 📱 Responsive design for mobile and desktop
- ⌨️ Keyboard controls with customizable bindings

## Game Controls
- **Player 1**: W/S keys or Arrow Up/Down
- **Player 2**: I/K keys (in 2-player mode)
- **ESC**: Return to menu or close modals

## Getting Started

### Quick Start (Demo Mode)
1. Simply open `index.html` in your browser to play
2. The game will run in demo mode with local scores

### Full Setup with Cloud Features
1. Install dependencies: `npm install`
2. Set up Supabase database (see SUPABASE_SETUP.md)
3. Update your Supabase credentials in `auth.js`
4. Start local server: `npm run dev`

## Game Modes
- **Vs CPU**: Play against an AI opponent
- **2 Players**: Local multiplayer on the same device

## Authentication
- Email-based registration and login
- Scores are saved to your account
- Demo mode available without signup

## Leaderboard
- View top scores from all players
- Filter by game mode
- Real-time updates with Supabase

## Tech Stack
- HTML5 Canvas for game rendering
- Vanilla JavaScript for game logic
- CSS3 with custom retro styling
- Supabase for backend services
- Responsive design principles

## File Structure
```
├── index.html          # Main game page
├── style.css          # Retro styling and responsive design
├── game.js            # Core game mechanics and rendering
├── auth.js            # Authentication and user management
├── leaderboard.js     # Score tracking and leaderboard
├── main.js            # Application controller and UI logic
├── package.json       # Dependencies and scripts
└── SUPABASE_SETUP.md  # Database setup instructions
```

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## License
MIT