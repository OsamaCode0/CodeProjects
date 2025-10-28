-- User 1: Alice
INSERT INTO users (id, email, password_hash) 
VALUES ('11111111-1111-1111-1111-111111111111', 'alice@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO parent_profiles (user_id, name, gender, about, languages, address_city, lat, lon, preferred_distance_km)
VALUES ('11111111-1111-1111-1111-111111111111', 'Alice', 'female', 'Parent from Helsinki', 
        ARRAY['Finnish', 'English'], 'Helsinki', 60.1699, 24.9384, 50)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO children (user_id, name, birthday, gender, about_short, interests, activity_level, allergies, play_styles)
VALUES ('11111111-1111-1111-1111-111111111111', 'Emma', '2020-01-01', 'female', 
        'Loves playing outdoors', ARRAY['drawing', 'music', 'reading'], 'high', 
        ARRAY['none'], ARRAY['cooperative', 'creative'])
ON CONFLICT (user_id) DO NOTHING;

-- User 2: Bob (VERY SIMILAR)
INSERT INTO users (id, email, password_hash) 
VALUES ('22222222-2222-2222-2222-222222222222', 'bob@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO parent_profiles (user_id, name, gender, about, languages, address_city, lat, lon, preferred_distance_km)
VALUES ('22222222-2222-2222-2222-222222222222', 'Bob', 'male', 'Parent from Helsinki', 
        ARRAY['Finnish', 'English'], 'Helsinki', 60.1750, 24.9400, 50)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO children (user_id, name, birthday, gender, about_short, interests, activity_level, allergies, play_styles)
VALUES ('22222222-2222-2222-2222-222222222222', 'Oliver', '2020-03-01', 'male', 
        'Loves arts and crafts', ARRAY['drawing', 'music', 'lego'], 'high', 
        ARRAY['none'], ARRAY['cooperative', 'creative'])
ON CONFLICT (user_id) DO NOTHING;