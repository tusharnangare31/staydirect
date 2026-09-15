export const THEME = {
  colors: {
    primary: '#173B2C',       // Forest green
    primaryLight: '#24523F',
    primaryDark: '#0D231A',
    secondary: '#DDE9D5',     // Sage green
    secondaryDark: '#B8CEAA',
    background: '#F8F7F1',    // Warm cream
    surface: '#FFFFFF',
    surfaceVariant: '#F1EFE6',
    accent: '#C28A52',        // Warm gold
    accentLight: '#E8CA9D',
    textPrimary: '#111C2D',
    textSecondary: '#5C6470',
    textMuted: '#8E95A2',
    border: '#E5E3D8',
    borderLight: '#ECEAE2',
    success: '#15803D',
    successLight: '#DCFCE7',
    warning: '#B45309',
    warningLight: '#FEF3C7',
    error: '#B91C1C',
    errorLight: '#FEE2E2',
    whatsapp: '#25D366',
    white: '#FFFFFF',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      display: 28,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    huge: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },
  shadows: {
    soft: {
      shadowColor: '#173B2C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#173B2C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};

export const PUNE_AREAS = [
  'All Pune',
  'Hinjewadi',
  'Wakad',
  'Kothrud',
  'Viman Nagar',
  'Baner',
  'Kharadi',
  'FC Road',
  'Shivajinagar',
  'Katraj',
] as const;

export const PUNE_COLLEGES = [
  { name: 'COEP Technological University', area: 'Shivajinagar' },
  { name: 'MIT World Peace University', area: 'Kothrud' },
  { name: 'Symbiosis International (SCIT / SICSR)', area: 'Hinjewadi / Viman Nagar' },
  { name: 'Fergusson College (Autonomous)', area: 'FC Road, Deccan' },
  { name: 'PICT (Pune Institute of Computer Tech)', area: 'Katraj' },
  { name: 'VIIT / VIT Pune', area: 'Bibwewadi / Kondhwa' },
  { name: 'Cummins College of Engineering', area: 'Karve Nagar' },
];
