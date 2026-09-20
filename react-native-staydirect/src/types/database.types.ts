export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'owner' | 'admin';
export type GenderPreference = 'boys' | 'girls' | 'co-ed';
export type HostelType = 'PG' | 'hostel' | 'co-living';
export type VerificationStatus = 'pending' | 'verified' | 'approved' | 'rejected';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type InquiryStatus = 'new' | 'contacted' | 'scheduled_visit' | 'closed';
export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
export type DocumentType =
  | 'aadhaar'
  | 'pan'
  | 'electricity_bill'
  | 'property_tax'
  | 'rent_agreement'
  | 'trade_license';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  college_or_company?: string | null;
  city: string;
  is_verified: boolean;
  is_suspended?: boolean;
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

export interface AdminUser {
  user_id: string;
  role: 'admin' | 'super_admin';
  notes?: string | null;
  created_at: string;
}

export interface OwnerVerification {
  id: string;
  owner_id: string;
  document_type: string;
  document_path: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  rejection_reason?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  // Joined fields
  owner?: Profile;
  reviewer?: Profile;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type:
    | 'approve_listing'
    | 'reject_listing'
    | 'unpublish_listing'
    | 'approve_owner'
    | 'reject_owner'
    | 'suspend_user'
    | 'unsuspend_user'
    | 'investigate_report'
    | 'resolve_report'
    | 'dismiss_report';
  target_id: string;
  reason?: string | null;
  created_at: string;
  // Joined fields
  admin?: Profile;
}

export type ReportCategory =
  | 'fraud'
  | 'unsafe_property'
  | 'misleading_listing'
  | 'harassment'
  | 'payment_issue'
  | 'fake_documents'
  | 'property_mismatch'
  | 'other';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string | null;
  hostel_id?: string | null;
  booking_id?: string | null;
  report_type?: ReportCategory | string;
  reason: string;
  description?: string | null;
  evidence_urls?: string[];
  status: ReportStatus;
  assigned_admin?: string | null;
  resolution?: string | null;
  created_at: string;
  updated_at?: string;
  // Joined fields
  reporter?: Profile;
  reported_user?: Profile;
  hostel?: Hostel;
}

export interface AdminDashboardStats {
  total_students: number;
  total_owners: number;
  pending_owner_verifications: number;
  pending_hostel_listings: number;
  active_hostels: number;
  open_reports: number;
}

export type PaymentType =
  | 'booking_deposit'
  | 'service_fee'
  | 'owner_subscription'
  | 'refund';

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cancelled';

export type RefundStatus =
  | 'none'
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'processed';

export type SubscriptionPlanName =
  | 'starter_free'
  | 'pro_partner'
  | 'campus_fleet';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'past_due';

export interface Payment {
  id: string;
  user_id: string;
  booking_id?: string | null;
  owner_id?: string | null;
  payment_provider: string;
  provider_order_id?: string | null;
  provider_payment_id?: string | null;
  provider_signature?: string | null;
  amount: number;
  currency: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  failure_reason?: string | null;
  paid_at?: string | null;
  refund_amount?: number;
  refund_reason?: string | null;
  refund_status?: RefundStatus;
  refunded_at?: string | null;
  approved_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  booking?: Booking;
  user?: Profile;
  owner?: Profile;
  hostel?: Hostel;
}

export interface PaymentEvent {
  id: string;
  payment_id?: string | null;
  provider_event_id: string;
  event_type: string;
  payload: any;
  processed: boolean;
  processed_at?: string | null;
  created_at: string;
}

export interface OwnerSubscription {
  id: string;
  owner_id: string;
  plan_name: SubscriptionPlanName;
  provider_subscription_id?: string | null;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface AdminPaymentStats {
  total_volume: number;
  successful_count: number;
  failed_count: number;
  refunded_count: number;
  pending_count: number;
  subscription_revenue: number;
  deposit_volume: number;
}

export type ReviewStatus =
  | 'pending'
  | 'published'
  | 'rejected'
  | 'hidden'
  | 'reported';

export type ReviewReportReason =
  | 'spam'
  | 'fake_review'
  | 'offensive_language'
  | 'personal_information'
  | 'harassment'
  | 'irrelevant_content'
  | 'fraudulent_activity'
  | 'duplicate_review'
  | 'other';

export type ReviewReportStatus =
  | 'pending'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

export interface Review {
  id: string;
  hostel_id: string;
  student_id: string;
  booking_id?: string | null;
  owner_id?: string;
  rating: number;
  cleanliness_rating?: number;
  food_rating?: number;
  safety_rating?: number;
  location_rating?: number;
  value_rating?: number;
  title?: string | null;
  comment: string;
  review_text?: string;
  image_urls?: string[];
  status: ReviewStatus;
  owner_reply?: string | null;
  owner_replied_at?: string | null;
  moderated_by?: string | null;
  moderated_at?: string | null;
  moderation_reason?: string | null;
  flagged_suspicious?: boolean;
  suspicious_reason?: string | null;
  is_verified_stay?: boolean;
  created_at: string;
  updated_at?: string;
  student?: Profile;
  hostel?: Hostel;
}

export interface ReviewReport {
  id: string;
  review_id: string;
  reported_by: string;
  reason: ReviewReportReason;
  description?: string | null;
  status: ReviewReportStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  reporter?: Profile;
  review?: Review;
}

export interface TrustBadge {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export interface HostelTrustMetrics {
  hostel_id: string;
  trust_score: number;
  average_rating: number;
  review_count: number;
  cleanliness_avg: number;
  safety_avg: number;
  location_avg: number;
  value_avg: number;
  completed_booking_count: number;
  response_rate: number;
  average_response_time: string;
  verification_status: string;
  complaint_count: number;
  cancellation_rate: number;
  badges: TrustBadge[];
  last_updated: string;
}

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string | null;
  updated_at: string;
}

// ====================================================================
// Phase 9: Advanced Search, Preferences, Alerts & Recommendations Types
// ====================================================================

export type FoodPreference =
  | 'any'
  | 'veg'
  | 'non_veg'
  | 'food_included'
  | 'food_not_included';

export type FurnishedStatus = 'furnished' | 'semi-furnished' | 'unfurnished';

export interface StudentPreferences {
  id: string;
  student_id: string;
  preferred_areas: string[];
  min_budget: number;
  max_budget: number;
  preferred_room_types: string[];
  preferred_occupancy: string[];
  food_preference: FoodPreference;
  gender_preference: 'any' | 'boys' | 'girls' | 'co-ed';
  required_amenities: string[];
  move_in_date?: string | null;
  personalization_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecentlyViewedHostel {
  id: string;
  student_id: string;
  hostel_id: string;
  viewed_at: string;
  hostel?: Hostel;
}

export interface SavedSearch {
  id: string;
  student_id: string;
  name: string;
  query?: string | null;
  filters: Record<string, any>;
  notification_enabled: boolean;
  active: boolean;
  last_alerted_at?: string | null;
  created_at: string;
  updated_at: string;
  matching_count?: number;
}

export interface SavedSearchAlert {
  id: string;
  saved_search_id: string;
  student_id: string;
  hostel_id: string;
  alerted_at: string;
}

export type SearchAnalyticsEventType =
  | 'search_performed'
  | 'filter_applied'
  | 'hostel_opened'
  | 'hostel_saved'
  | 'inquiry_created'
  | 'booking_started'
  | 'booking_completed';

export interface SearchAnalyticsItem {
  id: string;
  event_type: SearchAnalyticsEventType;
  search_term?: string | null;
  area?: string | null;
  filters_applied?: Record<string, any>;
  hostel_id?: string | null;
  results_count?: number;
  user_id?: string | null;
  created_at: string;
}

export type SearchSortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'most_reviewed'
  | 'newest'
  | 'fast_response'
  | 'popular';

export interface AdvancedSearchFilters {
  query?: string;
  area?: string;
  landmark?: string;
  nearbyCollege?: string;
  minRent?: number;
  maxRent?: number;
  maxDeposit?: number;
  gender?: 'All' | 'Boys' | 'Girls' | 'Co-ed';
  roomTypes?: string[];
  occupancy?: string[];
  foodPreference?: string;
  furnishedStatus?: string;
  amenities?: string[];
  securityFeatures?: string[];
  verifiedOwnerOnly?: boolean;
  verifiedHostelOnly?: boolean;
  minRating?: number;
  completedStayReviewsOnly?: boolean;
  fastResponseOnly?: boolean;
  sortBy?: SearchSortOption;
}

export type RecommendationReasonType =
  | 'budget_match'
  | 'area_match'
  | 'saved_similarity'
  | 'amenity_match'
  | 'popular_student'
  | 'verified_new';

export interface RecommendedHostel {
  hostel: Hostel;
  score: number;
  reasons: string[];
  primaryReason: string;
}

export interface AdminSearchInsightsData {
  mostSearchedAreas: { area: string; count: number }[];
  mostSearchedBudgets: { range: string; count: number }[];
  popularAmenities: { amenity: string; count: number }[];
  unfulfilledSearches: { query: string; area: string; count: number }[];
  conversionRates: {
    searches: number;
    hostelViews: number;
    inquiries: number;
    bookingsCompleted: number;
    searchToInquiryPct: number;
    searchToBookingPct: number;
  };
  mostViewedHostels: { hostelId: string; name: string; area: string; views: number }[];
  mostSavedHostels: { hostelId: string; name: string; area: string; saves: number }[];
}

