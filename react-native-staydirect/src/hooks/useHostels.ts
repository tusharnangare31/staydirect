import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Hostel, HostelImage, Room, Amenity } from '../types/database.types';

// Fallback seed data in case Supabase credentials have not yet been linked
export const FALLBACK_HOSTELS: Hostel[] = [
  {
    id: 'h-hinjewadi-1',
    owner_id: 'owner-1',
    name: 'TechPark Executive Scholars PG',
    description: 'Modern student and tech professional PG located 500m from Hinjewadi Phase 1 circle. High-speed 300 Mbps Wi-Fi, 3 times nutritious Maharashtrian & North Indian food, daily housekeeping, and zero brokerage direct from owner Suresh Deshmukh.',
    area: 'Hinjewadi',
    city: 'Pune',
    address: 'Near Blue Ridge Township, Hinjewadi Phase 1, Pune 411057',
    nearby_college: 'Symbiosis SCIT / IIMS Pune',
    distance_to_college: '1.2 km to Symbiosis SCIT',
    latitude: 18.5912,
    longitude: 73.7389,
    monthly_rent_min: 8500,
    monthly_rent_max: 14000,
    security_deposit: 8500,
    gender_preference: 'boys',
    is_available: true,
    total_beds: 30,
    available_beds: 4,
    verification_status: 'verified',
    rating: 4.8,
    review_count: 52,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img-1', hostel_id: 'h-hinjewadi-1', image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80', is_cover: true, display_order: 1, created_at: '' },
      { id: 'img-2', hostel_id: 'h-hinjewadi-1', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&auto=format&fit=crop&q=80', is_cover: false, display_order: 2, created_at: '' },
    ],
    rooms: [
      { id: 'r1', hostel_id: 'h-hinjewadi-1', sharing_type: 'Single Room (Private)', monthly_rent: 14000, deposit: 14000, total_capacity: 1, vacant_beds: 1, has_ac: true, has_attached_washroom: true, created_at: '' },
      { id: 'r2', hostel_id: 'h-hinjewadi-1', sharing_type: 'Double Sharing', monthly_rent: 9500, deposit: 9500, total_capacity: 2, vacant_beds: 2, has_ac: true, has_attached_washroom: true, created_at: '' },
      { id: 'r3', hostel_id: 'h-hinjewadi-1', sharing_type: 'Triple Sharing', monthly_rent: 8500, deposit: 8500, total_capacity: 3, vacant_beds: 1, has_ac: false, has_attached_washroom: true, created_at: '' },
    ],
    amenities: [
      { id: 'a1', hostel_id: 'h-hinjewadi-1', name: 'High-speed 300Mbps Wi-Fi', icon: 'wifi', created_at: '' },
      { id: 'a2', hostel_id: 'h-hinjewadi-1', name: '3 Times Daily Meals (Mess)', icon: 'restaurant', created_at: '' },
      { id: 'a3', hostel_id: 'h-hinjewadi-1', name: '24/7 CCTV & Security Guard', icon: 'shield-checkmark', created_at: '' },
      { id: 'a4', hostel_id: 'h-hinjewadi-1', name: 'Power Backup (Inverter)', icon: 'flash', created_at: '' },
      { id: 'a5', hostel_id: 'h-hinjewadi-1', name: 'RO Drinking Water', icon: 'water', created_at: '' },
      { id: 'a6', hostel_id: 'h-hinjewadi-1', name: 'Automated Washing Machine', icon: 'shirt', created_at: '' },
    ],
    owner: {
      id: 'owner-1',
      role: 'owner',
      full_name: 'Suresh Deshmukh',
      phone: '+919890123456',
      city: 'Pune',
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'h-kothrud-2',
    owner_id: 'owner-2',
    name: 'Savitribai Phule Girls Residency',
    description: 'Premier girls hostel in Kothrud, just 350 meters from MIT World Peace University. Biometric entrance, female warden 24/7, study desks in every room, and safe family-run zero brokerage accommodation.',
    area: 'Kothrud',
    city: 'Pune',
    address: 'Near Paud Road, Opposite MIT Circle, Kothrud, Pune 411038',
    nearby_college: 'MIT WPU / Cummins College',
    distance_to_college: '350m to MIT World Peace University',
    latitude: 18.5074,
    longitude: 73.8077,
    monthly_rent_min: 9200,
    monthly_rent_max: 13500,
    security_deposit: 10000,
    gender_preference: 'girls',
    is_available: true,
    total_beds: 24,
    available_beds: 3,
    verification_status: 'verified',
    rating: 4.9,
    review_count: 68,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img-3', hostel_id: 'h-kothrud-2', image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80', is_cover: true, display_order: 1, created_at: '' },
      { id: 'img-4', hostel_id: 'h-kothrud-2', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80', is_cover: false, display_order: 2, created_at: '' },
    ],
    rooms: [
      { id: 'r4', hostel_id: 'h-kothrud-2', sharing_type: 'Double Sharing', monthly_rent: 11000, deposit: 10000, total_capacity: 2, vacant_beds: 2, has_ac: true, has_attached_washroom: true, created_at: '' },
      { id: 'r5', hostel_id: 'h-kothrud-2', sharing_type: 'Triple Sharing', monthly_rent: 9200, deposit: 10000, total_capacity: 3, vacant_beds: 1, has_ac: false, has_attached_washroom: true, created_at: '' },
    ],
    amenities: [
      { id: 'a7', hostel_id: 'h-kothrud-2', name: 'Biometric Access Control', icon: 'finger-print', created_at: '' },
      { id: 'a8', hostel_id: 'h-kothrud-2', name: '24/7 Female Warden on Premises', icon: 'person', created_at: '' },
      { id: 'a9', hostel_id: 'h-kothrud-2', name: 'Pure Veg Home-Cooked Food', icon: 'restaurant', created_at: '' },
      { id: 'a10', hostel_id: 'h-kothrud-2', name: 'High-speed Wi-Fi', icon: 'wifi', created_at: '' },
      { id: 'a11', hostel_id: 'h-kothrud-2', name: 'Dedicated Quiet Study Hall', icon: 'book', created_at: '' },
    ],
    owner: {
      id: 'owner-2',
      role: 'owner',
      full_name: 'Sunita Patil',
      phone: '+919822012345',
      city: 'Pune',
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'h-wakad-3',
    owner_id: 'owner-3',
    name: 'GreenView Co-Living Spaces',
    description: 'Co-ed independent student & intern apartments with cafeteria, gaming lounge, gym, and shuttle bus to major coaching hubs in Wakad and Hinjewadi.',
    area: 'Wakad',
    city: 'Pune',
    address: 'Dange Chowk Road, Wakad, Pune 411057',
    nearby_college: 'Indira College of Engineering & Management',
    distance_to_college: '800m to Indira College Wakad',
    latitude: 18.5987,
    longitude: 73.7634,
    monthly_rent_min: 7800,
    monthly_rent_max: 12500,
    security_deposit: 8000,
    gender_preference: 'co-ed',
    is_available: true,
    total_beds: 40,
    available_beds: 6,
    verification_status: 'verified',
    rating: 4.7,
    review_count: 41,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img-5', hostel_id: 'h-wakad-3', image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80', is_cover: true, display_order: 1, created_at: '' },
    ],
    rooms: [
      { id: 'r6', hostel_id: 'h-wakad-3', sharing_type: 'Twin Sharing', monthly_rent: 9500, deposit: 8000, total_capacity: 2, vacant_beds: 3, has_ac: true, has_attached_washroom: true, created_at: '' },
      { id: 'r7', hostel_id: 'h-wakad-3', sharing_type: 'Triple Sharing', monthly_rent: 7800, deposit: 8000, total_capacity: 3, vacant_beds: 3, has_ac: false, has_attached_washroom: true, created_at: '' },
    ],
    amenities: [
      { id: 'a12', hostel_id: 'h-wakad-3', name: 'High-speed Wi-Fi', icon: 'wifi', created_at: '' },
      { id: 'a13', hostel_id: 'h-wakad-3', name: 'Fitness Gym & Table Tennis', icon: 'fitness', created_at: '' },
      { id: 'a14', hostel_id: 'h-wakad-3', name: 'All-Day Cafeteria', icon: 'cafe', created_at: '' },
    ],
    owner: {
      id: 'owner-3',
      role: 'owner',
      full_name: 'Anand Kadam',
      phone: '+919765432109',
      city: 'Pune',
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'h-viman-4',
    owner_id: 'owner-4',
    name: 'Viman Royal Student Heights',
    description: 'Walking distance to Symbiosis International School of Economics and Design. Clean air-conditioned rooms, laundry service, study library, and CCTV.',
    area: 'Viman Nagar',
    city: 'Pune',
    address: 'Near Phoenix Market City, Viman Nagar, Pune 411014',
    nearby_college: 'Symbiosis International University',
    distance_to_college: '450m to Symbiosis Campus',
    latitude: 18.5679,
    longitude: 73.9143,
    monthly_rent_min: 10500,
    monthly_rent_max: 16000,
    security_deposit: 10500,
    gender_preference: 'girls',
    is_available: true,
    total_beds: 20,
    available_beds: 2,
    verification_status: 'verified',
    rating: 4.9,
    review_count: 59,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img-6', hostel_id: 'h-viman-4', image_url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=900&auto=format&fit=crop&q=80', is_cover: true, display_order: 1, created_at: '' },
    ],
    rooms: [
      { id: 'r8', hostel_id: 'h-viman-4', sharing_type: 'Single Room', monthly_rent: 16000, deposit: 10500, total_capacity: 1, vacant_beds: 1, has_ac: true, has_attached_washroom: true, created_at: '' },
      { id: 'r9', hostel_id: 'h-viman-4', sharing_type: 'Double Sharing', monthly_rent: 10500, deposit: 10500, total_capacity: 2, vacant_beds: 1, has_ac: true, has_attached_washroom: true, created_at: '' },
    ],
    amenities: [
      { id: 'a15', hostel_id: 'h-viman-4', name: 'High-speed Wi-Fi', icon: 'wifi', created_at: '' },
      { id: 'a16', hostel_id: 'h-viman-4', name: 'Air Conditioning (AC)', icon: 'snow', created_at: '' },
      { id: 'a17', hostel_id: 'h-viman-4', name: 'Attached Western Washrooms', icon: 'water', created_at: '' },
    ],
    owner: {
      id: 'owner-4',
      role: 'owner',
      full_name: 'Pooja Agarwal',
      phone: '+919823456789',
      city: 'Pune',
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
  },
];

export interface HostelFilters {
  area?: string;
  search?: string;
  gender?: 'all' | 'boys' | 'girls' | 'co-ed';
  maxRent?: number;
  sharingType?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export function useHostels(filters: HostelFilters = {}) {
  return useQuery({
    queryKey: ['hostels', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('hostels')
          .select(`
            *,
            images:hostel_images(*),
            rooms:rooms(*),
            amenities:amenities(*),
            owner:profiles(*)
          `);

        if (filters.area && filters.area !== 'All Pune') {
          query = query.ilike('area', `%${filters.area}%`);
        }

        if (filters.gender && filters.gender !== 'all') {
          query = query.eq('gender_preference', filters.gender);
        }

        if (filters.maxRent) {
          query = query.lte('monthly_rent_min', filters.maxRent);
        }

        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,area.ilike.%${filters.search}%,nearby_college.ilike.%${filters.search}%`);
        }

        if (filters.sortBy === 'price_asc') {
          query = query.order('monthly_rent_min', { ascending: true });
        } else if (filters.sortBy === 'price_desc') {
          query = query.order('monthly_rent_min', { ascending: false });
        } else if (filters.sortBy === 'rating') {
          query = query.order('rating', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          // Filter fallback data client-side for smooth offline experience
          return FALLBACK_HOSTELS.filter((h) => {
            const matchesArea = !filters.area || filters.area === 'All Pune' || h.area.toLowerCase().includes(filters.area.toLowerCase());
            const matchesGender = !filters.gender || filters.gender === 'all' || h.gender_preference === filters.gender;
            const matchesRent = !filters.maxRent || h.monthly_rent_min <= filters.maxRent;
            const matchesSearch = !filters.search ||
              h.name.toLowerCase().includes(filters.search.toLowerCase()) ||
              h.area.toLowerCase().includes(filters.search.toLowerCase()) ||
              (h.nearby_college && h.nearby_college.toLowerCase().includes(filters.search.toLowerCase()));
            return matchesArea && matchesGender && matchesRent && matchesSearch;
          });
        }
        return data as Hostel[];
      } catch (e) {
        console.warn('Using local hostels fallback:', e);
        return FALLBACK_HOSTELS;
      }
    },
  });
}

export function useHostelDetails(id: string) {
  return useQuery({
    queryKey: ['hostel', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('hostels')
          .select(`
            *,
            images:hostel_images(*),
            rooms:rooms(*),
            amenities:amenities(*),
            owner:profiles(*)
          `)
          .eq('id', id)
          .single();

        if (error || !data) {
          const fallback = FALLBACK_HOSTELS.find((h) => h.id === id) || FALLBACK_HOSTELS[0];
          return fallback;
        }
        return data as Hostel;
      } catch (e) {
        return FALLBACK_HOSTELS.find((h) => h.id === id) || FALLBACK_HOSTELS[0];
      }
    },
  });
}
