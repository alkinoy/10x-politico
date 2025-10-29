-- ============================================================================
-- Seed Data for SpeechKarma MVP
-- Created: 2025-10-29
-- Description: Populates the database with sample data for testing and development
-- ============================================================================

-- ============================================================================
-- PARTIES
-- ============================================================================
-- Insert common US political parties with their branding colors

INSERT INTO parties (id, name, abbreviation, description, color_hex) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Democratic Party', 'DEM', 'One of the two major political parties in the United States', '#0015BC'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Republican Party', 'REP', 'One of the two major political parties in the United States', '#E81B23'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Independent', 'IND', 'Politicians not affiliated with any major party', '#808080'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Libertarian Party', 'LIB', 'Third party advocating for limited government', '#FED105'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Green Party', 'GRN', 'Third party focused on environmentalism and social justice', '#17AA5C')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PROFILES (Test Users)
-- ============================================================================
-- Create test user profiles directly in auth.users and profiles tables
-- These are development-only users for testing the application

-- Note: In production, users are created via Supabase Auth signup
-- For local development, we manually insert test users

-- Insert test users into auth.users (Supabase Auth table)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'alice@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Alice Johnson"}',
    false,
    'authenticated'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'bob@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Bob Smith"}',
    false,
    'authenticated'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'carol@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Carol Davis"}',
    false,
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profiles
-- Note: The trigger handle_new_user() would normally create these automatically
-- but since we're inserting directly into auth.users, we need to create profiles manually

INSERT INTO profiles (id, display_name, is_admin) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alice Johnson', false),
  ('22222222-2222-2222-2222-222222222222', 'Bob Smith', false),
  ('33333333-3333-3333-3333-333333333333', 'Carol Davis', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLITICIANS
-- ============================================================================
-- Sample politicians from various parties

INSERT INTO politicians (id, first_name, last_name, party_id, biography) VALUES
  (
    '50de2371-e1e2-4c9c-b1c8-4d44799b2e8c',
    'Elizabeth',
    'Warren',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'U.S. Senator from Massachusetts, former Harvard Law professor, and advocate for consumer protection.'
  ),
  (
    '60ef3482-f2f3-5dad-c2c9-5e55800c3f9d',
    'Ted',
    'Cruz',
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'U.S. Senator from Texas, former Solicitor General of Texas, known for constitutional advocacy.'
  ),
  (
    '70fa4593-03f4-6ebe-d3da-6f66911d40ae',
    'Bernie',
    'Sanders',
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'U.S. Senator from Vermont, independent democratic socialist, advocate for progressive policies.'
  ),
  (
    '80fb5604-14f5-7fcf-e4eb-708702ee51bf',
    'Alexandria',
    'Ocasio-Cortez',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'U.S. Representative from New York, youngest woman ever elected to Congress, progressive activist.'
  ),
  (
    '90fc6715-25f6-8fd0-f5fc-81981ff62c0e',
    'Ron',
    'DeSantis',
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'Governor of Florida, former U.S. Representative, Navy veteran.'
  ),
  (
    'a0fd7826-36f7-9fe1-06fd-929920f73d1f',
    'Kamala',
    'Harris',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Vice President of the United States, former U.S. Senator from California, former Attorney General of California.'
  ),
  (
    'b0fe8937-47f8-0ff2-17fe-a3aa31f84e20',
    'Marco',
    'Rubio',
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'U.S. Senator from Florida, former Speaker of the Florida House of Representatives.'
  ),
  (
    'c0ff9a48-58f9-1003-28ff-b4bb42f95f31',
    'Pete',
    'Buttigieg',
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'U.S. Secretary of Transportation, former Mayor of South Bend, Indiana, military veteran.'
  )
ON CONFLICT (first_name, last_name, party_id) DO NOTHING;

-- ============================================================================
-- STATEMENTS
-- ============================================================================
-- Sample political statements from various politicians at different times

INSERT INTO statements (
  politician_id,
  statement_text,
  statement_timestamp,
  created_by_user_id,
  created_at
) VALUES
  -- Elizabeth Warren statements
  (
    '50de2371-e1e2-4c9c-b1c8-4d44799b2e8c',
    'The economy is working great for those at the top, but it''s not working for everyone else. We need to make sure that everyone has a chance to succeed.',
    now() - interval '2 days',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '2 days'
  ),
  (
    '50de2371-e1e2-4c9c-b1c8-4d44799b2e8c',
    'I have a plan for that. We can afford to invest in our future if we ask the wealthiest Americans to pay their fair share in taxes.',
    now() - interval '5 days',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '5 days'
  ),
  (
    '50de2371-e1e2-4c9c-b1c8-4d44799b2e8c',
    'Healthcare is a human right, not a privilege. Medicare for All would provide comprehensive coverage to every American.',
    now() - interval '10 days',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '10 days'
  ),
  
  -- Ted Cruz statements
  (
    '60ef3482-f2f3-5dad-c2c9-5e55800c3f9d',
    'We need to defend the Constitution and protect our Second Amendment rights. The right to bear arms shall not be infringed.',
    now() - interval '1 day',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '1 day'
  ),
  (
    '60ef3482-f2f3-5dad-c2c9-5e55800c3f9d',
    'Big Tech censorship is a threat to free speech. We must protect the rights of conservatives to speak freely on social media platforms.',
    now() - interval '4 days',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '4 days'
  ),
  
  -- Bernie Sanders statements
  (
    '70fa4593-03f4-6ebe-d3da-6f66911d40ae',
    'Billionaires should not exist. We need a political revolution to take on the greed of the billionaire class and create a government that works for all.',
    now() - interval '3 days',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '3 days'
  ),
  (
    '70fa4593-03f4-6ebe-d3da-6f66911d40ae',
    'The minimum wage must be raised to $15 an hour. Nobody working 40 hours a week should be living in poverty.',
    now() - interval '7 days',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '7 days'
  ),
  (
    '70fa4593-03f4-6ebe-d3da-6f66911d40ae',
    'Climate change is the existential crisis of our time. We need a Green New Deal to transform our energy system and create millions of good-paying jobs.',
    now() - interval '15 days',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '15 days'
  ),
  
  -- Alexandria Ocasio-Cortez statements
  (
    '80fb5604-14f5-7fcf-e4eb-708702ee51bf',
    'We need to tax the rich. When you make $10 million in one year, your 10 millionth dollar should be taxed at a much higher rate.',
    now() - interval '6 hours',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '6 hours'
  ),
  (
    '80fb5604-14f5-7fcf-e4eb-708702ee51bf',
    'The Green New Deal is about creating millions of good-paying jobs while transitioning to renewable energy. It''s an investment in our future.',
    now() - interval '8 days',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '8 days'
  ),
  
  -- Ron DeSantis statements
  (
    '90fc6715-25f6-8fd0-f5fc-81981ff62c0e',
    'Florida is a free state. We will not allow government mandates to restrict the freedoms of our citizens.',
    now() - interval '12 hours',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '12 hours'
  ),
  (
    '90fc6715-25f6-8fd0-f5fc-81981ff62c0e',
    'We must keep critical race theory out of our schools. We will not teach our children to hate their country.',
    now() - interval '6 days',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '6 days'
  ),
  
  -- Kamala Harris statements
  (
    'a0fd7826-36f7-9fe1-06fd-929920f73d1f',
    'We must pass the John Lewis Voting Rights Act to protect the sacred right to vote and ensure every American can participate in our democracy.',
    now() - interval '1 hour',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '1 hour'
  ),
  (
    'a0fd7826-36f7-9fe1-06fd-929920f73d1f',
    'Our administration is committed to building back better and creating an economy that works for working families, not just those at the top.',
    now() - interval '9 days',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '9 days'
  ),
  
  -- Marco Rubio statements
  (
    'b0fe8937-47f8-0ff2-17fe-a3aa31f84e20',
    'Communist regimes around the world must be held accountable. We will stand with the people of Cuba and Venezuela in their fight for freedom.',
    now() - interval '3 hours',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '3 hours'
  ),
  (
    'b0fe8937-47f8-0ff2-17fe-a3aa31f84e20',
    'China is the greatest geopolitical threat facing America. We need to take decisive action to counter their economic and military aggression.',
    now() - interval '11 days',
    '22222222-2222-2222-2222-222222222222',
    now() - interval '11 days'
  ),
  
  -- Pete Buttigieg statements
  (
    'c0ff9a48-58f9-1003-28ff-b4bb42f95f31',
    'Infrastructure is not just about roads and bridges. It''s about connecting communities and creating opportunities for all Americans.',
    now() - interval '18 hours',
    '33333333-3333-3333-3333-333333333333',
    now() - interval '18 hours'
  ),
  (
    'c0ff9a48-58f9-1003-28ff-b4bb42f95f31',
    'We must invest in electric vehicles and charging infrastructure to combat climate change and create good-paying jobs in the clean energy sector.',
    now() - interval '13 days',
    '11111111-1111-1111-1111-111111111111',
    now() - interval '13 days'
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Display summary of seeded data

DO $$
DECLARE
  party_count INTEGER;
  profile_count INTEGER;
  politician_count INTEGER;
  statement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO party_count FROM parties;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO politician_count FROM politicians;
  SELECT COUNT(*) INTO statement_count FROM statements WHERE deleted_at IS NULL;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Database seeding completed successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Parties: %', party_count;
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Politicians: %', politician_count;
  RAISE NOTICE 'Statements: %', statement_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Test Users:';
  RAISE NOTICE '  - alice@example.com (password: password123)';
  RAISE NOTICE '  - bob@example.com (password: password123)';
  RAISE NOTICE '  - carol@example.com (password: password123, admin)';
  RAISE NOTICE '============================================';
END $$;

