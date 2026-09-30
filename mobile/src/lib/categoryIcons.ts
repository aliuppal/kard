// Line icons for categories (MaterialCommunityIcons names), keyed by the ids in
// catalog.json. Replaces the emoji in the catalog for display; mirrors ../../icons.js.
import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICONS: Record<string, IconName> = {
  all: 'view-grid-outline',
  dining: 'silverware-fork-knife',
  fastfood: 'hamburger',
  cafes: 'coffee-outline',
  groceries: 'cart-outline',
  fashion: 'tshirt-crew-outline',
  online: 'package-variant-closed',
  electronics: 'cellphone',
  travel: 'airplane',
  fuel: 'gas-station-outline',
  entertainment: 'movie-open-outline',
  health: 'pill',
  beauty: 'content-cut',
  bills: 'signal-cellular-3',
  books: 'book-open-page-variant-outline',
};

export const categoryIcon = (id: string): IconName => ICONS[id] || 'tag-outline';
