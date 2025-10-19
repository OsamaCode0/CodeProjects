-- ============================================
-- ТАБЛИЦЫ ДЛЯ СИСТЕМЫ РЕКОМЕНДАЦИЙ
-- ============================================

-- Таблица отклоненных пользователей (dismissed)
CREATE TABLE IF NOT EXISTS dismissed_profiles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dismissed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, dismissed_user_id),
    -- Нельзя отклонить самого себя
    CHECK (user_id != dismissed_user_id)
);

CREATE INDEX IF NOT EXISTS idx_dismissed_user ON dismissed_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dismissed_target ON dismissed_profiles(dismissed_user_id);

-- Таблица подключений (connections)
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Уникальность: между двумя пользователями может быть только один запрос
    UNIQUE(requester_id, recipient_id),
    -- Нельзя подключиться к самому себе
    CHECK (requester_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- Таблица для предпочтений матчинга (опционально, можно использовать позже)
CREATE TABLE IF NOT EXISTS matching_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    min_child_age INT DEFAULT 0,
    max_child_age INT DEFAULT 18,
    preferred_genders TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Гарантируем что user1_id < user2_id для уникальности
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_chats_user1 ON chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_chats_user2 ON chats(user2_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON chats(last_message_at DESC);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(chat_id, read) WHERE read = FALSE;

-- Триггер для обновления last_message_at в чатах
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
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

-- Комментарии для документации
COMMENT ON TABLE dismissed_profiles IS 'Список отклоненных рекомендаций (не показывать снова)';
COMMENT ON TABLE connections IS 'Запросы на подключение между пользователями';
COMMENT ON TABLE chats IS 'Чаты между подключенными пользователями';
COMMENT ON TABLE messages IS 'Сообщения в чатах';
