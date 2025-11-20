// Premium Mobile Client Management Theme - Blue–Beige Design System
export const colors = {
  // Beige Base Colors
  beige: {
    50: '#FEFEFE',      // Almost white
    100: '#FBF7EE',     // Beige Light - Primary background
    200: '#F8F1E6',     // Soft Cream
    300: '#EFE4D3',     // Warm Sand
    400: '#E6D7C2',     // Deeper Sand
    500: '#D4C4B0',     // Medium Beige
    600: '#C9B89A',     // Pending Taupe
    700: '#A8997F',     // Dark Beige
    800: '#8B7D6B',     // Deep Beige
    900: '#6B5D54',     // Darkest Beige
  },

  // Royal Blue Colors
  blue: {
    50: '#F0F4FF',      // Very light blue
    100: '#E0EAFF',     // Light blue
    200: '#C7D7FE',     // Soft light blue
    300: '#A5B8FC',     // Light blue
    400: '#8B9DFC',     // Medium light blue
    500: '#3E60D8',     // Royal Blue - Primary
    600: '#566FE0',     // Indigo Blue
    700: '#4A5BC9',     // Deep royal blue
    800: '#7487C1',     // Steel Blue
    900: '#1B2540',     // Deep Navy
  },

  // Success Colors - Natural Green
  success: {
    50: '#F0F9F0',
    100: '#DCF0DC',
    200: '#C7E7C7',
    300: '#A8D5A8',
    400: '#7DB87A',     // Success Green - Primary
    500: '#68B168',
    600: '#5A9A5A',
    700: '#4C834C',
    800: '#3E6B3E',
    900: '#2F542F',
  },

  // Danger Colors - Natural Red
  danger: {
    50: '#FEF0F0',
    100: '#FDD6D6',
    200: '#FCBEBE',
    300: '#FA9E9E',
    400: '#F87878',
    500: '#D75A5A',     // Danger Red - Primary
    600: '#C54545',
    700: '#B23232',
    800: '#9A2A2A',
    900: '#7F2323',
  },

  // Warning Colors - Warm Orange
  warning: {
    50: '#FEF7F0',
    100: '#FDECD6',
    200: '#FCDDBE',
    300: '#FAC89E',
    400: '#F8B078',
    500: '#E8B25D',     // Warning Orange - Primary
    600: '#D49A48',
    700: '#C08538',
    800: '#A67030',
    900: '#8B5C28',
  },

  // Neutral/Gray Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    white: '#ffffff',
    black: '#000000',
  },

  // Background Colors - Professional Style
  background: {
    primary: '#fefdfb',      // Very light beige
    secondary: '#ffffff',    // Pure white
    tertiary: '#f0f4ff',     // Very light blue
    card: '#ffffff',         // White cards
    surface: '#ffffff',      // Surface color
    overlay: 'rgba(30, 58, 138, 0.6)', // Dark blue overlay
    accent: '#f5deb3',       // Beige accent
    dark: '#1e3a8a',         // Dark blue
  },

  // Text Colors - Professional & Readable
  text: {
    primary: '#0f172a',      // Dark slate
    secondary: '#475569',    // Medium slate
    tertiary: '#64748b',     // Light slate
    muted: '#94a3b8',        // Very light slate
    white: '#ffffff',        // Pure white
    inverse: '#ffffff',      // White on dark backgrounds
    brand: '#1976d2',        // Brand blue
    success: '#059669',      // Success green
    warning: '#d97706',      // Warning orange
    error: '#dc2626',        // Error red
  },

  // Border Colors - Subtle & Modern
  border: {
    light: '#f1f5f9',        // Very light
    medium: '#e2e8f0',       // Light
    dark: '#cbd5e1',         // Medium
    primary: '#1976d2',      // Brand blue
    focus: '#3b82f6',        // Focus blue
  },
};



// Typography
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

// Shadows - Web and Mobile Compatible
export const shadows = {
  sm: {
    // Mobile shadows
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // Web shadows
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  md: {
    // Mobile shadows
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    // Web shadows
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
  lg: {
    // Mobile shadows
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    // Web shadows
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

// Card Styles - Creative and Standardized
export const cardStyles = {
  default: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  accent: {
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
    ...shadows.sm,
  },
  primary: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: colors.secondary[100],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary[300],
  },
};

// Component Styles
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
      color: colors.text.white,
    },
    secondary: {
      backgroundColor: colors.secondary[500],
      borderColor: colors.secondary[500],
      color: colors.text.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary[500],
      color: colors.primary[500],
    },
  },
  card: {
    default: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.light,
      shadowColor: colors.neutral[900],
    },
    elevated: {
      backgroundColor: colors.background.card,
      ...shadows.md,
    },
  },
  input: {
    default: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.light,
      color: colors.text.primary,
      placeholderColor: colors.text.muted,
    },
    focused: {
      borderColor: colors.primary[500],
      backgroundColor: colors.neutral.white,
    },
  },
};

// Status Colors for Different States - Solid Colors Only
export const statusColors = {
  project: {
    planning: colors.primary[500],
    'in-progress': colors.secondary[600],
    completed: colors.success[500],
    'on-hold': colors.warning[500],
    cancelled: colors.error[500],
  },
  priority: {
    low: colors.success[500],
    medium: colors.warning[500],
    high: colors.error[500],
  },
  material: {
    pending: colors.warning[500],
    approved: colors.success[500],
    rejected: colors.error[500],
  },
};

export default {
  colors,
  cardStyles,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  statusColors,
};
