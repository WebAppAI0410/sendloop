/**
 * sendloop Theme System
 * Design tokens and styling utilities
 */

export const Colors = {
  // Brand colors from requirements
  primary: '#58A16C',
  accent: '#FFC970',
  
  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Dark theme
  dark: {
    background: '#1B1B1D',
    surface: '#2D2D30',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Growth visual colors
  visual: {
    tree: '#10B981',
    flower: '#EC4899',
    fish: '#06B6D4',
    stars: '#8B5CF6',
  }
};

export const Typography = {
  // Font sizes (sp = scale-independent pixels)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

/**
 * Theme context type
 */
export interface Theme {
  colors: typeof Colors.light;
  isDark: boolean;
}

/**
 * Get theme-specific colors
 */
export function getThemeColors(isDark: boolean) {
  return isDark ? Colors.dark : Colors.light;
}

/**
 * Create responsive styles based on screen size
 */
export function responsive(styles: {
  phone?: any;
  tablet?: any;
}) {
  // For now, return phone styles (can be enhanced with useDeviceType hook)
  return styles.phone || {};
}