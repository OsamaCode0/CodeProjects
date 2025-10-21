-- Chat rooms table (automatically created when connection is accepted)
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chats_different_users CHECK (user1_id <> user2_id)
);

-- Unique index to prevent duplicate chats between same two users (in any order)
CREATE UNIQUE INDEX IF NOT EXISTS idx_chats_unique_pair 
  ON chats ((LEAST(user1_id, user2_id)), (GREATEST(user1_id, user2_id)));

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chats_user1 ON chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2 ON chats(user2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
