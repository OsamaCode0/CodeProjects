-- Adds :add_count new users, all in Helsinki, with filled parent & child, plus matching_preferences.
-- Safe to run multiple times (unique emails via a sequence).

-- If add_count isn’t passed on the command line, default to 50
\if :{?add_count}
\else
\set add_count 50
\endif

BEGIN;

-- Global sequence for unique email numbers across runs
CREATE SEQUENCE IF NOT EXISTS user_seed_seq START WITH 1000;

WITH
-- Reserve :add_count numbers from the sequence for this batch
seq AS (
  SELECT nextval('user_seed_seq')::int AS seq_n
  FROM generate_series(1, :add_count)
),

-- Insert USERS (unique emails)
new_users AS (
  INSERT INTO users (email, password_hash)
  SELECT
    'helsinki_user_' || to_char(seq_n, 'FM000000') || '@match.me' AS email,
    '!devseed!'                                                    AS password_hash
  FROM seq
  RETURNING id, email
),

-- Stable 1..batch index for deterministic names/lat-lon nudges
batch_idx AS (
  SELECT id, email, row_number() OVER (ORDER BY email) AS i
  FROM new_users
),

-- Name & attribute pools
fi_parent_names AS (
  SELECT ARRAY[
    'Aino','Olavi','Ilona','Matti','Sanna','Jukka','Riikka','Antti','Tiina','Ville',
    'Kaisa','Mikko','Laura','Teemu','Henna','Janne','Noora','Petri','Emmi','Sari',
    'Timo','Paula','Tuomas','Marika','Simo','Outi','Pekka','Heidi','Satu','Jani',
    'Tarja','Niina','Anu','Seppo','Leena','Eeva','Arto','Katja','Eero','Kirsti'
  ] AS arr
),
fi_child_names AS (
  SELECT ARRAY[
    'Elias','Sofia','Aada','Onni','Veeti','Emma','Noel','Olivia','Leo','Iida',
    'Oskari','Helmi','Elli','Aava','Mila','Lumi','Alvar','Siiri','Eero','Vilma',
    'Niilo','Nella','Elina','Aapo','Ella','Aino','Otto','Niko','Taika','Kerttu'
  ] AS arr
),
interests_pool AS (
  SELECT ARRAY['lego','books','music','dance','football','basketball','puzzle','drawing','coding','nature'] AS arr
),
play_styles_pool AS (
  SELECT ARRAY['active','calm','creative','outdoor','team','imaginative'] AS arr
)

-- Parents (all Helsinki; deterministic small jitter so points aren’t identical)
, insert_parents AS (
  INSERT INTO parent_profiles (
    user_id, name, gender, about, language_codes,
    address_city, lat, lon, preferred_distance_km
  )
  SELECT
    b.id,
    pn.arr[ ((b.i - 1) % cardinality(pn.arr)) + 1 ]                                        AS name,
    CASE WHEN (b.i % 2)=0 THEN 'female' ELSE 'male' END                                     AS gender,
    'Perheellinen Suomessa. Pitää ulkoilusta ja tapahtumista.'                              AS about,
    ARRAY['Finnish']::text[]                                                                AS language_codes,
    'Helsinki'                                                                              AS address_city,
    60.1699 + (((b.i % 5) - 2) * 0.002)                                                     AS lat,
    24.9384 + (((b.i % 7) - 3) * 0.003)                                                     AS lon,
    (10 + (b.i % 21))::int                                                                  AS preferred_distance_km -- 10..30
  FROM batch_idx b
  CROSS JOIN fi_parent_names pn
  RETURNING user_id
)

-- Children (one per; allergies ALWAYS non-empty)
, insert_children AS (
  INSERT INTO children (
    user_id, name, birthday, gender, about_short,
    interests, activity_level, limitations, allergies, play_styles
  )
  SELECT
    b.id,
    cn.arr[ ((b.i - 1) % cardinality(cn.arr)) + 1 ]                                        AS child_name,
    (DATE '2018-01-01' + ((b.i * 37) % 2191)::int)                                          AS birthday, -- 2018..2023
    CASE WHEN (b.i % 2)=0 THEN 'male' ELSE 'female' END                                     AS gender,
    'Utelias ja ystävällinen.'                                                              AS about_short,
    ARRAY[
      ip.arr[ ((b.i    ) % cardinality(ip.arr)) + 1 ],
      ip.arr[ ((b.i + 3) % cardinality(ip.arr)) + 1 ]
    ]::text[]                                                                               AS interests,
    CASE (b.i % 3) WHEN 0 THEN 'high' WHEN 1 THEN 'medium' ELSE 'low' END                   AS activity_level,
    CASE (b.i % 6)                                                                          -- limitations can be empty
      WHEN 0 THEN ARRAY['gluten_free']::text[]
      WHEN 1 THEN ARRAY['lactose_intolerant']::text[]
      WHEN 2 THEN ARRAY['peanut']::text[]
      WHEN 3 THEN ARRAY['egg']::text[]
      WHEN 4 THEN ARRAY['pollen']::text[]
      ELSE ARRAY[]::text[]
    END                                                                                     AS limitations,
    CASE (b.i % 4)                                                                          -- allergies ALWAYS non-empty
      WHEN 0 THEN ARRAY['none']::text[]
      WHEN 1 THEN ARRAY['peanut']::text[]
      WHEN 2 THEN ARRAY['lactose']::text[]
      ELSE ARRAY['pollen','dust']::text[]
    END                                                                                     AS allergies,
    ARRAY[
      ps.arr[ ((b.i    ) % cardinality(ps.arr)) + 1 ],
      ps.arr[ ((b.i + 2) % cardinality(ps.arr)) + 1 ]
    ]::text[]                                                                               AS play_styles
  FROM batch_idx b
  CROSS JOIN fi_child_names cn
  CROSS JOIN interests_pool ip
  CROSS JOIN play_styles_pool ps
  RETURNING user_id
)

-- Preferences (defaults only)
INSERT INTO matching_preferences (user_id)
SELECT user_id FROM insert_children
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
