// StayDirect Theme Tokens & Constants
// Direct parity with react-native-staydirect/src/constants/theme.ts

export const THEME = {
  colors: {
    primary: '#173B2C', // Deep forest green - core brand identity
    primaryLight: '#24523F', // Lighter forest green - for secondary elements
    primaryDark: '#0D231A', // Dark forest green - for headers and active states
    secondary: '#DDE9D5', // Soft sage green - for highlights and pills
    secondaryDark: '#B8CEAA', // Medium sage green - for borders and subtle elements
    background: '#F8F7F1', // Warm off-white - easy on student eyes
    surface: '#FFFFFF', // Pure white - for cards and elevated surfaces
    surfaceVariant: '#F1EFE6', // Slightly darker surface - for search bars/inputs
    accent: '#C28A52', // Warm gold - complementary accent for ratings/badges
    accentLight: '#E8CA9D',
    textPrimary: '#111C2D', // Deep charcoal - high contrast, readable
    textSecondary: '#5C6470', // Slate - secondary information
    textMuted: '#8E95A2', // Muted slate - timestamps, placeholders
    border: '#E5E3D8', // Warm light border
    borderLight: '#ECEAE2',
    success: '#15803D', // Deep green - success states, verified badges
    successLight: '#DCFCE7', // Light green background
    warning: '#B45309', // Warm sand - warnings, pending states
    warningLight: '#FEF3C7',
    error: '#B91C1C', // Warm terracotta - errors, urgent alerts
    errorLight: '#FEE2E2',
    whatsapp: '#25D366',
    white: '#FFFFFF',
    boysColor: '#2B5B84', // Slate blue for Boys tag
    girlsColor: '#BE185D', // Pink/mauve for Girls tag
    coedColor: '#4A7C59', // Sage green for Co-ed tag
    brokerageBadge: '#0F766E', // Verified zero brokerage teal
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

// Discovery Categories matching DISCOVERY_CATEGORIES in react-native-staydirect/app/(student)/index.tsx
export const DISCOVERY_CATEGORIES = [
  {
    id: 'single',
    label: 'Single Room',
    icon: 'single_bed',
    filterKey: 'roomType',
    filterVal: 'Single Room',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    id: 'double',
    label: 'Twin Sharing',
    icon: 'group',
    filterKey: 'roomType',
    filterVal: 'Twin Sharing',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    id: 'girls',
    label: 'Girls Only',
    icon: 'female',
    filterKey: 'gender',
    filterVal: 'Girls',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    iconColor: 'text-pink-600',
  },
  {
    id: 'boys',
    label: 'Boys Only',
    icon: 'male',
    filterKey: 'gender',
    filterVal: 'Boys',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-700',
  },
  {
    id: 'food',
    label: 'Food Included',
    icon: 'restaurant',
    filterKey: 'food',
    filterVal: 'food_included',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
  },
  {
    id: 'ac',
    label: 'AC Rooms',
    icon: 'ac_unit',
    filterKey: 'amenity',
    filterVal: 'AC',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'budget',
    label: 'Under ₹8k',
    icon: 'account_balance_wallet',
    filterKey: 'budget',
    filterVal: '8000',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
  },
  {
    id: 'verified',
    label: '100% Verified',
    icon: 'verified_user',
    filterKey: 'verified',
    filterVal: 'true',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    iconColor: 'text-sky-600',
  },
];

// Popular Pune College Hubs matching POPULAR_COLLEGE_HUBS in react-native-staydirect
export const POPULAR_COLLEGE_HUBS = [
  { name: 'Kothrud', college: 'MIT-WPU & Cummins' },
  { name: 'Shivajinagar', college: 'COEP & Fergusson' },
  { name: 'Viman Nagar', college: 'Symbiosis Campus' },
  { name: 'Dhankawadi', college: 'Bharati Vidyapeeth & PICT' },
  { name: 'Hinjewadi', college: 'Tech Parks & IIMS' },
  { name: 'Wakad', college: 'DY Patil & JSPM' },
  { name: 'Karve Nagar', college: 'MKSSS & Marathwada' },
  { name: 'Baner', college: 'Balewadi & NICMAR' },
];

export const PUNE_AREAS = [
  'All Pune',
  'Kothrud',
  'Shivajinagar',
  'Viman Nagar',
  'Hinjewadi',
  'Wakad',
  'Baner',
  'Dhankawadi',
  'Katraj',
  'FC Road',
  'Karve Nagar',
  'Kharadi',
] as const;

export const PUNE_COLLEGES = [
  { name: 'MIT World Peace University (MIT-WPU)', area: 'Kothrud', distance: '0.4 km' },
  { name: 'COEP Technological University', area: 'Shivajinagar', distance: '0.8 km' },
  { name: 'Symbiosis International (SCIT / SICSR / SIBM)', area: 'Viman Nagar / Hinjewadi', distance: '1.2 km' },
  { name: 'Fergusson College (Autonomous)', area: 'FC Road, Deccan', distance: '0.6 km' },
  { name: 'PICT (Pune Institute of Computer Tech)', area: 'Dhankawadi / Katraj', distance: '0.5 km' },
  { name: 'Cummins College of Engineering for Women', area: 'Karve Nagar', distance: '0.7 km' },
  { name: 'Bharati Vidyapeeth Deemed University', area: 'Dhankawadi', distance: '0.9 km' },
  { name: 'DY Patil University / College of Engineering', area: 'Wakad / Akurdi', distance: '1.5 km' },
];

export function formatIndianRupees(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}
