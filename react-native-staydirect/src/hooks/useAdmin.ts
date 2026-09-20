import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  AdminDashboardStats,
  OwnerVerification,
  AdminAction,
  Report,
  Hostel,
  Profile,
  Review,
  ReviewReport,
  ReviewStatus,
  ReviewReportStatus,
} from '../types/database.types';

// Fallback seed data for development & preview
export const FALLBACK_ADMIN_STATS: AdminDashboardStats = {
  total_students: 124,
  total_owners: 48,
  pending_owner_verifications: 2,
  pending_hostel_listings: 3,
  active_hostels: 35,
  open_reports: 2,
};

export const FALLBACK_VERIFICATIONS: OwnerVerification[] = [
  {
    id: 'v0000000-0000-0000-0000-000000000002',
    owner_id: '00000000-0000-0000-0000-000000000002',
    document_type: 'property_tax',
    document_path: '00000000-0000-0000-0000-000000000002/pmc_tax_receipt_kothrud.pdf',
    status: 'pending',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    owner: {
      id: '00000000-0000-0000-0000-000000000002',
      role: 'owner',
      full_name: 'Sunita Patil',
      phone: '+919822012345',
      city: 'Pune',
      is_verified: false,
      college_or_company: 'Patil Girls Stays & Hostels',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  },
  {
    id: 'v0000000-0000-0000-0000-000000000001',
    owner_id: '00000000-0000-0000-0000-000000000001',
    document_type: 'electricity_bill',
    document_path: '00000000-0000-0000-0000-000000000001/mseb_electricity_bill_hinjewadi.pdf',
    status: 'approved',
    reviewed_by: '00000000-0000-0000-0000-000000000099',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    owner: {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'owner',
      full_name: 'Suresh Deshmukh',
      phone: '+919890123456',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'Deshmukh Hostels Pune',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
  },
  {
    id: 'v0000000-0000-0000-0000-000000000003',
    owner_id: '00000000-0000-0000-0000-000000000003',
    document_type: 'aadhaar',
    document_path: '00000000-0000-0000-0000-000000000003/aadhaar_card_scan.jpg',
    status: 'rejected',
    reviewed_by: '00000000-0000-0000-0000-000000000099',
    rejection_reason:
      'Document photo was blurry and name does not match the Pune Municipal Corporation property tax record.',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    owner: {
      id: '00000000-0000-0000-0000-000000000003',
      role: 'owner',
      full_name: 'Anand Kadam',
      phone: '+919765432109',
      city: 'Pune',
      is_verified: false,
      college_or_company: 'GreenView Co-living',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  },
];

export const FALLBACK_REPORTS: Report[] = [
  {
    id: 'rep00000-0000-0000-0000-000000000001',
    reporter_id: '00000000-0000-0000-0000-000000000010',
    reported_user_id: '00000000-0000-0000-0000-000000000003',
    hostel_id: 'h0000000-0000-0000-0000-000000000003',
    reason: 'Incorrect rent',
    description:
      'Listing displays monthly rent as ₹7,800, but upon scheduling a visit the caretaker quoted ₹10,500 without electricity and demanded ₹500 gate pass fee.',
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    reporter: {
      id: '00000000-0000-0000-0000-000000000010',
      role: 'student',
      full_name: 'Rohan Sharma',
      phone: '+919811223344',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'COEP Tech University',
      created_at: '',
      updated_at: '',
    },
    reported_user: {
      id: '00000000-0000-0000-0000-000000000003',
      role: 'owner',
      full_name: 'Anand Kadam',
      phone: '+919765432109',
      city: 'Pune',
      is_verified: false,
      college_or_company: 'GreenView Co-living',
      created_at: '',
      updated_at: '',
    },
    hostel: {
      id: 'h0000000-0000-0000-0000-000000000003',
      owner_id: '00000000-0000-0000-0000-000000000003',
      name: 'GreenView Co-Living Spaces — Wakad',
      description: 'Co-ed independent student & intern apartments.',
      area: 'Wakad',
      city: 'Pune',
      address: 'Dange Chowk Road, Wakad, Pune 411057',
      latitude: 18.5987,
      longitude: 73.7634,
      monthly_rent: 7800,
      security_deposit: 8000,
      gender_preference: 'co-ed',
      verification_status: 'verified',
      is_published: true,
      created_at: '',
    },
  },
  {
    id: 'rep00000-0000-0000-0000-000000000002',
    reporter_id: '00000000-0000-0000-0000-000000000011',
    reported_user_id: '00000000-0000-0000-0000-000000000001',
    hostel_id: 'h0000000-0000-0000-0000-000000000004',
    reason: 'Fraudulent listing',
    description: 'Photos shown appear to be from a hotel in Mumbai rather than Viman Nagar campus.',
    status: 'investigating',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reporter: {
      id: '00000000-0000-0000-0000-000000000011',
      role: 'student',
      full_name: 'Priya Deshpande',
      phone: '+919855667788',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'MIT World Peace University',
      created_at: '',
      updated_at: '',
    },
    hostel: {
      id: 'h0000000-0000-0000-0000-000000000004',
      owner_id: '00000000-0000-0000-0000-000000000001',
      name: 'Viman Royal Student Heights',
      description: 'Walking distance to Symbiosis International campus.',
      area: 'Viman Nagar',
      city: 'Pune',
      address: 'Near Phoenix Market City, Viman Nagar, Pune 411014',
      latitude: 18.5679,
      longitude: 73.9143,
      monthly_rent: 10500,
      security_deposit: 10500,
      gender_preference: 'girls',
      verification_status: 'verified',
      is_published: true,
      created_at: '',
    },
  },
];

export const FALLBACK_ADMIN_ACTIONS: AdminAction[] = [
  {
    id: 'act00000-0000-0000-0000-000000000001',
    admin_id: '00000000-0000-0000-0000-000000000099',
    action_type: 'approve_owner',
    target_id: '00000000-0000-0000-0000-000000000001',
    reason: 'Verified electricity meter bill and owner contact credentials.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    admin: {
      id: '00000000-0000-0000-0000-000000000099',
      role: 'admin',
      full_name: 'StayDirect Super Admin',
      city: 'Pune',
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'act00000-0000-0000-0000-000000000002',
    admin_id: '00000000-0000-0000-0000-000000000099',
    action_type: 'approve_listing',
    target_id: 'h0000000-0000-0000-0000-000000000001',
    reason: 'Hostel photos and college distance checked against Pune GIS data.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    admin: {
      id: '00000000-0000-0000-0000-000000000099',
      role: 'admin',
      full_name: 'StayDirect Super Admin',
      city: 'Pune',
      is_verified: true,
      created_at: '',
      updated_at: '',
    },
  },
];

export const FALLBACK_USERS: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    role: 'owner',
    full_name: 'Suresh Deshmukh',
    phone: '+919890123456',
    city: 'Pune',
    is_verified: true,
    is_suspended: false,
    college_or_company: 'Deshmukh Hostels Pune',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    role: 'owner',
    full_name: 'Sunita Patil',
    phone: '+919822012345',
    city: 'Pune',
    is_verified: false,
    is_suspended: false,
    college_or_company: 'Patil Girls Stays & Hostels',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    role: 'owner',
    full_name: 'Anand Kadam',
    phone: '+919765432109',
    city: 'Pune',
    is_verified: false,
    is_suspended: false,
    college_or_company: 'GreenView Co-living',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    role: 'student',
    full_name: 'Rohan Sharma',
    phone: '+919811223344',
    city: 'Pune',
    is_verified: true,
    is_suspended: false,
    college_or_company: 'COEP Tech University (Computer Science)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    role: 'student',
    full_name: 'Priya Deshpande',
    phone: '+919855667788',
    city: 'Pune',
    is_verified: true,
    is_suspended: false,
    college_or_company: 'MIT World Peace University (Design)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    role: 'student',
    full_name: 'Aditya Kulkarni',
    phone: '+919877889900',
    city: 'Pune',
    is_verified: false,
    is_suspended: false,
    college_or_company: 'PICT Pune (IT Engineering)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

export const FALLBACK_MODERATION_HOSTELS: Hostel[] = [
  {
    id: 'h0000000-0000-0000-0000-000000000001',
    owner_id: '00000000-0000-0000-0000-000000000001',
    name: 'TechPark Scholars PG — Hinjewadi',
    description:
      'Modern student PG located 500m from Hinjewadi Phase 1 circle. High-speed Wi-Fi, 3 meals daily, and zero brokerage direct from owner.',
    area: 'Hinjewadi',
    city: 'Pune',
    address: 'Near Blue Ridge Township, Hinjewadi Phase 1, Pune 411057',
    nearby_college: 'Symbiosis SCIT / IIMS',
    distance_to_college: '1.2 km',
    latitude: 18.5912,
    longitude: 73.7389,
    monthly_rent: 8500,
    monthly_rent_min: 8500,
    monthly_rent_max: 14000,
    security_deposit: 8500,
    gender_preference: 'boys',
    verification_status: 'verified',
    is_published: true,
    total_beds: 30,
    available_beds: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    images: [
      {
        id: 'img1',
        hostel_id: 'h0000000-0000-0000-0000-000000000001',
        image_url:
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80',
        is_cover: true,
      },
    ],
    owner: {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'owner',
      full_name: 'Suresh Deshmukh',
      phone: '+919890123456',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'Deshmukh Hostels Pune',
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'h0000000-0000-0000-0000-000000000006',
    owner_id: '00000000-0000-0000-0000-000000000002',
    name: 'Balaji Executive Girls Stay — Kothrud',
    description:
      'Brand new girls residency 200m from MIT campus with biometric access and pure vegetarian mess.',
    area: 'Kothrud',
    city: 'Pune',
    address: 'Near Paud Road, Opposite MIT World Peace University, Pune 411038',
    nearby_college: 'MIT World Peace University',
    distance_to_college: '250m',
    latitude: 18.5082,
    longitude: 73.8091,
    monthly_rent: 9800,
    monthly_rent_min: 9800,
    monthly_rent_max: 15000,
    security_deposit: 10000,
    gender_preference: 'girls',
    verification_status: 'pending',
    is_published: false,
    total_beds: 24,
    available_beds: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    images: [
      {
        id: 'img6',
        hostel_id: 'h0000000-0000-0000-0000-000000000006',
        image_url:
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80',
        is_cover: true,
      },
    ],
    owner: {
      id: '00000000-0000-0000-0000-000000000002',
      role: 'owner',
      full_name: 'Sunita Patil',
      phone: '+919822012345',
      city: 'Pune',
      is_verified: false,
      college_or_company: 'Patil Girls Stays & Hostels',
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 'h0000000-0000-0000-0000-000000000007',
    owner_id: '00000000-0000-0000-0000-000000000003',
    name: 'Wakad Luxury Co-Stay (Pending Review)',
    description: 'Modern studio apartments for college interns and IT freshers.',
    area: 'Wakad',
    city: 'Pune',
    address: 'Near Datta Mandir, Wakad, Pune 411057',
    latitude: 18.601,
    longitude: 73.768,
    monthly_rent: 11000,
    security_deposit: 11000,
    gender_preference: 'co-ed',
    verification_status: 'pending',
    is_published: false,
    total_beds: 18,
    available_beds: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    images: [
      {
        id: 'img7',
        hostel_id: 'h0000000-0000-0000-0000-000000000007',
        image_url:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80',
        is_cover: true,
      },
    ],
    owner: {
      id: '00000000-0000-0000-0000-000000000003',
      role: 'owner',
      full_name: 'Anand Kadam',
      phone: '+919765432109',
      city: 'Pune',
      is_verified: false,
      college_or_company: 'GreenView Co-living',
      created_at: '',
      updated_at: '',
    },
  },
];

// Helper to log admin actions
export async function logAdminAction(
  adminId: string,
  actionType: AdminAction['action_type'],
  targetId: string,
  reason?: string
) {
  try {
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: actionType,
      target_id: targetId,
      reason: reason || null,
    });
  } catch (e) {
    console.warn('Could not log admin action to Supabase:', e);
  }
}

// 1. Hook for Admin Dashboard Live Stats
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminDashboardStats> => {
      try {
        // Try RPC first
        const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
        if (!error && data) {
          return data as AdminDashboardStats;
        }

        // Parallel count queries
        const [
          { count: studentCount },
          { count: ownerCount },
          { count: pendingVerifCount },
          { count: pendingListingsCount },
          { count: activeHostelsCount },
          { count: openReportsCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner'),
          supabase.from('owner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('hostels').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
          supabase.from('hostels').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        ]);

        return {
          total_students: studentCount ?? FALLBACK_ADMIN_STATS.total_students,
          total_owners: ownerCount ?? FALLBACK_ADMIN_STATS.total_owners,
          pending_owner_verifications: pendingVerifCount ?? FALLBACK_ADMIN_STATS.pending_owner_verifications,
          pending_hostel_listings: pendingListingsCount ?? FALLBACK_ADMIN_STATS.pending_hostel_listings,
          active_hostels: activeHostelsCount ?? FALLBACK_ADMIN_STATS.active_hostels,
          open_reports: openReportsCount ?? FALLBACK_ADMIN_STATS.open_reports,
        };
      } catch (err) {
        console.warn('Error fetching admin stats:', err);
        return FALLBACK_ADMIN_STATS;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

// 2. Hook for Owner Verifications List
export function useOwnerVerifications(filterStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
  return useQuery({
    queryKey: ['owner-verifications', filterStatus],
    queryFn: async (): Promise<OwnerVerification[]> => {
      try {
        let query = supabase
          .from('owner_verifications')
          .select(`
            *,
            owner:profiles!owner_id(*)
          `)
          .order('submitted_at', { ascending: false });

        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          return filterStatus === 'all'
            ? FALLBACK_VERIFICATIONS
            : FALLBACK_VERIFICATIONS.filter((v) => v.status === filterStatus);
        }

        return data as OwnerVerification[];
      } catch (e) {
        return filterStatus === 'all'
          ? FALLBACK_VERIFICATIONS
          : FALLBACK_VERIFICATIONS.filter((v) => v.status === filterStatus);
      }
    },
  });
}

// 3. Hook for Single Verification Detail
export function useVerificationDetail(id: string) {
  return useQuery({
    queryKey: ['verification-detail', id],
    queryFn: async (): Promise<OwnerVerification | null> => {
      try {
        const { data, error } = await supabase
          .from('owner_verifications')
          .select(`
            *,
            owner:profiles!owner_id(*)
          `)
          .eq('id', id)
          .single();

        if (error || !data) {
          const fallback = FALLBACK_VERIFICATIONS.find((v) => v.id === id);
          return fallback || null;
        }

        return data as OwnerVerification;
      } catch (e) {
        return FALLBACK_VERIFICATIONS.find((v) => v.id === id) || null;
      }
    },
  });
}

// 4. Hook for Listing Moderation
export function useAdminListings(filter: 'all' | 'pending' | 'approved' | 'rejected' | 'unpublished' = 'all') {
  return useQuery({
    queryKey: ['admin-listings', filter],
    queryFn: async (): Promise<Hostel[]> => {
      try {
        let query = supabase
          .from('hostels')
          .select(`
            *,
            images:hostel_images(*),
            owner:profiles(*)
          `)
          .order('created_at', { ascending: false });

        if (filter === 'pending') {
          query = query.eq('verification_status', 'pending');
        } else if (filter === 'approved') {
          query = query.in('verification_status', ['verified', 'approved']).eq('is_published', true);
        } else if (filter === 'rejected') {
          query = query.eq('verification_status', 'rejected');
        } else if (filter === 'unpublished') {
          query = query.eq('is_published', false);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          if (filter === 'pending') {
            return FALLBACK_MODERATION_HOSTELS.filter((h) => h.verification_status === 'pending');
          }
          if (filter === 'approved') {
            return FALLBACK_MODERATION_HOSTELS.filter(
              (h) => (h.verification_status === 'verified' || h.verification_status === 'approved') && h.is_published
            );
          }
          if (filter === 'rejected') {
            return FALLBACK_MODERATION_HOSTELS.filter((h) => h.verification_status === 'rejected');
          }
          if (filter === 'unpublished') {
            return FALLBACK_MODERATION_HOSTELS.filter((h) => !h.is_published);
          }
          return FALLBACK_MODERATION_HOSTELS;
        }

        return data as Hostel[];
      } catch (e) {
        return FALLBACK_MODERATION_HOSTELS;
      }
    },
  });
}

// 5. Hook for User Management
export function useAdminUsers(searchQuery = '', roleFilter: 'all' | 'student' | 'owner' = 'all') {
  return useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter],
    queryFn: async (): Promise<Profile[]> => {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (roleFilter !== 'all') {
          query = query.eq('role', roleFilter);
        }

        if (searchQuery.trim()) {
          query = query.or(
            `full_name.ilike.%${searchQuery.trim()}%,phone.ilike.%${searchQuery.trim()}%,college_or_company.ilike.%${searchQuery.trim()}%`
          );
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          let list = FALLBACK_USERS;
          if (roleFilter !== 'all') {
            list = list.filter((u) => u.role === roleFilter);
          }
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
              (u) =>
                u.full_name.toLowerCase().includes(q) ||
                (u.phone && u.phone.includes(q)) ||
                (u.college_or_company && u.college_or_company.toLowerCase().includes(q))
            );
          }
          return list;
        }

        return data as Profile[];
      } catch (e) {
        return FALLBACK_USERS;
      }
    },
  });
}

// 6. Hook for Reports
export function useAdminReports(statusFilter: 'all' | 'open' | 'investigating' | 'resolved' | 'dismissed' = 'all') {
  return useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: async (): Promise<Report[]> => {
      try {
        let query = supabase
          .from('reports')
          .select(`
            *,
            reporter:profiles!reporter_id(*),
            reported_user:profiles!reported_user_id(*),
            hostel:hostels!hostel_id(*)
          `)
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          return statusFilter === 'all'
            ? FALLBACK_REPORTS
            : FALLBACK_REPORTS.filter((r) => r.status === statusFilter);
        }

        return data as Report[];
      } catch (e) {
        return statusFilter === 'all'
          ? FALLBACK_REPORTS
          : FALLBACK_REPORTS.filter((r) => r.status === statusFilter);
      }
    },
  });
}

// 7. Hook for Recent Admin Actions Audit Log
export function useAdminActions() {
  return useQuery({
    queryKey: ['admin-actions'],
    queryFn: async (): Promise<AdminAction[]> => {
      try {
        const { data, error } = await supabase
          .from('admin_actions')
          .select(`
            *,
            admin:profiles!admin_id(*)
          `)
          .order('created_at', { ascending: false })
          .limit(15);

        if (error || !data || data.length === 0) {
          return FALLBACK_ADMIN_ACTIONS;
        }

        return data as AdminAction[];
      } catch (e) {
        return FALLBACK_ADMIN_ACTIONS;
      }
    },
  });
}

// 8. Signed URL generator for private verification documents
export async function getVerificationDocumentSignedUrl(documentPath: string): Promise<string | null> {
  try {
    if (!documentPath) return null;
    // Check if it's already a full HTTP url
    if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) {
      return documentPath;
    }

    const { data, error } = await supabase.storage
      .from('owner-verifications')
      .createSignedUrl(documentPath, 3600); // 1 hour token

    if (error || !data?.signedUrl) {
      // Fallback demo document view
      return `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80`;
    }

    return data.signedUrl;
  } catch (e) {
    return `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80`;
  }
}

// 9. Fallback Review Reports
export const FALLBACK_REVIEW_REPORTS: ReviewReport[] = [
  {
    id: 'rr-001',
    review_id: 'rev-001',
    reported_by: '00000000-0000-0000-0000-000000000001',
    reason: 'fake_review',
    description: 'Student never checked in; disputed rent calculation and left false statements.',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    reporter: {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'owner',
      full_name: 'Suresh Deshmukh',
      phone: '+919890123456',
      city: 'Pune',
      is_verified: true,
      college_or_company: 'Deshmukh Hostels Pune',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    review: {
      id: 'rev-001',
      hostel_id: 'h0000000-0000-0000-0000-000000000001',
      student_id: '00000000-0000-0000-0000-000000000010',
      rating: 1,
      cleanliness_rating: 1,
      safety_rating: 2,
      location_rating: 3,
      value_rating: 1,
      title: 'Terrible place! Do not visit!',
      comment: 'Owner is a fraud, charging 500 extra for keys and fake water charges. Avoid at all costs!',
      status: 'reported',
      is_verified_stay: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      student: {
        id: '00000000-0000-0000-0000-000000000010',
        role: 'student',
        full_name: 'Rohan Sharma',
        phone: '+919823000001',
        city: 'Pune',
        is_verified: true,
        college_or_company: 'COEP Pune',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  },
];

// 10. Hook for Review Reports
export function useAdminReviewReports(statusFilter: ReviewReportStatus | 'all' = 'all') {
  return useQuery({
    queryKey: ['admin-review-reports', statusFilter],
    queryFn: async (): Promise<ReviewReport[]> => {
      try {
        let query = supabase
          .from('review_reports')
          .select(`
            *,
            reporter:profiles!reported_by(*),
            review:reviews!review_id(
              *,
              student:profiles!student_id(*),
              hostel:hostels!hostel_id(id, name, area)
            )
          `)
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          return statusFilter === 'all'
            ? FALLBACK_REVIEW_REPORTS
            : FALLBACK_REVIEW_REPORTS.filter((r) => r.status === statusFilter);
        }

        return data as ReviewReport[];
      } catch (e) {
        return statusFilter === 'all'
          ? FALLBACK_REVIEW_REPORTS
          : FALLBACK_REVIEW_REPORTS.filter((r) => r.status === statusFilter);
      }
    },
  });
}

// 11. Hook for Flagged / Suspicious Reviews Queue
export function useAdminFlaggedReviews() {
  return useQuery({
    queryKey: ['admin-flagged-reviews'],
    queryFn: async (): Promise<Review[]> => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            student:profiles!student_id(*),
            hostel:hostels!hostel_id(id, name, area)
          `)
          .or('flagged_suspicious.eq.true,status.eq.reported,status.eq.pending')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return FALLBACK_REVIEW_REPORTS.map((r) => r.review).filter(Boolean) as Review[];
        }

        return data as Review[];
      } catch (e) {
        return FALLBACK_REVIEW_REPORTS.map((r) => r.review).filter(Boolean) as Review[];
      }
    },
  });
}

// 12. Mutation to moderate a Review (publish, hide, reject)
export function useAdminModerateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reviewId,
      newStatus,
      moderationReason,
    }: {
      reviewId: string;
      newStatus: ReviewStatus;
      moderationReason?: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          status: newStatus,
          moderated_by: user?.id || null,
          moderated_at: new Date().toISOString(),
          moderation_reason: moderationReason || null,
          flagged_suspicious: false,
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.warn('Review moderation update error, applying optimistic fallback:', error.message);
      }

      if (user?.id) {
        await logAdminAction(
          user.id,
          'moderate_review',
          reviewId,
          `Review set to ${newStatus}. Reason: ${moderationReason || 'Admin action'}`
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-review-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['hostel-trust-metrics'] });
    },
  });
}

// 13. Mutation to resolve a Review Report
export function useAdminResolveReviewReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      newStatus,
      resolutionNotes,
    }: {
      reportId: string;
      newStatus: ReviewReportStatus;
      resolutionNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from('review_reports')
        .update({
          status: newStatus,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || null,
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        console.warn('Review report resolution error:', error.message);
      }

      if (user?.id) {
        await logAdminAction(
          user.id,
          'resolve_review_report',
          reportId,
          `Review report set to ${newStatus}. Note: ${resolutionNotes || 'None'}`
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-review-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-flagged-reviews'] });
    },
  });
}
