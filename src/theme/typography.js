/**
 * YouNxt Typography System
 * Uses Inter font family with a clear size scale
 */
export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },

  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 42,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },

  // Prebuilt text styles
  styles: {
    heroTitle: {
      fontSize: 42,
      fontWeight: '700',
      letterSpacing: -0.5,
      lineHeight: 50,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.3,
      lineHeight: 34,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
      lineHeight: 18,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
      lineHeight: 22,
    },
  },
};
