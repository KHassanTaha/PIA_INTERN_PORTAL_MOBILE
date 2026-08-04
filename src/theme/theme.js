import { MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';

/**
 * PIA brand colors — confirmed.
 *
 * Font: NOT yet confirmed. PIA has no publicly documented UI/app typeface —
 * only an ornate serif/calligraphic logo wordmark, which isn't meant for
 * body text or UI components. FONT_FAMILY below is a placeholder clean
 * system sans-serif chosen to look modern and readable in the meantime.
 * Swap FONT_FAMILY for the real one once PIA's brand team confirms it —
 * every screen picks it up automatically from this one place.
 *
 * Background: offWhite moved from a near-white (#F7F6F1) to a warmer PIA
 * cream (#F4F1E3) - flat white behind white cards was reading as bland.
 * creamLight (#FEFCE2) is a paler variant of the same family, used
 * paired with offWhite in PIAGradients.background for a very subtle
 * top-to-bottom tint rather than a flat fill - see ScreenBackground.js,
 * which is the one place that gradient should be applied (don't hardcode
 * PIAGradients.background elsewhere; wrap screens in that component
 * instead, so a future tweak here only has to happen once).
 */
export const PIAColors = {
  green: '#004F30',
  greenDark: '#00301D',
  greenLight: '#3D7A5C',
  gold: '#AB9214',
  goldLight: '#D4BC5C',
  white: '#FFFFFF',
  offWhite: '#F4F1E3',
  creamLight: '#FEFCE2',
  ink: '#1B1B1B',
  error: '#B3261E',
};

/**
 * Centralized gradient color pairs, keyed by semantic use, not by screen.
 * react-native-paper's theme has no native gradient concept (Material
 * Design is a flat-color system) - this is the closest equivalent:
 * one place to change a gradient app-wide, consumed by the shared
 * components in components/Gradients.js and components/ScreenBackground.js
 * rather than by LinearGradient calls scattered per-screen.
 */
export const PIAGradients = {
  primary: [PIAColors.green, PIAColors.greenLight],
  primaryDark: [PIAColors.green, PIAColors.greenDark],
  accent: [PIAColors.gold, PIAColors.goldLight],
  disabled: [PIAColors.ink + '22', PIAColors.ink + '22'],
  // Subtle top-to-bottom cream wash for screen backgrounds - deliberately
  // low-contrast (both stops are close in value) so it reads as texture,
  // not as a "colored screen." See ScreenBackground.js.
  background: [PIAColors.creamLight, PIAColors.offWhite],
};

// TODO: replace once PIA confirms an official UI typeface.
const FONT_FAMILY = 'sans-serif';

const fontConfig = {
  fontFamily: FONT_FAMILY,
};

export const piaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: PIAColors.green,
    onPrimary: PIAColors.white,
    primaryContainer: PIAColors.greenLight,
    onPrimaryContainer: PIAColors.white,
    secondary: PIAColors.gold,
    onSecondary: PIAColors.white,
    secondaryContainer: PIAColors.goldLight,
    onSecondaryContainer: PIAColors.greenDark,
    background: PIAColors.offWhite,
    surface: PIAColors.white,
    error: PIAColors.error,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 10,
};