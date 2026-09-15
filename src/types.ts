export type UserRole = 'student' | 'owner';

export type RoomOccupancy = {
  type: string;
  price: number;
  left: number;
  details: string;
};

export interface Hostel {
  id: string;
  name: string;
  area: string;
  fullAddress: string;
  monthlyRent: number;
  roomTypeTag: string; // e.g. "Single / Twin", "Sharing", "AC Room", "Double"
  category: 'PG' | 'Hostel';
  gender: 'Boys' | 'Girls' | 'Co-ed';
  rating: number;
  reviewCount: number;
  distanceTag: string; // e.g. "1.2 km from Symbiosis", "500m to Metro Station"
  landmarkSubtitle?: string;
  amenities: string[];
  imageUrl: string;
  galleryImages: string[];
  verified: boolean;
  zeroBrokerage: boolean;
  instantVisit?: boolean;
  hasGuard24x7?: boolean;
  description: string;
  occupancies: RoomOccupancy[];
  policies: string[];
  owner: {
    id?: string;
    name: string;
    phone: string;
    responseTime: string;
    tagline: string;
    avatarUrl: string;
  };
  isActive?: boolean;
  inquiriesCount?: number;
}

export interface Area {
  id: string;
  name: string;
  hostelsCount: string;
  imageUrl: string;
}

export interface Inquiry {
  id: string;
  studentName: string;
  studentInitials: string;
  studentAvatar?: string;
  hostelId: string;
  hostelName: string;
  roomPreference: string;
  timeAgo: string;
  status: 'NEW' | 'CONTACTED' | 'SCHEDULED';
  preferredMoveIn?: string;
  moveInDate?: string;
  lastMessage?: string;
  notes?: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  sender?: 'student' | 'owner';
  senderId?: string;
  senderName?: string;
  text: string;
  time?: string;
  timestamp?: string;
  isMe?: boolean;
  read?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  savedCount: number;
  inquiriesCount: number;
  city: string;
  college?: string;
  phone?: string;
}
