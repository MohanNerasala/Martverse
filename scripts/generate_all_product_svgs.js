const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'db', 'products_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const outBase = path.join(__dirname, '..', 'frontend', 'public', 'products');

// Category aesthetic colors & icons
const categoryThemes = {
  'snacks-namkeen': {
    primary: '#f59e0b',
    secondary: '#d97706',
    bgStart: '#78350f',
    bgEnd: '#b45309',
    badge: 'SNACKS & NAMKEEN',
    tag: 'CRISPY & FRESH'
  },
  'bakery-biscuits': {
    primary: '#d97706',
    secondary: '#b45309',
    bgStart: '#451a03',
    bgEnd: '#78350f',
    badge: 'BAKERY & COOKIES',
    tag: 'OVEN BAKED'
  },
  'beverages-tea-coffee': {
    primary: '#0284c7',
    secondary: '#0369a1',
    bgStart: '#082f49',
    bgEnd: '#075985',
    badge: 'BEVERAGES & TEA',
    tag: '100% REFRESHING'
  },
  'dairy-breakfast': {
    primary: '#06b6d4',
    secondary: '#0891b2',
    bgStart: '#164e63',
    bgEnd: '#0e7490',
    badge: 'DAIRY & BREAKFAST',
    tag: 'FARM FRESH'
  },
  'rice-flours-pulses': {
    primary: '#10b981',
    secondary: '#059669',
    bgStart: '#064e3b',
    bgEnd: '#047857',
    badge: 'RICE, ATTA & PULSES',
    tag: 'PREMIUM GRAINS'
  },
  'spices-cooking-essentials': {
    primary: '#ef4444',
    secondary: '#dc2626',
    bgStart: '#450a0a',
    bgEnd: '#991b1b',
    badge: 'SPICES & COOKING OILS',
    tag: 'PURE & AROMATIC'
  },
  'instant-packaged-foods': {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    bgStart: '#2e1065',
    bgEnd: '#5b21b6',
    badge: 'INSTANT FOODS',
    tag: '2-MIN DELIGHT'
  },
  'personal-care': {
    primary: '#ec4899',
    secondary: '#db2777',
    bgStart: '#500724',
    bgEnd: '#9d174d',
    badge: 'PERSONAL HYGIENE',
    tag: 'DERMA TESTED'
  },
  'household-cleaning': {
    primary: '#3b82f6',
    secondary: '#2563eb',
    bgStart: '#172554',
    bgEnd: '#1e40af',
    badge: 'HOME CARE & CLEANING',
    tag: 'MAX HYGIENE'
  },
  'fresh-produce-fruits-veggies': {
    primary: '#22c55e',
    secondary: '#16a34a',
    bgStart: '#14532d',
    bgEnd: '#15803d',
    badge: 'FRESH PRODUCE',
    tag: 'DAILY HARVEST'
  }
};

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateProductSvg(prod) {
  const catSlug = prod.category?.slug || 'snacks-namkeen';
  const theme = categoryThemes[catSlug] || categoryThemes['snacks-namkeen'];
  
  const brand = escapeXml((prod.brand || 'MARTVERSE').toUpperCase());
  const name = escapeXml(prod.name || 'Premium Item');
  const weight = escapeXml(prod.weight || 'Standard Pack');
  const price = prod.price || 99;
  const mrp = prod.mrp || Math.round(price * 1.15);
  const color = prod.color || theme.primary;

  // Split name if long into 2 lines
  let line1 = name;
  let line2 = '';
  if (name.length > 22) {
    const words = name.split(' ');
    let mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgStart}"/>
      <stop offset="60%" stop-color="${theme.bgEnd}"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${theme.primary}"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Outer Canvas Background -->
  <rect width="400" height="520" rx="28" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="384" height="504" rx="22" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

  <!-- Top Decorative Header Strip -->
  <path d="M 8 28 Q 8 8 28 8 L 372 8 Q 392 8 392 28 L 392 56 L 8 56 Z" fill="url(#accentGrad)"/>
  <text x="200" y="36" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="900" letter-spacing="2" text-anchor="middle">${theme.badge}</text>

  <!-- Central Product Packaging Presentation Plinth -->
  <g filter="url(#cardShadow)">
    <rect x="28" y="74" width="344" height="340" rx="18" fill="url(#cardGrad)"/>
    <rect x="28" y="74" width="344" height="340" rx="18" fill="none" stroke="${theme.primary}" stroke-width="2.5" stroke-opacity="0.4"/>
  </g>

  <!-- Brand Name Banner -->
  <rect x="48" y="94" width="304" height="36" rx="8" fill="#f1f5f9"/>
  <text x="200" y="118" fill="#0f172a" font-family="system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="1" text-anchor="middle">${brand}</text>

  <!-- Veg / Quality Hallmark Icon -->
  <g transform="translate(322, 142)">
    <rect width="26" height="26" rx="4" fill="#ffffff" stroke="#16a34a" stroke-width="2.2"/>
    <circle cx="13" cy="13" r="6" fill="#16a34a"/>
  </g>

  <!-- Product Title -->
  <text x="200" y="${line2 ? 175 : 192}" fill="#0f172a" font-family="system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle">
    ${line1}
  </text>
  ${line2 ? `<text x="200" y="202" fill="#0f172a" font-family="system-ui, sans-serif" font-size="18" font-weight="800" text-anchor="middle">${line2}</text>` : ''}

  <!-- Net Quantity / Weight Pill -->
  <g transform="translate(140, 226)">
    <rect width="120" height="28" rx="14" fill="#e2e8f0"/>
    <text x="60" y="19" fill="#334155" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">NET: ${weight}</text>
  </g>

  <!-- Price & Discount Tag Block -->
  <g transform="translate(68, 272)">
    <rect width="264" height="66" rx="14" fill="url(#accentGrad)"/>
    <!-- Offer Price -->
    <text x="75" y="44" fill="#ffffff" font-family="system-ui, sans-serif" font-size="34" font-weight="900" text-anchor="middle">₹${price}</text>
    <!-- MRP Strikethrough -->
    <text x="180" y="32" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">MRP: ₹${mrp}</text>
    <line x1="140" y1="27" x2="220" y2="27" stroke="rgba(255,255,255,0.85)" stroke-width="2"/>
    <!-- Savings Badge -->
    <text x="180" y="52" fill="#fef08a" font-family="system-ui, sans-serif" font-size="13" font-weight="800" text-anchor="middle">SAVE ₹${Math.max(0, mrp - price)}</text>
  </g>

  <!-- Quality Guarantee Seal -->
  <text x="200" y="375" fill="#64748b" font-family="system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5" text-anchor="middle">★ ${theme.tag} ★</text>

  <!-- Commercial Retail Barcode Strip -->
  <g transform="translate(70, 432)">
    <rect width="260" height="52" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <g fill="#0f172a">
      <rect x="20" y="8" width="3" height="36"/>
      <rect x="26" y="8" width="6" height="36"/>
      <rect x="36" y="8" width="2" height="36"/>
      <rect x="42" y="8" width="5" height="36"/>
      <rect x="52" y="8" width="3" height="36"/>
      <rect x="60" y="8" width="7" height="36"/>
      <rect x="74" y="8" width="2" height="36"/>
      <rect x="80" y="8" width="6" height="36"/>
      <rect x="92" y="8" width="4" height="36"/>
      <rect x="100" y="8" width="8" height="36"/>
      <rect x="114" y="8" width="3" height="36"/>
      <rect x="122" y="8" width="5" height="36"/>
      <rect x="132" y="8" width="2" height="36"/>
      <rect x="140" y="8" width="7" height="36"/>
      <rect x="152" y="8" width="4" height="36"/>
      <rect x="162" y="8" width="8" height="36"/>
      <rect x="176" y="8" width="3" height="36"/>
      <rect x="184" y="8" width="6" height="36"/>
      <rect x="196" y="8" width="4" height="36"/>
      <rect x="206" y="8" width="8" height="36"/>
      <rect x="220" y="8" width="3" height="36"/>
      <rect x="228" y="8" width="6" height="36"/>
      <rect x="238" y="8" width="3" height="36"/>
    </g>
  </g>
</svg>`;
}

let count = 0;
catalog.forEach((prod) => {
  const catSlug = prod.category?.slug || 'snacks-namkeen';
  const slug = prod.slug || prod.id;
  
  const dir = path.join(outBase, catSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${slug}.svg`);
  fs.writeFileSync(filePath, generateProductSvg(prod), 'utf8');
  count++;
});

console.log(`Successfully generated ${count} product SVGs in ${outBase}`);

