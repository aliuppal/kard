/* Kard — monoline SVG icons (24px grid, 1.7 stroke, currentColor).
   Category icons are keyed by the ids in catalog.js; the emoji there stay as the
   mobile/offline fallback. Used by index.html and admin.html. */
(function () {
  const P = {
    // categories
    dining: '<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10"/><path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17"/>',
    fastfood: '<path d="M4 11a8 6 0 0 1 16 0z"/><path d="M3.5 14.5h17"/><path d="M5 18h14a1.5 1.5 0 0 1-1.5 2h-11A1.5 1.5 0 0 1 5 18z"/>',
    cafes: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3"/>',
    groceries: '<path d="M3 4h2.2l2.3 11h10.2l2-8H6.3"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="16.5" cy="19.5" r="1.3"/>',
    fashion: '<path d="M9 3.5 4 6l1.6 4.5L8 9.7V20.5h8V9.7l2.4.8L20 6l-5-2.5a3 3 0 0 1-6 0z"/>',
    online: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    electronics: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    travel: '<path d="M10.5 13.5 3 11l1.5-1.5 7.5 1 4.2-4.3a2 2 0 0 1 2.8 2.8L14.7 13.2l1 7.3-1.5 1.5-2.4-7.4"/><path d="m6 16 2.5 2.5"/>',
    fuel: '<path d="M5 21V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14 5v16M3.5 21h12M5 10h9"/><path d="M14 8h2a2 2 0 0 1 2 2v6.5a1.5 1.5 0 0 0 3 0V8.5L18.5 6"/>',
    entertainment: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m3 10 18-4M7.5 5.3l2 3.8M13.5 4l2 3.8"/>',
    health: '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m9.5 9.5 5 5"/>',
    beauty: '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/><path d="M8.6 8 20 17.5M8.6 16 20 6.5"/>',
    bills: '<path d="M4 20V16M9 20v-7M14 20V9.5M19 20V5"/>',
    books: '<path d="M4 4.5h5a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H4zM20 4.5h-5a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H20z"/>',
    // ui
    all: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    tag: '<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.3 6.3a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    coins: '<ellipse cx="9" cy="7" rx="5.5" ry="2.5"/><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7"/><path d="M9.5 16.4c.6 1.2 2.9 2.1 5.5 2.1 3 0 5.5-1.1 5.5-2.5v-4c0-1.2-1.8-2.2-4.3-2.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="m14.5 6-6 6 6 6"/>',
    right: '<path d="m9.5 6 6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
  };
  window.KARD_ICON = function (name, size) {
    const d = P[name] || P.tag, s = size || 18;
    return '<svg class="i" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  };
})();
