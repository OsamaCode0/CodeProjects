-- Connections table for connection requests between users
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT connections_different_users CHECK (requester_user_id <> target_user_id),
  CONSTRAINT connections_unique_pair UNIQUE (requester_user_id, target_user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);