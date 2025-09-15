# Supabase Setup Instructions

This game uses Supabase for authentication and leaderboard functionality. Follow these steps to set up your Supabase database:

## 1. Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

## 2. Get Your Project Credentials
1. Go to your project's Settings > API
2. Copy your Project URL and anon public key
3. Update the credentials in `auth.js`:
   ```javascript
   const SUPABASE_URL = 'your-project-url-here';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

## 3. Create the Scores Table
Run this SQL in your Supabase SQL Editor:

```sql
-- Create the scores table
CREATE TABLE scores (
    id BIGSERIAL PRIMARY KEY,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('single', 'two')),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own scores" ON scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view scores" ON scores
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_user_id ON scores(user_id);
```

## 4. Configure Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Make sure email authentication is enabled
3. Optionally configure email templates and other settings

## Demo Mode
If you don't set up Supabase, the game will run in demo mode with local storage for scores. Users can still "login" with any email for demo purposes.

## Environment Variables (Optional)
For production deployment, you can use environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then update the auth.js file to use these variables instead of hardcoded values.