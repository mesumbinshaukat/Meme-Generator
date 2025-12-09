-- EvoMeme AI Database Schema
-- SQLite database for tracking memes, evolutions, and analytics

-- Sessions table (anonymous user tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_active INTEGER NOT NULL,
  user_agent TEXT,
  ip_hash TEXT
);

-- Memes table (all generated memes)
CREATE TABLE IF NOT EXISTS memes (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  parent_id TEXT, -- For evolution tracking
  template_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  alt_text TEXT,
  image_url TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  tone TEXT DEFAULT 'funny',
  created_at INTEGER NOT NULL,
  generation_time_ms INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (parent_id) REFERENCES memes(id)
);

-- Evolution tree (tracks mutation relationships)
CREATE TABLE IF NOT EXISTS evolutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_meme_id TEXT NOT NULL,
  child_meme_id TEXT NOT NULL,
  mutation_type TEXT, -- 'variation', 'tone-shift', 'format-change', 'template-swap'
  feedback TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (parent_meme_id) REFERENCES memes(id),
  FOREIGN KEY (child_meme_id) REFERENCES memes(id)
);

-- Analytics (for admin dashboard)
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'generate', 'evolve', 'share', 'download', 'error'
  meme_id TEXT,
  session_id TEXT,
  metadata TEXT, -- JSON string for additional data
  created_at INTEGER NOT NULL,
  FOREIGN KEY (meme_id) REFERENCES memes(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Rate limiting (IP-based)
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 0,
  window_start INTEGER NOT NULL,
  blocked_until INTEGER
);

-- Shares (collaborative meme evolution)
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  access_count INTEGER DEFAULT 0,
  FOREIGN KEY (meme_id) REFERENCES memes(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memes_session ON memes(session_id);
CREATE INDEX IF NOT EXISTS idx_memes_parent ON memes(parent_id);
CREATE INDEX IF NOT EXISTS idx_memes_created ON memes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evolutions_parent ON evolutions(parent_meme_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_child ON evolutions(child_meme_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shares_meme ON shares(meme_id);
