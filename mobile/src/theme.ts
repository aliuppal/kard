// Mirrors the color tokens in ../../styles.css so the mobile app and the
// web app look like the same product ("paper & ink": warm neutrals, one
// vermilion accent for offers and the primary action; selections use ink).
import { useColorScheme } from 'react-native';

const light = {
  bg: '#f3eee6',
  surface: '#fffcf7',
  sunk: '#ebe5da',
  ink: '#1d1914',
  ink2: '#3b352d',
  onInk: '#fffcf7',
  muted: '#6b6358',
  line: '#e4ddd1',
  brand: '#c2401a',
  brandInk: '#fffcf7',
  brandText: '#a8340f',
  brandSoft: '#fbe2d6',
  warn: '#7a5200',
  warnSoft: '#f5e9c8',
  danger: '#b42318',
};

export type Theme = typeof light;

const dark: Theme = {
  bg: '#141210',
  surface: '#1c1814',
  sunk: '#221e19',
  ink: '#efe9df',
  ink2: '#d4ccbf',
  onInk: '#141210',
  muted: '#a69c8f',
  line: '#2d2822',
  brand: '#ff7a4a',
  brandInk: '#1f0c04',
  brandText: '#ff9a73',
  brandSoft: '#3b1c10',
  warn: '#f2c14e',
  warnSoft: '#3a2e10',
  danger: '#ff8a7a',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const radius = 18;
