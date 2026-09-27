// Filtering + sorting logic shared by the deals screens — the mobile twin of
// filtered()/sortDeals() in ../../../app.js.
import { Deal, catOf } from './deals';
import { Filters } from '../context/AppContext';
import { Card } from './wallet';

export function filterDeals(deals: Deal[], filters: Filters, matchCards: (d: Deal) => Card[], mine: boolean): Deal[] {
  const q = filters.q.trim().toLowerCase();
  return deals.filter(d => {
    if (filters.city !== 'all' && d.cities !== 'all' && !d.cities.includes(filters.city)) return false;
    if (filters.cat !== 'all' && d.c !== filters.cat) return false;
    if (filters.type !== 'all' && !d.types.includes(filters.type)) return false;
    if (filters.bank !== 'all' && !d.banks.includes(filters.bank)) return false;
    if (q && !`${d.m} ${d.offer} ${catOf(d.c).name}`.toLowerCase().includes(q)) return false;
    if (mine && !matchCards(d).length) return false;
    return true;
  });
}

export function sortDeals(deals: Deal[], sort: Filters['sort']): Deal[] {
  const a = deals.slice();
  if (sort === 'az') a.sort((x, y) => x.m.localeCompare(y.m));
  else if (sort === 'ending') a.sort((x, y) => x.until.getTime() - y.until.getTime() || y.pct - x.pct);
  else a.sort((x, y) => y.pct - x.pct || x.m.localeCompare(y.m));
  return a;
}

export function activeFilterCount(filters: Filters): number {
  let n = 0;
  if (filters.city !== 'all') n++;
  if (filters.type !== 'all') n++;
  if (filters.bank !== 'all') n++;
  if (filters.q.trim()) n++;
  if (filters.sort !== 'best') n++;
  return n;
}
