BEGIN;

WITH
seq AS (
  SELECT generate_series(1,50) AS i
),

-- 1) Users (deterministic emails; placeholder hash)
new_users AS (
  INSERT INTO users (email, password_hash)
   SELECT 'user_' || to_char(i, 'FM00') || '@match.me', '!devseed!'
  FROM seq
  RETURNING id, email
),

-- Stable index i for each inserted user
users_i AS (
  SELECT id, email, row_number() OVER (ORDER BY email) AS i
  FROM new_users
),

-- Lookup arrays
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
fi_cities AS (
  SELECT * FROM (VALUES
    (1,'Helsinki',60.1699,24.9384)
  ) AS t(idx, city, lat, lon)
),
interests_pool AS (
  SELECT ARRAY['lego','books','music','dance','football','basketball','puzzle','drawing','coding','nature'] AS arr
),
play_styles_pool AS (
  SELECT ARRAY['active','calm','creative','outdoor','team','imaginative'] AS arr
)

-- 2) Parents  (RETURN only user_id; no 'i' here)
, insert_parents AS (
  INSERT INTO parent_profiles (
    user_id, name, gender, about, languages,
    address_city, lat, lon, preferred_distance_km
  )
  SELECT
    u.id,
    pn.arr[ ((u.i - 1) % cardinality(pn.arr)) + 1 ]                                           AS name,
    CASE WHEN (u.i % 2)=0 THEN 'female' ELSE 'male' END                                        AS gender,
    'Perheellinen Suomessa. Pitää ulkoilusta ja tapahtumista.'                                 AS about,
    ARRAY['Finnish']::text[]
      || CASE WHEN (u.i % 3)=0 THEN ARRAY['English']::text[] ELSE ARRAY[]::text[] END
      || CASE WHEN (u.i % 5)=0 THEN ARRAY['Swedish']::text[] ELSE ARRAY[]::text[] END         AS languages,
    c.city                                                                                     AS address_city,
    c.lat + (((u.i % 5) - 2) * 0.002)                                                          AS lat,
    c.lon + (((u.i % 7) - 3) * 0.003)                                                          AS lon,
    5 + (u.i % 26)                                                                              AS preferred_distance_km
  FROM users_i u
  CROSS JOIN fi_parent_names pn
  JOIN fi_cities c
    ON c.idx = ((u.i - 1) % (SELECT max(idx) FROM fi_cities)) + 1
  RETURNING user_id
)

-- 3) Children (join back to users_i to get i)
, insert_children AS (
  INSERT INTO children (
    user_id, name, birthday, gender, about_short,
    interests, activity_level, limitations, allergies, play_styles
  )
  SELECT
    p.user_id,
    cn.arr[ ((u.i - 1) % cardinality(cn.arr)) + 1 ]                                           AS child_name,
   (DATE '2018-01-01' + ((u.i * 37) % 2191)::int)                                      AS birthday, -- 2018..2023
    CASE WHEN (u.i % 2)=0 THEN 'boy' ELSE 'girl' END                                        AS gender,
    'Utelias ja ystävällinen.'                                                                 AS about_short,
    ARRAY[
      ip.arr[ ((u.i    ) % cardinality(ip.arr)) + 1 ],
      ip.arr[ ((u.i + 3) % cardinality(ip.arr)) + 1 ]
    ]::text[]                                                                                  AS interests,
    CASE (u.i % 3) WHEN 0 THEN 'high' WHEN 1 THEN 'medium' ELSE 'low' END                      AS activity_level,
    -- limitations can be empty
    CASE (u.i % 6)
      WHEN 0 THEN ARRAY['gluten_free']::text[]
      WHEN 1 THEN ARRAY['lactose_intolerant']::text[]
      WHEN 2 THEN ARRAY['peanut']::text[]
      WHEN 3 THEN ARRAY['egg']::text[]
      WHEN 4 THEN ARRAY['pollen']::text[]
      ELSE ARRAY[]::text[]
    END                                                                                        AS limitations,
    -- allergies ALWAYS non-empty
    CASE (u.i % 4)
      WHEN 0 THEN ARRAY['none']::text[]
      WHEN 1 THEN ARRAY['peanut']::text[]
      WHEN 2 THEN ARRAY['lactose']::text[]
      ELSE ARRAY['pollen','dust']::text[]
    END                                                                                        AS allergies,
    ARRAY[
      ps.arr[ ((u.i    ) % cardinality(ps.arr)) + 1 ],
      ps.arr[ ((u.i + 2) % cardinality(ps.arr)) + 1 ]
    ]::text[]                                                                                  AS play_styles
  FROM insert_parents p
  JOIN users_i u ON u.id = p.user_id
  CROSS JOIN fi_child_names cn
  CROSS JOIN interests_pool ip
  CROSS JOIN play_styles_pool ps
  RETURNING user_id
)

-- 4) Matching preferences (only user_id; defaults do the rest)
INSERT INTO matching_preferences (user_id)
SELECT user_id FROM insert_children
ON CONFLICT (user_id) DO NOTHING;

COMMIT;