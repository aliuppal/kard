// Exports catalog.js + sample-deals.js as JSON for the mobile app, so both
// apps read from the same source data instead of hand-duplicating it.
// Usage: node scripts/export-mobile-data.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['catalog.js', 'sample-deals.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}

const outDir = path.join(root, 'mobile', 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });

const catalog = { banks: ctx.window.BANKS, cities: ctx.window.CITIES, categories: ctx.window.CATEGORIES };
fs.writeFileSync(path.join(outDir, 'catalog.json'), JSON.stringify(catalog, null, 2));
fs.writeFileSync(path.join(outDir, 'sampleDeals.json'), JSON.stringify(ctx.window.RAW_DEALS, null, 2));

console.log('Wrote mobile/src/data/catalog.json (%d banks, %d cities, %d categories)', catalog.banks.length, catalog.cities.length, catalog.categories.length);
console.log('Wrote mobile/src/data/sampleDeals.json (%d deals)', ctx.window.RAW_DEALS.length);
