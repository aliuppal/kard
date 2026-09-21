/* ------------------------------------------------------------------
   DealCard PK — data
   ------------------------------------------------------------------
   !! SAMPLE DATA !!  The deals below are illustrative placeholders
   showing how the app works. They are NOT live, verified bank offers.
   Replace RAW_DEALS with real offers (from bank websites / merchant
   pages / a scraper or API) before relying on it.

   Deal fields
     m        merchant name
     c        category id (see CATEGORIES)
     cities   'all' or an array of city names (see CITIES)
     banks    array of bank ids (see BANKS)
     types    ['credit'], ['debit'] or both
     nets     (optional) restrict to card networks, e.g. ['Visa']
     offer    short headline shown on the badge
     pct      number used for "best discount" sorting
     max/min  (optional) max discount / min spend text
     sched    DAILY | W(days…) | M(dates…) | R(fromOffset, toOffset)
     until    (optional) days from today the offer stays valid (default 45)
     terms    fine print
   ------------------------------------------------------------------ */

window.BANKS = [
  { id: 'hbl',       name: 'HBL',                 short: 'HBL',       color: '#00845a' },
  { id: 'ubl',       name: 'UBL',                 short: 'UBL',       color: '#1d5fb4' },
  { id: 'mcb',       name: 'MCB Bank',            short: 'MCB',       color: '#0f7f3e' },
  { id: 'meezan',    name: 'Meezan Bank',         short: 'Meezan',    color: '#6a1b6f' },
  { id: 'alfalah',   name: 'Bank Alfalah',        short: 'Alfalah',   color: '#d6262c' },
  { id: 'scb',       name: 'Standard Chartered',  short: 'StanChart', color: '#0473ea' },
  { id: 'faysal',    name: 'Faysal Bank',         short: 'Faysal',    color: '#0a6b8a' },
  { id: 'askari',    name: 'Askari Bank',         short: 'Askari',    color: '#b3872a' },
  { id: 'bahl',      name: 'Bank AL Habib',       short: 'BAHL',      color: '#8a1c2b' },
  { id: 'allied',    name: 'Allied Bank',         short: 'ABL',       color: '#1b4d8f' },
  { id: 'hmb',       name: 'Habib Metro Bank',    short: 'HabibMetro',color: '#c0392b' },
  { id: 'js',        name: 'JS Bank',             short: 'JS',        color: '#e0731a' },
  { id: 'soneri',    name: 'Soneri Bank',         short: 'Soneri',    color: '#a6371f' },
  { id: 'bankislami',name: 'BankIslami',          short: 'BankIslami',color: '#1a8a5a' },
  { id: 'bop',       name: 'Bank of Punjab',      short: 'BOP',       color: '#1e6b3c' },
  { id: 'nbp',       name: 'National Bank of Pakistan', short: 'NBP', color: '#2a7a3b' }
];

window.CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Gujranwala'
];

window.CATEGORIES = [
  { id: 'dining',        name: 'Dining',            icon: '🍽️', color: '#c2410c' },
  { id: 'fastfood',      name: 'Fast Food',         icon: '🍔', color: '#dc2626' },
  { id: 'cafes',         name: 'Cafes',             icon: '☕', color: '#92400e' },
  { id: 'groceries',     name: 'Groceries',         icon: '🛒', color: '#15803d' },
  { id: 'fashion',       name: 'Fashion',           icon: '👗', color: '#be185d' },
  { id: 'online',        name: 'Online Shopping',   icon: '📦', color: '#7c3aed' },
  { id: 'electronics',   name: 'Electronics & EMI', icon: '📱', color: '#0369a1' },
  { id: 'travel',        name: 'Travel & Hotels',   icon: '✈️', color: '#0e7490' },
  { id: 'fuel',          name: 'Fuel',              icon: '⛽', color: '#b45309' },
  { id: 'entertainment', name: 'Entertainment',     icon: '🎬', color: '#6d28d9' },
  { id: 'health',        name: 'Health',            icon: '💊', color: '#059669' },
  { id: 'beauty',        name: 'Beauty & Salon',    icon: '💇', color: '#db2777' },
  { id: 'bills',         name: 'Telecom & Bills',   icon: '📶', color: '#475569' },
  { id: 'books',         name: 'Books',             icon: '📚', color: '#4d7c0f' }
];

/* ---- schedule helpers ---- */
const DAILY = { t: 'daily' };
const W = (...days) => ({ t: 'weekly', days });      // 0=Sun … 6=Sat
const M = (...dates) => ({ t: 'monthly', dates });   // day-of-month
const R = (from, to) => ({ t: 'range', from, to }); // offsets in days from today

const KHI = 'Karachi', LHR = 'Lahore', ISB = 'Islamabad', RWP = 'Rawalpindi',
      FSD = 'Faisalabad', MUX = 'Multan', PEW = 'Peshawar', UET = 'Quetta',
      HYD = 'Hyderabad', GRW = 'Gujranwala';
const ALL = 'all';
const BIG = [KHI, LHR, ISB, RWP, FSD, MUX];
const CD = ['credit', 'debit'];

window.RAW_DEALS = [
  /* ---------- Dining ---------- */
  { m: 'Kababjees', c: 'dining', cities: [KHI, LHR, ISB], banks: ['ubl', 'meezan'], types: CD, offer: '20% off', pct: 20, max: 'Rs 1,500', sched: W(2), terms: 'Dine-in only. Not combinable with other promotions.' },
  { m: 'Savour Foods', c: 'dining', cities: [ISB, RWP, LHR], banks: ['hbl'], types: ['credit'], offer: '25% off', pct: 25, max: 'Rs 2,000', sched: W(1, 3), terms: 'Dine-in and takeaway. Excludes beverages.' },
  { m: "Xander's", c: 'dining', cities: [KHI], banks: ['hbl', 'scb'], types: ['credit'], offer: '20% off', pct: 20, sched: W(0), terms: 'Valid on food bill before tax.' },
  { m: 'Bar.B.Q Tonight', c: 'dining', cities: [KHI, LHR, ISB], banks: ['alfalah'], types: ['credit'], offer: '20% off', pct: 20, max: 'Rs 2,500', sched: W(1, 2, 3, 4), terms: 'Dine-in only, weekdays.' },
  { m: 'Monal', c: 'dining', cities: [ISB, LHR], banks: ['askari', 'bahl'], types: CD, offer: '15% off', pct: 15, sched: W(4, 5), terms: 'Dine-in only. Advance booking recommended.' },
  { m: 'Kolachi', c: 'dining', cities: [KHI], banks: ['allied', 'soneri'], types: CD, offer: '15% off', pct: 15, sched: W(3), terms: 'Valid on total food bill.' },
  { m: "Cooco's Den", c: 'dining', cities: [LHR], banks: ['js', 'bop'], types: CD, offer: '15% off', pct: 15, sched: W(4), terms: 'Dine-in only.' },

  /* ---------- Fast food ---------- */
  { m: "Hardee's", c: 'fastfood', cities: ALL, banks: ['alfalah'], types: CD, offer: '15% off', pct: 15, sched: DAILY, terms: 'Dine-in and takeaway. Delivery excluded.' },
  { m: 'KFC', c: 'fastfood', cities: ALL, banks: ['mcb', 'ubl'], types: ['debit'], offer: '10% off', pct: 10, sched: DAILY, terms: 'Valid on dine-in and takeaway.' },
  { m: 'Pizza Hut', c: 'fastfood', cities: ALL, banks: ['scb'], types: ['credit'], offer: '20% off', pct: 20, sched: W(4), terms: 'Dine-in only on Thursdays.' },
  { m: "McDonald's", c: 'fastfood', cities: ALL, banks: ['faysal'], types: ['credit'], offer: '15% off', pct: 15, sched: W(5, 6), terms: 'Weekend offer. Excludes deals and combos already discounted.' },
  { m: 'Cheezious', c: 'fastfood', cities: [KHI, LHR, ISB, RWP, FSD, PEW], banks: ['meezan'], types: CD, offer: '20% off', pct: 20, max: 'Rs 800', sched: W(3), terms: 'Dine-in only.' },
  { m: 'Broadway Pizza', c: 'fastfood', cities: [LHR, ISB, RWP, FSD, MUX], banks: ['js'], types: ['credit'], offer: '20% off', pct: 20, sched: W(2), terms: 'Dine-in and takeaway.' },
  { m: "Domino's", c: 'fastfood', cities: ALL, banks: ['bankislami'], types: CD, offer: '25% off', pct: 25, max: 'Rs 1,000', sched: W(1), terms: 'Online orders via the Domino\'s app or website.' },
  { m: 'Subway', c: 'fastfood', cities: BIG, banks: ['hbl'], types: ['debit'], offer: '10% off', pct: 10, sched: W(0), terms: 'Dine-in and takeaway.' },

  /* ---------- Cafes ---------- */
  { m: "Gloria Jean's Coffees", c: 'cafes', cities: [KHI, LHR, ISB], banks: ['ubl'], types: CD, offer: 'Buy 1 Get 1', pct: 50, sched: W(5), terms: 'On selected beverages. Lower-priced item is free.' },
  { m: 'Espresso', c: 'cafes', cities: [LHR, ISB], banks: ['bahl'], types: CD, offer: '15% off', pct: 15, sched: W(6, 0), terms: 'Weekend offer.' },
  { m: 'Butlers Chocolate Café', c: 'cafes', cities: [LHR, ISB], banks: ['alfalah'], types: ['credit'], offer: '15% off', pct: 15, sched: R(-4, 9), terms: 'On café menu items.' },

  /* ---------- Groceries ---------- */
  { m: 'Imtiaz Supermarket', c: 'groceries', cities: [KHI, HYD], banks: ['hbl', 'mcb'], types: CD, offer: '5% off', pct: 5, max: 'Rs 1,000', min: 'Rs 5,000', sched: W(3), terms: 'Wednesday shopping offer.' },
  { m: 'Carrefour', c: 'groceries', cities: [KHI, LHR, ISB], banks: ['ubl', 'scb'], types: ['credit'], offer: '10% off', pct: 10, max: 'Rs 2,500', min: 'Rs 10,000', sched: M(1, 15), terms: 'Valid on the 1st and 15th of every month.' },
  { m: 'Al-Fatah', c: 'groceries', cities: [LHR, RWP, ISB, GRW, FSD], banks: ['bahl'], types: CD, offer: '7% off', pct: 7, max: 'Rs 1,500', sched: W(6, 0), terms: 'Weekend offer. Excludes dairy and baby products.' },
  { m: 'Metro Cash & Carry', c: 'groceries', cities: [KHI, LHR, ISB, FSD, MUX, PEW], banks: ['meezan'], types: CD, offer: '8% off', pct: 8, max: 'Rs 3,000', sched: R(-2, 12), terms: 'Valid for a limited period.' },
  { m: 'Naheed Supermarket', c: 'groceries', cities: [KHI], banks: ['faysal'], types: CD, offer: '10% off', pct: 10, sched: W(2), terms: 'Tuesday offer.' },
  { m: 'Chase Up', c: 'groceries', cities: [KHI], banks: ['hmb'], types: CD, offer: '10% off', pct: 10, sched: W(1), terms: 'Excludes sugar, flour and ghee.' },

  /* ---------- Fashion ---------- */
  { m: 'Khaadi', c: 'fashion', cities: ALL, banks: ['hbl', 'alfalah', 'scb'], types: ['credit'], offer: '15% off', pct: 15, sched: R(-3, 7), terms: 'On regular-price items. Sale items excluded.' },
  { m: 'Sapphire', c: 'fashion', cities: ALL, banks: ['ubl'], types: CD, offer: '12% off', pct: 12, sched: R(-1, 10), terms: 'In-store and online.' },
  { m: 'Alkaram Studio', c: 'fashion', cities: ALL, banks: ['mcb'], types: ['credit'], offer: '10% off', pct: 10, sched: W(5), terms: 'Friday offer on regular-price items.' },
  { m: 'Gul Ahmed', c: 'fashion', cities: ALL, banks: ['meezan'], types: CD, offer: '15% off', pct: 15, sched: R(2, 16), terms: 'Upcoming festival offer.' },
  { m: 'Bonanza Satrangi', c: 'fashion', cities: ALL, banks: ['askari'], types: ['credit'], offer: '20% off', pct: 20, max: 'Rs 4,000', sched: M(1, 10, 25), terms: 'Valid on the 1st, 10th and 25th of every month.' },
  { m: 'Outfitters', c: 'fashion', cities: [KHI, LHR, ISB, RWP, FSD, MUX, PEW], banks: ['js'], types: CD, offer: '10% off', pct: 10, sched: W(3), terms: 'Wednesday offer.' },
  { m: 'Bata', c: 'fashion', cities: ALL, banks: ['allied'], types: CD, offer: '15% off', pct: 15, sched: W(6), terms: 'On selected footwear.' },
  { m: 'Junaid Jamshed', c: 'fashion', cities: BIG, banks: ['nbp'], types: ['debit'], offer: '10% off', pct: 10, sched: W(2), terms: 'On regular-price items.' },
  { m: 'Servis', c: 'fashion', cities: ALL, banks: ['bop'], types: CD, offer: '12% off', pct: 12, sched: W(0), terms: 'Sunday offer on selected footwear.' },

  /* ---------- Online shopping ---------- */
  { m: 'Daraz', c: 'online', cities: ALL, banks: ['hbl', 'alfalah'], types: ['credit'], offer: '12% off', pct: 12, max: 'Rs 1,200', min: 'Rs 3,000', sched: M(25), terms: 'Payday sale — valid on the 25th of every month.' },
  { m: 'Daraz (UnionPay)', c: 'online', cities: ALL, banks: ['hbl', 'ubl', 'mcb'], types: CD, nets: ['UnionPay'], offer: '15% off', pct: 15, max: 'Rs 1,500', sched: R(0, 3), terms: 'UnionPay cards only. Limited-time.' },
  { m: 'foodpanda', c: 'online', cities: ALL, banks: ['ubl', 'faysal'], types: CD, offer: '25% off', pct: 25, max: 'Rs 500', min: 'Rs 1,200', sched: W(5), terms: 'Friday food-delivery offer.' },

  /* ---------- Electronics & EMI ---------- */
  { m: 'Homeshopping.pk', c: 'electronics', cities: ALL, banks: ['hbl', 'ubl', 'scb'], types: ['credit'], offer: '0% EMI 12 mo', pct: 0, min: 'Rs 30,000', sched: M(1, 15), terms: 'Interest-free instalments. Processing fee may apply.' },
  { m: 'Shophive', c: 'electronics', cities: ALL, banks: ['meezan'], types: CD, offer: '10% off', pct: 10, max: 'Rs 5,000', sched: R(0, 9), terms: 'On selected laptops and accessories.' },
  { m: 'Telemart', c: 'electronics', cities: ALL, banks: ['mcb', 'bahl'], types: ['credit'], offer: '0% EMI 6 mo', pct: 0, min: 'Rs 20,000', sched: DAILY, terms: 'Interest-free instalments on selected items.' },

  /* ---------- Travel & hotels ---------- */
  { m: 'PIA', c: 'travel', cities: ALL, banks: ['hbl', 'mcb'], types: ['credit'], offer: '10% off', pct: 10, sched: R(1, 20), terms: 'On domestic economy fares booked online.' },
  { m: 'Airblue', c: 'travel', cities: ALL, banks: ['alfalah'], types: CD, offer: '8% off', pct: 8, sched: W(2), terms: 'On base fare, booked on Tuesdays.' },
  { m: 'Pearl-Continental Hotels', c: 'travel', cities: [KHI, LHR, ISB, RWP, PEW], banks: ['scb'], types: ['credit'], nets: ['Visa', 'Mastercard'], offer: '25% off', pct: 25, sched: W(5, 6, 0), terms: 'Dining at hotel restaurants over the weekend.' },
  { m: 'Serena Hotels', c: 'travel', cities: [ISB, PEW, UET], banks: ['ubl'], types: ['credit'], offer: '20% off', pct: 20, sched: W(6, 0), terms: 'Restaurant and café bills.' },
  { m: 'Daewoo Express', c: 'travel', cities: ALL, banks: ['faysal'], types: ['debit'], offer: '10% off', pct: 10, sched: W(1), terms: 'On online ticket bookings.' },
  { m: 'Careem', c: 'travel', cities: BIG, banks: ['alfalah'], types: CD, offer: '15% off rides', pct: 15, max: 'Rs 300', sched: DAILY, terms: 'First 2 rides each day.' },

  /* ---------- Fuel ---------- */
  { m: 'Shell', c: 'fuel', cities: ALL, banks: ['hbl'], types: ['credit'], offer: 'Rs 5/L off', pct: 3, max: 'Rs 1,000 / month', sched: DAILY, terms: 'On Shell V-Power and regular fuel.' },
  { m: 'PSO', c: 'fuel', cities: ALL, banks: ['alfalah', 'ubl'], types: CD, offer: 'Rs 3/L off', pct: 2, sched: W(1, 4), terms: 'Mondays and Thursdays.' },
  { m: 'Total Parco', c: 'fuel', cities: ALL, banks: ['mcb'], types: ['debit'], offer: 'Rs 4/L off', pct: 2, sched: W(2), terms: 'Tuesday fuel offer.' },
  { m: 'Attock Petroleum', c: 'fuel', cities: ALL, banks: ['askari'], types: CD, offer: 'Rs 4/L off', pct: 2, sched: R(0, 20), terms: 'Limited-time fuel offer.' },

  /* ---------- Entertainment ---------- */
  { m: 'Cinepax', c: 'entertainment', cities: [KHI, LHR, ISB, RWP, FSD, MUX, PEW], banks: ['ubl'], types: CD, offer: 'Buy 1 Get 1', pct: 50, sched: W(2), terms: 'Tuesday tickets on selected shows.' },
  { m: 'Nueplex Cinemas', c: 'entertainment', cities: [KHI], banks: ['meezan'], types: CD, offer: '30% off', pct: 30, sched: W(3), terms: 'On movie tickets.' },
  { m: 'Sozo Water Park', c: 'entertainment', cities: [LHR], banks: ['bop'], types: CD, offer: '20% off', pct: 20, sched: W(6), terms: 'Entry tickets.' },

  /* ---------- Health ---------- */
  { m: 'Chughtai Lab', c: 'health', cities: [LHR, KHI, ISB, RWP, FSD, MUX, GRW], banks: ['hbl', 'ubl'], types: CD, offer: '20% off tests', pct: 20, sched: DAILY, terms: 'On selected lab tests. Home sampling excluded.' },
  { m: 'Excel Labs', c: 'health', cities: [KHI, LHR], banks: ['bahl'], types: CD, offer: '25% off tests', pct: 25, sched: R(0, 30), terms: 'On pathology tests.' },
  { m: 'Dawaai', c: 'health', cities: ALL, banks: ['hmb'], types: CD, offer: '10% off', pct: 10, sched: DAILY, terms: 'Online pharmacy orders.' },
  { m: 'Dvago', c: 'health', cities: ALL, banks: ['alfalah'], types: CD, offer: '15% off', pct: 15, max: 'Rs 500', sched: DAILY, terms: 'Online pharmacy orders.' },

  /* ---------- Beauty ---------- */
  { m: 'Nabila', c: 'beauty', cities: [KHI, LHR, ISB], banks: ['hbl'], types: ['credit'], offer: '20% off', pct: 20, sched: W(1, 2), terms: 'On salon services. Bridal excluded.' },
  { m: 'Depilex', c: 'beauty', cities: [KHI, LHR, ISB, FSD], banks: ['meezan'], types: CD, offer: '15% off', pct: 15, sched: W(3), terms: 'On selected services.' },

  /* ---------- Telecom & bills ---------- */
  { m: 'Jazz', c: 'bills', cities: ALL, banks: ['js', 'soneri'], types: ['debit'], offer: '5% cashback', pct: 5, max: 'Rs 200', sched: R(0, 14), terms: 'On bill payment and package purchase.' },
  { m: 'Zong 4G', c: 'bills', cities: ALL, banks: ['bankislami'], types: CD, offer: '8% cashback', pct: 8, sched: W(6), terms: 'On bundles bought through the app.' },

  /* ---------- Books ---------- */
  { m: 'Readings', c: 'books', cities: [KHI, LHR, ISB], banks: ['ubl'], types: CD, offer: '15% off', pct: 15, sched: W(6), terms: 'On books; stationery excluded.' },
  { m: 'Liberty Books', c: 'books', cities: [KHI, LHR, ISB], banks: ['bop'], types: CD, offer: '10% off', pct: 10, sched: W(0), terms: 'Sunday offer.' }
];
