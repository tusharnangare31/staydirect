export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'owner';
export type GenderPreference = 'boys' | 'girls' | 'co-ed';
export type HostelType = 'PG' | 'hostel' | 'co-living';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type InquiryStatus = 'new' | 'contacted' | 'scheduled_visit' | 'closed';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  college_or_company?: string | null;
  city: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Hostel {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  area: string;
  city: string;
  address: string;
  nearby_college?: string | null;
  distance_to_college?: string | null;
  latitude: number;
  longitude: number;
  monthly_rent?: number;
  monthly_rent_min?: number;
  monthly_rent_max?: number;
  security_deposit: number;
  gender_preference: GenderPreference;
  hostel_type?: HostelType;
  is_available?: boolean;
  is_published?: boolean;
  total_beds?: number;
  available_beds?: number;
  verification_status: VerificationStatus;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at?: string;
  // Joined fields
  images?: HostelImage[];
  rooms?: Room[];
  amenities?: Amenity[] | { amenity?: { name: string }; name?: string }[];
  owner?: Profile;
  is_favorited?: boolean;
}

export interface HostelImage {
  id: string;
  hostel_id: string;
  image_url?: string;
  storage_path?: string;
  is_cover?: boolean;
  display_order?: number;
  sort_order?: number;
  created_at?: string;
}

export interface Room {
  id: string;
  hostel_id: string;
  sharing_type?: string;
  room_type?: string;
  monthly_rent: number;
  deposit?: number;
  total_capacity?: number;
  vacant_beds?: number;
  total_beds?: number;
  available_beds?: number;
  has_ac?: boolean;
  has_attached_washroom?: boolean;
  created_at?: string;
}

export interface Amenity {
  id: string;
  hostel_id: string;
  name: string;
  icon?: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  student_id: string;
  hostel_id: string;
  created_at: string;
  hostel?: Hostel;
}

export interface Inquiry {
  id: string;
  hostel_id: string;
  student_id: string;
  owner_id: string;
  preferred_sharing?: string | null;
  visit_date?: string | null;
  visit_time?: string | null;
  message?: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  hostel?: Hostel;
  student?: Profile;
  owner?: Profile;
}

export interface Booking {
  id: string;
  hostel_id: string;
  room_id?: string | null;
  student_id: string;
  owner_id: string;
  move_in_date: string;
  duration_months: number;
  sharing_type: string;
  monthly_rent: number;
  security_deposit: number;
  brokerage_fee: number; // Always 0
  status: BookingStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  hostel?: Hostel;
  student?: Profile;
  room?: Room;
}

export interface Conversation {
  id: string;
  hostel_id?: string | null;
  student_id: string;
  owner_id: string;
  last_message?: string | null;
  last_message_at: string;
  created_at: string;
  hostel?: Hostel;
  student?: Profile;
  owner?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}
