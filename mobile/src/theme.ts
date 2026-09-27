// Mirrors the color tokens in ../../styles.css so the mobile app and the
// web app look like the same product.
import { useColorScheme } from 'react-native';

const light = {
  bg: '#f5f7f4',
  surface: '#ffffff',
  ink: '#15211b',
  muted: '#5b6a61',
  line: '#e2e8e3',
  brand: '#0b7a4b',
  brandInk: '#ffffff',
  brandSoft: '#e2f4eb',
  warn: '#b45309',
  warnSoft: '#fef3c7',
  danger: '#c0392b',
};

const dark = {
  bg: '#0e1411',
  surface: '#17201b',
  ink: '#e8f0ea',
  muted: '#9aaba1',
  line: '#26332b',
  brand: '#35c68a',
  brandInk: '#04150d',
  brandSoft: '#16342a',
  warn: '#fbbf24',
  warnSoft: '#3a2e0c',
  danger: '#ff8a7a',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const radius = 14;
