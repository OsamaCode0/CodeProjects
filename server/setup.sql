-- ============================================
-- ПОЛНАЯ УСТАНОВКА БАЗЫ ДАННЫХ MATCHME
-- ============================================

-- Расширения (СНАЧАЛА!)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- ТАБЛИЦЫ
-- ============================================

-- Таблица users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица parent_profiles (с geog сразу)
CREATE TABLE parent_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  gender TEXT,
  about TEXT,
  languages TEXT[] DEFAULT '{}',
  address_city TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  preferred_distance_km INTEGER CHECK (preferred_distance_km BETWEEN 0 AND 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  geog geography(Point, 4326)
);

-- Таблица children
CREATE TABLE children (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  birthday DATE,
  gender TEXT,
  about_short TEXT,
  interests TEXT[] DEFAULT '{}',
  activity_level TEXT,
  limitations TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  play_styles TEXT[] DEFAULT '{}'
);

-- Таблица user_photos
CREATE TABLE user_photos (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  photo_public_id TEXT NOT NULL,
  photo_version INTEGER NOT NULL
);

-- Таблица matching_preferences
CREATE TABLE matching_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  interests_weight INTEGER DEFAULT 1 CHECK (interests_weight BETWEEN 0 AND 5),
  activity_level_weight INTEGER DEFAULT 2 CHECK (activity_level_weight BETWEEN 0 AND 5),
  limitations_weight INTEGER DEFAULT 3 CHECK (limitations_weight BETWEEN 0 AND 5),
  allergies_weight INTEGER DEFAULT 3 CHECK (allergies_weight BETWEEN 0 AND 5),
  play_styles_weight INTEGER DEFAULT 1 CHECK (play_styles_weight BETWEEN 0 AND 5),
  max_age_difference INTEGER DEFAULT 2 CHECK (max_age_difference >= 0)
);

-- Таблица user_reactions (с is_match!)
CREATE TABLE user_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  is_match BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT user_reactions_no_self CHECK (user_id <> target_user_id),
  CONSTRAINT user_reactions_user_target_unique UNIQUE (user_id, target_user_id)
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

-- Spatial index для geog
CREATE INDEX parent_profiles_geog_idx ON parent_profiles USING GIST (geog);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Функция для обновления timestamps
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для parent_profiles timestamps
CREATE TRIGGER trg_parent_profiles_timestamps
BEFORE UPDATE ON parent_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Функция для обновления geog
CREATE OR REPLACE FUNCTION set_parent_geog() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lon IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.lon, NEW.lat), 4326)::geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для geog
CREATE TRIGGER trg_parent_geog
BEFORE INSERT OR UPDATE ON parent_profiles
FOR EACH ROW EXECUTE FUNCTION set_parent_geog();

-- Функция для обновления is_match
CREATE OR REPLACE FUNCTION update_is_match() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reaction = 'like' THEN
    UPDATE user_reactions SET is_match = true
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
    END IF;
  ELSE
    NEW.is_match := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для is_match (ЭТО БЫЛО ПРОПУЩЕНО!)
CREATE TRIGGER trg_update_is_match
BEFORE INSERT OR UPDATE ON user_reactions
FOR EACH ROW EXECUTE FUNCTION update_is_match();

-- Функция profile completion
CREATE OR REPLACE FUNCTION profile_completion_percent(p_user_id uuid) RETURNS numeric AS $$
DECLARE
  total_fields int := 15;
  parent_filled int := 0;
  child_filled int := 0;
BEGIN
  SELECT 
    ((name IS NOT NULL AND name <> '')::int) +
    ((gender IS NOT NULL AND gender <> '')::int) +
    ((about IS NOT NULL AND about <> '')::int) +
    ((languages IS NOT NULL AND cardinality(languages) > 0)::int) +
    ((address_city IS NOT NULL AND address_city <> '')::int) +
    ((preferred_distance_km IS NOT NULL)::int)
  INTO parent_filled
  FROM parent_profiles WHERE user_id = p_user_id;
  
  parent_filled := COALESCE(parent_filled, 0);
  
  SELECT 
    ((name IS NOT NULL AND name <> '')::int) +
    ((birthday IS NOT NULL)::int) +
    ((gender IS NOT NULL AND gender <> '')::int) +
    ((about_short IS NOT NULL AND about_short <> '')::int) +
    ((interests IS NOT NULL AND cardinality(interests) > 0)::int) +
    ((activity_level IS NOT NULL AND activity_level <> '')::int) +
    ((limitations IS NOT NULL AND cardinality(limitations) > 0)::int) +
    ((allergies IS NOT NULL AND cardinality(allergies) > 0)::int) +
    ((play_styles IS NOT NULL AND cardinality(play_styles) > 0)::int)
  INTO child_filled
  FROM children WHERE user_id = p_user_id;
  
  child_filled := COALESCE(child_filled, 0);
  
  RETURN ROUND(((parent_filled + child_filled)::numeric / total_fields) * 100.0, 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- Функция prefilter для matching
CREATE OR REPLACE FUNCTION prefilter_candidates_postgis(
  viewer uuid,
  p_limit int DEFAULT 500,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  candidate_user_id uuid,
  distance_km double precision,
  address_city text
) LANGUAGE sql AS $$
WITH me_parent AS (
  SELECT p.user_id, p.geog, p.preferred_distance_km
  FROM parent_profiles p
  WHERE p.user_id = viewer
    AND p.name IS NOT NULL AND btrim(p.name) <> ''
    AND p.gender IS NOT NULL AND btrim(p.gender) <> ''
    AND p.about IS NOT NULL AND btrim(p.about) <> ''
    AND array_length(p.languages,1) IS NOT NULL AND array_length(p.languages,1) > 0
    AND p.address_city IS NOT NULL AND btrim(p.address_city) <> ''
    AND p.geog IS NOT NULL
    AND p.preferred_distance_km IS NOT NULL
),
me_child AS (
  SELECT c.user_id
  FROM children c
  WHERE c.user_id = viewer
    AND c.name IS NOT NULL AND btrim(c.name) <> ''
    AND c.birthday IS NOT NULL
    AND c.gender IS NOT NULL AND btrim(c.gender) <> ''
    AND c.about_short IS NOT NULL AND btrim(c.about_short) <> ''
    AND array_length(c.interests,1) IS NOT NULL AND array_length(c.interests,1) > 0
    AND c.activity_level IS NOT NULL AND btrim(c.activity_level) <> ''
    AND array_length(c.allergies,1) IS NOT NULL AND array_length(c.allergies,1) > 0
    AND array_length(c.play_styles,1) IS NOT NULL AND array_length(c.play_styles,1) > 0
),
me AS (
  SELECT mp.user_id, mp.geog, mp.preferred_distance_km
  FROM me_parent mp JOIN me_child mc ON mc.user_id = mp.user_id
),
candidates_full AS (
  SELECT p.user_id, p.address_city, p.geog
  FROM parent_profiles p
  JOIN children c ON c.user_id = p.user_id
  JOIN me ON TRUE
  WHERE p.user_id <> me.user_id
    AND p.name IS NOT NULL AND btrim(p.name) <> ''
    AND p.gender IS NOT NULL AND btrim(p.gender) <> ''
    AND p.about IS NOT NULL AND btrim(p.about) <> ''
    AND array_length(p.languages,1) IS NOT NULL AND array_length(p.languages,1) > 0
    AND p.address_city IS NOT NULL AND btrim(p.address_city) <> ''
    AND p.geog IS NOT NULL
    AND c.name IS NOT NULL AND btrim(c.name) <> ''
    AND c.birthday IS NOT NULL
    AND c.gender IS NOT NULL AND btrim(c.gender) <> ''
    AND c.about_short IS NOT NULL AND btrim(c.about_short) <> ''
    AND array_length(c.interests,1) IS NOT NULL AND array_length(c.interests,1) > 0
    AND c.activity_level IS NOT NULL AND btrim(c.activity_level) <> ''
    AND array_length(c.allergies,1) IS NOT NULL AND array_length(c.allergies,1) > 0
    AND array_length(c.play_styles,1) IS NOT NULL AND array_length(c.play_styles,1) > 0
)
SELECT
  cf.user_id AS candidate_user_id,
  ST_Distance(me.geog, cf.geog) / 1000.0 AS distance_km,
  cf.address_city
FROM candidates_full cf
JOIN me ON TRUE
WHERE ST_DWithin(me.geog, cf.geog, me.preferred_distance_km * 1000.0)
ORDER BY distance_km ASC, cf.user_id
LIMIT p_limit OFFSET p_offset;
$$;