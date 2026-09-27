// Small date helpers shared by the deals screens — mirrors ../../../app.js.
export const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MON_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MS_DAY = 86400000;

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dayDiff = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / MS_DAY);
export const fmt = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]}`;
export const fmtLong = (d: Date) => `${DAY_FULL[d.getDay()]}, ${fmt(d)}`;
export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
export const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

export const listJoin = (arr: string[]) =>
  arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} & ${arr[arr.length - 1]}`;

export const ord = (n: number) => {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
