-- ====================================================================
-- Seed: seed.sql
-- StayDirect — Phase 2: Seed Demo Data for Pune Hostels & PGs
-- Note: Clearly labeled as demo/sample listings for development.
-- ====================================================================

-- 1. SEED AMENITIES
INSERT INTO public.amenities (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'High-speed Wi-Fi'),
  ('a0000000-0000-0000-0000-000000000002', 'Daily Meals (Mess)'),
  ('a0000000-0000-0000-0000-000000000003', 'Air Conditioning (AC)'),
  ('a0000000-0000-0000-0000-000000000004', '24/7 CCTV & Security'),
  ('a0000000-0000-0000-0000-000000000005', 'Washing Machine'),
  ('a0000000-0000-0000-0000-000000000006', 'Power Backup (Inverter)'),
  ('a0000000-0000-0000-0000-000000000007', 'RO Water Purifier'),
  ('a0000000-0000-0000-0000-000000000008', 'Attached Washroom'),
  ('a0000000-0000-0000-0000-000000000009', 'Study Desk & Chair'),
  ('a0000000-0000-0000-0000-000000000010', 'Biometric Access')
ON CONFLICT (name) DO NOTHING;

-- 2. CREATE DEMO OWNER PROFILE IF NOT EXISTS (Using a deterministic UUID for demo data)
-- In production, owners sign up through Supabase Auth.
INSERT INTO public.profiles (id, role, full_name, phone, city, is_verified, college_or_company)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'owner', 'Suresh Deshmukh (Demo Owner)', '+919890123456', 'Pune', true, 'Deshmukh Hostels Pune'),
  ('00000000-0000-0000-0000-000000000002', 'owner', 'Sunita Patil (Demo Owner)', '+919822012345', 'Pune', true, 'Patil Girls Stays'),
  ('00000000-0000-0000-0000-000000000003', 'owner', 'Anand Kadam (Demo Owner)', '+919765432109', 'Pune', true, 'GreenView Co-living')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- 3. SEED DEMO HOSTELS (Explicitly marked published for local development testing)
INSERT INTO public.hostels (
  id,
  owner_id,
  name,
  description,
  city,
  area,
  address,
  latitude,
  longitude,
  monthly_rent,
  security_deposit,
  gender_preference,
  verification_status,
  is_published
) VALUES
  (
    'h0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '[Demo] TechPark Scholars PG — Hinjewadi',
    'Demonstration listing: Modern student PG located 500m from Hinjewadi Phase 1 circle. High-speed Wi-Fi, 3 times hygienic food, power backup, and zero brokerage direct from owner.',
    'Pune',
    'Hinjewadi',
    'Near Blue Ridge Township, Hinjewadi Phase 1, Pune 411057',
    18.5912,
    73.7389,
    8500,
    8500,
    'boys',
    'verified',
    true
  ),
  (
    'h0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '[Demo] Savitribai Phule Girls Residency — Kothrud',
    'Demonstration listing: Premier girls hostel in Kothrud, just 350 meters from MIT World Peace University. Biometric entrance, female warden 24/7, study desks in every room.',
    'Pune',
    'Kothrud',
    'Near Paud Road, Opposite MIT Circle, Kothrud, Pune 411038',
    18.5074,
    73.8077,
    9200,
    10000,
    'girls',
    'verified',
    true
  ),
  (
    'h0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '[Demo] GreenView Co-Living Spaces — Wakad',
    'Demonstration listing: Co-ed independent student & intern apartments with cafeteria, gaming lounge, gym, and shuttle bus to major coaching hubs in Wakad and Hinjewadi.',
    'Pune',
    'Wakad',
    'Dange Chowk Road, Wakad, Pune 411057',
    18.5987,
    73.7634,
    7800,
    8000,
    'co-ed',
    'verified',
    true
  ),
  (
    'h0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '[Demo] Viman Royal Student Heights — Viman Nagar',
    'Demonstration listing: Walking distance to Symbiosis International School of Economics and Design. Clean air-conditioned rooms, laundry service, study library, and CCTV.',
    'Pune',
    'Viman Nagar',
    'Near Phoenix Market City, Viman Nagar, Pune 411014',
    18.5679,
    73.9143,
    10500,
    10500,
    'girls',
    'verified',
    true
  ),
  (
    'h0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    '[Demo] Baner Hillview Executive Hostel — Baner',
    'Demonstration listing: Quiet residential environment next to Baner Pashan Link Road. Fast Wi-Fi, attached bathrooms with hot water geyser, and healthy breakfast included.',
    'Pune',
    'Baner',
    'Baner-Pashan Link Road, Baner, Pune 411045',
    18.5590,
    73.7868,
    8900,
    9000,
    'boys',
    'verified',
    true
  ),
  (
    'h0000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000002',
    '[Demo] Kharadi IT & Student PG — Kharadi',
    'Demonstration listing: Budget-friendly and clean PG near EON IT Park and World Trade Center. 24/7 security, high-speed fiber internet, and twin/triple sharing options.',
    'Pune',
    'Kharadi',
    'Near EON Free Zone, Kharadi, Pune 411014',
    18.5529,
    73.9531,
    7200,
    7000,
    'co-ed',
    'pending',
    false -- Kept unpublished demo listing
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_rent = EXCLUDED.monthly_rent,
  is_published = EXCLUDED.is_published;

-- 4. SEED HOSTEL IMAGES
INSERT INTO public.hostel_images (hostel_id, storage_path, sort_order) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80', 0),
  ('h0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&auto=format&fit=crop&q=80', 1),
  ('h0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80', 0),
  ('h0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80', 1),
  ('h0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80', 0),
  ('h0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=900&auto=format&fit=crop&q=80', 0),
  ('h0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=80', 0)
ON CONFLICT DO NOTHING;

-- 5. SEED ROOMS
INSERT INTO public.rooms (hostel_id, room_type, monthly_rent, total_beds, available_beds) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'Single Room', 14000, 5, 1),
  ('h0000000-0000-0000-0000-000000000001', 'Twin Sharing', 9500, 16, 3),
  ('h0000000-0000-0000-0000-000000000001', 'Triple Sharing', 8500, 9, 2),
  ('h0000000-0000-0000-0000-000000000002', 'Twin Sharing', 11000, 14, 2),
  ('h0000000-0000-0000-0000-000000000002', 'Triple Sharing', 9200, 10, 1),
  ('h0000000-0000-0000-0000-000000000003', 'Twin Sharing', 9500, 20, 4),
  ('h0000000-0000-0000-0000-000000000003', 'Triple Sharing', 7800, 20, 2),
  ('h0000000-0000-0000-0000-000000000004', 'Single Room', 16000, 4, 1),
  ('h0000000-0000-0000-0000-000000000004', 'Twin Sharing', 10500, 16, 2),
  ('h0000000-0000-0000-0000-000000000005', 'Twin Sharing', 8900, 12, 3)
ON CONFLICT DO NOTHING;

-- 6. SEED HOSTEL AMENITIES JUNCTION
INSERT INTO public.hostel_amenities (hostel_id, amenity_id) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
  ('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'),
  ('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006'),
  ('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
  ('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002'),
  ('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000009'),
  ('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010'),
  ('h0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001'),
  ('h0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005'),
  ('h0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
  ('h0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;
