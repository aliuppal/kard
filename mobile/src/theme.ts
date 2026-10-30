// Mirrors the colour tokens in ../../styles.css so the mobile app and the web app
// look like the same product ("wallet & receipt": near-grey neutrals, one vermilion
// accent for the main action and today; selections use ink).
import { useColorScheme } from 'react-native';

const light = {
  bg: '#f6f5f2',
  surface: '#fdfdfb',
  sunk: '#efeee9',
  ink: '#1c1a17',
  ink2: '#57534c',
  onInk: '#fdfdfb',
  muted: '#716c65',
  line: '#e6e4df',
  brand: '#c2401a',
  brandInk: '#ffffff',
  brandText: '#a8340f',
  brandSoft: '#efeee9',
  warn: '#7a4b05',
  warnSoft: '#f3e8d2',
  danger: '#dc2626',
};

export type Theme = typeof light;

const dark: Theme = {
  bg: '#141413',
  surface: '#1b1a19',
  sunk: '#252422',
  ink: '#edebe7',
  ink2: '#a6a29b',
  onInk: '#141413',
  muted: '#8b867f',
  line: '#2a2927',
  brand: '#ff7a4a',
  brandInk: '#1a0b04',
  brandText: '#ff8a5c',
  brandSoft: '#252422',
  warn: '#eec05a',
  warnSoft: '#33280f',
  danger: '#e5484d',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const radius = 16;
