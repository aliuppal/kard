// Exports catalog.js + sample-deals.js as JSON for the mobile app, so both
// apps read from the same source data instead of hand-duplicating it.
// Usage: node scripts/export-mobile-data.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['catalog.js', 'sample-deals.js', 'deals.js']) {
  if (!fs.existsSync(path.join(root, f))) continue;
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}

const outDir = path.join(root, 'mobile', 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });

const catalog = { banks: ctx.window.BANKS, cities: ctx.window.CITIES, categories: ctx.window.CATEGORIES, products: ctx.window.CARD_PRODUCTS || [] };
fs.writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(catalog, null, 2));
fs.writeFileSync(path.join(outDir, 'sampleDeals.json'), JSON.stringify(ctx.window.RAW_DEALS, null, 2));
const real = { asOf: ctx.window.REAL_DEALS_ASOF || null, deals: ctx.window.REAL_DEALS || [] };
fs.writeFileSync(path.join(outDir, 'realDeals.json'), JSON.stringify(real, null, 2));

console.log('Wrote mobile/src/data/catalog.json (%d banks, %d cities, %d categories, %d cards)', catalog.banks.length, catalog.cities.length, catalog.categories.length, catalog.products.length);
console.log('Wrote mobile/src/data/realDeals.json (%d deals)', real.deals.length);
console.log('Wrote mobile/src/data/sampleDeals.json (%d deals)', ctx.window.RAW_DEALS.length);
