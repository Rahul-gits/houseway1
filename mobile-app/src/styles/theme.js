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

  // Neutral Colors
  neutral: {
    50: '#FEFEFE',
    100: '#FAFAFA',
    200: '#F5F5F5',
    300: '#E5E5E5',
    400: '#D4D4D4',
    500: '#A3A3A3',
    600: '#737373',
    700: '#525252',
    800: '#404040',
    900: '#262626',
    white: '#FFFFFF',
    black: '#000000',
  },

  // Background Colors - Mobile Client Management Theme
  background: {
    primary: '#FBF7EE',      // Beige Light - Main background
    secondary: '#FFFFFF',    // Pure white
    tertiary: '#F8F1E6',     // Soft Cream
    card: '#FFFFFF',         // White cards
    surface: '#FFFFFF',      // Surface color
    overlay: 'rgba(27, 37, 64, 0.6)', // Deep Navy overlay
    accent: '#EFE4D3',       // Warm Sand accent
    dark: '#1B2540',         // Deep Navy
    glass: 'rgba(251, 247, 238, 0.8)', // Glassmorphism background
    modal: 'rgba(27, 37, 64, 0.4)', // Modal backdrop
  },

  // Text Colors - Mobile Optimized
  text: {
    primary: '#1B2540',      // Deep Navy - Main text
    secondary: '#566FE0',    // Indigo Blue - Secondary text
    tertiary: '#7487C1',     // Steel Blue - Tertiary text
    muted: '#C9B89A',        // Pending Taupe - Muted text
    white: '#FFFFFF',        // Pure white
    inverse: '#FFFFFF',      // White on dark backgrounds
    brand: '#3E60D8',        // Royal Blue brand
    success: '#7DB87A',      // Success green
    warning: '#E8B25D',      // Warning orange
    danger: '#D75A5A',       // Danger red
  },

  // Border Colors - Mobile Friendly
  border: {
    light: '#F8F1E6',        // Soft Cream
    medium: '#EFE4D3',       // Warm Sand
    dark: '#D4C4B0',         // Medium Beige
    primary: '#3E60D8',      // Royal Blue
    focus: '#566FE0',        // Indigo Blue
    accent: '#C9B89A',       // Pending Taupe
    glass: 'rgba(255, 255, 255, 0.2)', // Glassmorphism border
  },

  // Status Colors - Client Management Specific
  status: {
    active: '#7DB87A',       // Success Green
    inactive: '#C9B89A',     // Pending Taupe
    'at-risk': '#E8B25D',    // Warning Orange
    pending: '#566FE0',      // Indigo Blue
    completed: '#7DB87A',    // Success Green
    'in-progress': '#3E60D8', // Royal Blue
    planning: '#7487C1',     // Steel Blue
    'on-hold': '#E8B25D',    // Warning Orange
    cancelled: '#D75A5A',    // Danger Red
  },
};



// Typography - Premium Mobile Design
export const typography = {
  // Font Family - Inter Display System
  fontFamily: {
    display: 'InterDisplay-Bold',     // Inter Display Bold for headings
    heading: 'InterDisplay-Bold',     // Inter Display Bold for headings
    body: 'Inter-Regular',            // Inter Regular for body text
    medium: 'Inter-Medium',           // Inter Medium for chips and UI elements
    regular: 'Inter-Regular',         // Fallback to regular
    bold: 'Inter-Bold',               // Bold weight
  },

  // Font Sizes - Mobile Optimized
  fontSizes: {
    xs: 11,        // Small captions
    sm: 13,        // Body small
    base: 15,      // Base body
    md: 16,        // Medium body
    lg: 18,        // Large body
    xl: 20,        // Small headings
    xxl: 24,       // Medium headings
    xxxl: 28,      // Large headings
    display: 32,   // Hero headings
    hero: 40,      // Extra large hero text
  },

  // Font Weights - Inter System
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights - Mobile Reading
  lineHeights: {
    tight: 1.2,     // Headings
    normal: 1.4,    // Body text
    relaxed: 1.6,   // Comfortable reading
    loose: 1.8,     // Very spacious
  },

  // Letter Spacing - Premium Touch
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// Spacing - Mobile Design System
export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  xxxxl: 32,
  xxxxxl: 40,   // Extra large spacing
  xxxxxxl: 48,  // Maximum spacing
};

// Border Radius - Mobile UI Shapes (16-20px as specified)
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,        // Standard mobile rounded corners
  xl: 20,        // Premium rounded corners (as specified)
  xxl: 24,       // Extra rounded
  round: 50,     // Fully round
  pill: 9999,    // Pill shape for chips
};

// Mobile UI Shapes & Creative Design Constants
export const shapes = {
  // Wave patterns
  waveHeader: {
    height: 120,
    curve: 'M0,120 Q160,60 320,120 L320,0 L0,0 Z',
    amplitude: 60,
  },

  // Circular elements
  floatingBlobs: {
    size: { sm: 40, md: 60, lg: 80 },
    blur: 20,
  },

  // Card specifications
  cards: {
    cornerRadius: 18,
    softShadow: {
      shadowColor: '#1B2540',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Glassmorphism
  glass: {
    blur: 15,
    opacity: 0.8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
};

// Shadows - Premium Mobile Design
export const shadows = {
  // Soft shadow system
  sm: {
    // Mobile shadows
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    // Web shadows
    boxShadow: '0 2px 4px rgba(27, 37, 64, 0.05)',
  },
  md: {
    // Mobile shadows
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    // Web shadows
    boxShadow: '0 4px 8px rgba(27, 37, 64, 0.08)',
  },
  lg: {
    // Mobile shadows
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    // Web shadows
    boxShadow: '0 8px 24px rgba(27, 37, 64, 0.08)',
  },
  // Creative shadows for special elements
  soft: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    boxShadow: '0 8px 24px rgba(27, 37, 64, 0.08)',
  },
  glow: {
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    boxShadow: '0 0 20px rgba(62, 96, 216, 0.3)',
  },
};

// Card Styles - Premium Mobile Design
export const cardStyles = {
  default: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  accent: {
    backgroundColor: colors.background.accent,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue[500],
    ...shadows.sm,
  },
  primary: {
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.beige[300],
  },
  glass: {
    backgroundColor: colors.background.glass,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    ...shadows.soft,
  },
  ribbon: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 6,
    borderLeftColor: colors.blue[500],
    ...shadows.soft,
  },
};

// Gradients - Blue → Beige Curved Gradients
export const gradients = {
  primary: {
    colors: [colors.blue[500], colors.blue[600], colors.beige[100]],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  header: {
    colors: [colors.blue[500], colors.blue[400], colors.beige[100]],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0.6 },
  },
  card: {
    colors: [colors.beige[50], colors.beige[100]],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  button: {
    colors: [colors.blue[500], colors.blue[600]],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: [colors.success[400], colors.success[500]],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warning: {
    colors: [colors.warning[400], colors.warning[500]],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  danger: {
    colors: [colors.danger[400], colors.danger[500]],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Animations - Subtle Tactile Animations
export const animations = {
  // Spring animations
  spring: {
    tension: 100,
    friction: 8,
  },
  // Duration presets
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  // Easing functions
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring(1, 100, 15, 0)',
  },
  // Preset animations
  transitions: {
    fade: {
      opacity: {
        from: 0,
        to: 1,
      },
      duration: animations.duration.normal,
    },
    scale: {
      scale: {
        from: 0.95,
        to: 1,
      },
      duration: animations.duration.normal,
    },
    slideUp: {
      translateY: {
        from: 20,
        to: 0,
      },
      duration: animations.duration.normal,
    },
    slideDown: {
      translateY: {
        from: -20,
        to: 0,
      },
      duration: animations.duration.normal,
    },
    ripple: {
      scale: {
        from: 0,
        to: 1,
      },
      opacity: {
        from: 0.5,
        to: 0,
      },
      duration: animations.duration.slow,
    },
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
