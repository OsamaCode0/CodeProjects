-- Table to track unread messages
CREATE TABLE IF NOT EXISTS unread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unread_messages_unique UNIQUE (user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_unread_messages_user ON unread_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_unread_messages_message ON unread_messages(message_id);

-- Function to mark message as unread for recipient
CREATE OR REPLACE FUNCTION mark_message_unread() RETURNS TRIGGER AS $$
BEGIN
  -- Add unread entry for the recipient (not the sender)
  INSERT INTO unread_messages (user_id, message_id)
  SELECT 
    CASE 
      WHEN c.user1_id = NEW.sender_id THEN c.user2_id
      ELSE c.user1_id
    END,
    NEW.id
  FROM chats c
  WHERE c.id = NEW.chat_id
  ON CONFLICT (user_id, message_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create unread entries
DROP TRIGGER IF EXISTS trg_mark_message_unread ON messages;
CREATE TRIGGER trg_mark_message_unread
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION mark_message_unread();

-- Add last_message_at column to chats for sorting
ALTER TABLE chats ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

-- Update last_message_at when new message is sent
CREATE OR REPLACE FUNCTION update_chat_last_message() RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_chat_last_message ON messages;
CREATE TRIGGER trg_update_chat_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_last_message();

-- Backfill last_message_at for existing chats
UPDATE chats c
SET last_message_at = (
  SELECT MAX(m.created_at)
  FROM messages m
  WHERE m.chat_id = c.id
)
WHERE EXISTS (SELECT 1 FROM messages WHERE chat_id = c.id);