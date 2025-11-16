-- Extention to create uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================
--    TABLES
-- ==============================

-- Talbe app_user
CREATE TABLE IF NOT EXISTS app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Table connected
CREATE TABLE IF NOT EXISTS connected (
  user_a UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  requested_at TIMESTAMP NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP,
  is_requested BOOLEAN NOT NULL DEFAULT TRUE,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table todo
CREATE TABLE IF NOT EXISTS todo (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT ' ',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  due_time TIMESTAMP DEFAULT NULL,
  is_plan BOOLEAN GENERATED ALWAYS AS (due_time IS NOT NULL) STORED
);

-- Table archive
CREATE TABLE IF NOT EXISTS archive (
  todo_id INTEGER NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  due_time TIMESTAMP DEFAULT NULL,
  is_plan BOOLEAN NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Table chat
CREATE TABLE IF NOT EXISTS chat (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table persistance
CREATE TABLE IF NOT EXISTS persistance (
  user_id UUID NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
  token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login_at TIMESTAMP NOT NULL DEFAULT now(),
  logout_at TIMESTAMP NULL
);

-- ==============================
--    FUNCTIONS
-- ==============================

-- Function to create password hash
CREATE OR REPLACE FUNCTION make_bcrypt_hash(p_password TEXT, p_cost INT DEFAULT 12)
RETURNS TEXT AS $$
BEGIN
  IF p_password IS NULL OR length(p_password) = 0 THEN
    RAISE EXCEPTION 'password must not be empty';
  END IF;
  RETURN crypt(p_password, gen_salt('bf', p_cost));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check and verify the password
CREATE OR REPLACE FUNCTION bcrypt_check(p_password TEXT, p_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_password IS NULL OR p_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN crypt(p_password, p_hash) = p_hash;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check is the user exists
CREATE OR REPLACE FUNCTION is_user_exist(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM app_user
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function Insert Into Archive When Delete Todo
CREATE OR REPLACE FUNCTION archive_todo_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO archive (todo_id, user_id, content, created_at, due_time, is_plan, completed_at)
    VALUES (OLD.id, OLD.user_id, OLD.content, OLD.created_at, OLD.due_time, OLD.is_plan, now());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_todo
AFTER DELETE ON todo
FOR EACH ROW
EXECUTE FUNCTION archive_todo_on_delete();


-- Function to check is the user1 and user2 are connected
CREATE OR REPLACE FUNCTION is_connected(a UUID, b UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM connected
    WHERE (user_a = a AND user_b = b)
       OR (user_a = b AND user_b = a)
  );
$$ LANGUAGE SQL IMMUTABLE;

-- Create a default admin user
INSERT INTO app_user (email, name, password_hash)
VALUES (
  'admin@example.com',
  'Admin User',
  make_bcrypt_hash('admin123')  -- replace with a stronger password
)
ON CONFLICT (email) DO NOTHING;

-- Create a starter todo for the admin
INSERT INTO todo (user_id, content, due_time)
VALUES (
  (SELECT id FROM app_user WHERE email = 'admin@example.com'),
  'Set up initial system configuration',
  now() + interval '1 day'
);
