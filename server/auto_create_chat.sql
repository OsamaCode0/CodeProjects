CREATE OR REPLACE FUNCTION update_is_match()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_id UUID;
  v_target_id UUID;
BEGIN
  IF NEW.reaction = 'like' THEN
    UPDATE user_reactions
    SET is_match = true
    WHERE user_id = NEW.target_user_id
      AND target_user_id = NEW.user_id
      AND reaction = 'like';

    IF EXISTS (
      SELECT 1 FROM user_reactions
      WHERE user_id = NEW.target_user_id
        AND target_user_id = NEW.user_id
        AND reaction = 'like'
    ) THEN
      NEW.is_match := true;
      
      INSERT INTO connections (requester_user_id, target_user_id, status)
      VALUES (
        LEAST(NEW.user_id, NEW.target_user_id),
        GREATEST(NEW.user_id, NEW.target_user_id),
        'accepted'
      )
      ON CONFLICT (requester_user_id, target_user_id) DO NOTHING;
      
      INSERT INTO chats (user1_id, user2_id)
      VALUES (
        LEAST(NEW.user_id, NEW.target_user_id),
        GREATEST(NEW.user_id, NEW.target_user_id)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  ELSE
    NEW.is_match := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_is_match ON user_reactions;
CREATE TRIGGER trg_update_is_match
BEFORE INSERT OR UPDATE ON user_reactions
FOR EACH ROW
EXECUTE FUNCTION update_is_match();