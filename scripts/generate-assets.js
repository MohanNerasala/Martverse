const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'frontend', 'public', 'products');

function barcodeSvg() {
  return `
    <rect x="70" y="420" width="260" height="48" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <g fill="#0f172a">
      <rect x="88" y="428" width="4" height="32"/>
      <rect x="96" y="428" width="8" height="32"/>
      <rect x="108" y="428" width="3" height="32"/>
      <rect x="116" y="428" width="6" height="32"/>
      <rect x="128" y="428" width="4" height="32"/>
      <rect x="138" y="428" width="9" height="32"/>
      <rect x="154" y="428" width="4" height="32"/>
      <rect x="164" y="428" width="7" height="32"/>
      <rect x="176" y="428" width="8" height="32"/>
      <rect x="189" y="428" width="4" height="32"/>
      <rect x="198" y="428" width="6" height="32"/>
      <rect x="210" y="428" width="4" height="32"/>
      <rect x="218" y="428" width="8" height="32"/>
      <rect x="232" y="428" width="5" height="32"/>
      <rect x="243" y="428" width="10" height="32"/>
      <rect x="260" y="428" width="4" height="32"/>
      <rect x="270" y="428" width="6" height="32"/>
      <rect x="282" y="428" width="4" height="32"/>
      <rect x="292" y="428" width="8" height="32"/>
    </g>
  `;
}

function vegIcon(x, y) {
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="22" height="22" rx="4" fill="#ffffff" stroke="#15803d" stroke-width="2"/>
      <circle cx="11" cy="11" r="5" fill="#15803d"/>
    </g>
  `;
}

const products = [
  // ── SNACKS ─────────────────────────────────────────────────────────────
  {
    folder: 'snacks',
    file: 'kurkure-masala-munch.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="50%" stop-color="#c2410c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </linearGradient>
          <radialGradient id="sun" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        <circle cx="200" cy="180" r="160" fill="url(#sun)"/>
        ${vegIcon(348, 28)}
        <rect x="30" y="30" width="100" height="28" rx="6" fill="#15803d"/>
        <text x="80" y="49" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">TEDHE MEDHE</text>
        
        <!-- Logo -->
        <g transform="translate(200, 110)">
          <path d="M-130 -10 C-60 -35 60 -35 130 -10 C140 30 -140 30 -130 -10 Z" fill="#15803d" stroke="#facc15" stroke-width="3"/>
          <text y="14" font-family="'Arial Black', Impact, sans-serif" font-size="44" fill="#ffffff" font-weight="900" text-anchor="middle" letter-spacing="2">Kurkure</text>
        </g>
        
        <text x="200" y="165" font-family="'Arial Black', Impact, sans-serif" font-size="28" fill="#facc15" font-weight="900" text-anchor="middle" letter-spacing="1">MASALA MUNCH</text>
        <text x="200" y="190" font-family="system-ui, sans-serif" font-size="14" fill="#fed7aa" font-weight="700" text-anchor="middle">CHATPATI MASTI • CRUNCHY CORN PUFFS</text>
        
        <!-- Snack illustration -->
        <g transform="translate(200, 280)">
          <ellipse cx="0" cy="50" rx="90" ry="16" fill="#000000" opacity="0.3"/>
          <path d="M-60 10 Q -30 -40 0 10 Q 30 60 60 10 Q 20 20 -10 -10 Z" fill="#f97316" stroke="#ca8a04" stroke-width="4"/>
          <path d="M-40 40 Q -10 -10 20 40 Q 50 80 80 30" fill="none" stroke="#facc15" stroke-width="8" stroke-linecap="round"/>
          <path d="M-80 0 Q -50 -50 -20 0 Q 10 50 40 0" fill="none" stroke="#ea580c" stroke-width="10" stroke-linecap="round"/>
          <circle cx="-15" cy="5" r="3" fill="#dc2626"/>
          <circle cx="25" cy="-8" r="4" fill="#dc2626"/>
          <circle cx="5" cy="28" r="3" fill="#15803d"/>
        </g>

        <!-- Price Badge -->
        <g transform="translate(60, 360)">
          <circle r="34" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
          <text y="-4" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle">ONLY</text>
          <text y="18" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#b45309" text-anchor="middle">₹20</text>
        </g>

        <!-- Net Weight -->
        <rect x="270" y="345" width="90" height="32" rx="8" fill="#15803d"/>
        <text x="315" y="366" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">90 g</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'lays-classic-salted.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="50%" stop-color="#facc15"/>
            <stop offset="100%" stop-color="#eab308"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}
        
        <!-- Lay's Sun Logo -->
        <g transform="translate(200, 120)">
          <circle r="75" fill="#f59e0b" stroke="#ffffff" stroke-width="5"/>
          <circle r="68" fill="#eab308"/>
          <path d="M-85 -10 Q 0 -30 85 -10 Q 90 20 80 30 Q 0 10 -80 30 Z" fill="#dc2626"/>
          <text y="18" font-family="'Arial Black', Impact, sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic">Lay's</text>
        </g>
        
        <rect x="60" y="215" width="280" height="42" rx="10" fill="#1e3a8a"/>
        <text x="200" y="244" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">CLASSIC SALTED</text>
        <text x="200" y="280" font-family="system-ui, sans-serif" font-size="14" fill="#854d0e" font-weight="800" text-anchor="middle">100% REAL FARM POTATOES</text>

        <!-- Potato Chips illustration -->
        <g transform="translate(200, 340)">
          <ellipse cx="0" cy="40" rx="95" ry="14" fill="#713f12" opacity="0.25"/>
          <ellipse cx="-35" cy="0" rx="55" ry="32" fill="#fde047" stroke="#ca8a04" stroke-width="3" transform="rotate(-15)"/>
          <ellipse cx="35" cy="10" rx="60" ry="35" fill="#fef08a" stroke="#ca8a04" stroke-width="3" transform="rotate(20)"/>
          <ellipse cx="0" cy="-15" rx="58" ry="32" fill="#fef9c3" stroke="#eab308" stroke-width="3"/>
        </g>

        <!-- Weight and Price -->
        <rect x="40" y="375" width="80" height="30" rx="6" fill="#1e3a8a"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">73 g</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#dc2626"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹30</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'lays-magic-masala.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="60%" stop-color="#172554"/>
            <stop offset="100%" stop-color="#090d16"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- Lay's Sun Logo -->
        <g transform="translate(200, 115)">
          <circle r="72" fill="#f59e0b" stroke="#ffffff" stroke-width="4"/>
          <circle r="65" fill="#eab308"/>
          <path d="M-85 -10 Q 0 -30 85 -10 Q 90 20 80 30 Q 0 10 -80 30 Z" fill="#dc2626"/>
          <text y="18" font-family="'Arial Black', Impact, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic">Lay's</text>
        </g>

        <rect x="40" y="205" width="320" height="42" rx="10" fill="#dc2626"/>
        <text x="200" y="234" font-family="'Arial Black', sans-serif" font-size="20" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">INDIA'S MAGIC MASALA</text>
        <text x="200" y="270" font-family="system-ui, sans-serif" font-size="14" fill="#93c5fd" font-weight="800" text-anchor="middle">SPICY & CRUNCHY RIDGED CHIPS</text>

        <!-- Spices & Chips -->
        <g transform="translate(200, 335)">
          <ellipse cx="0" cy="40" rx="90" ry="14" fill="#000000" opacity="0.4"/>
          <ellipse cx="-30" cy="5" rx="55" ry="32" fill="#f97316" stroke="#c2410c" stroke-width="3" transform="rotate(-15)"/>
          <ellipse cx="30" cy="15" rx="58" ry="32" fill="#fb923c" stroke="#c2410c" stroke-width="3" transform="rotate(20)"/>
          <!-- Red chili illustration -->
          <path d="M-10 10 Q 15 -25 35 -10 Q 15 -5 -10 10" fill="#dc2626"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e40af"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">115 g</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#dc2626"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹50</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'bingo-mad-angles.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b91c1c"/>
            <stop offset="70%" stop-color="#7f1d1d"/>
            <stop offset="100%" stop-color="#450a0a"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <text x="200" y="85" font-family="'Arial Black', Impact, sans-serif" font-size="52" font-weight="900" fill="#facc15" text-anchor="middle" stroke="#000000" stroke-width="2">BINGO!</text>
        
        <rect x="50" y="115" width="300" height="42" rx="10" fill="#f97316"/>
        <text x="200" y="144" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">MAD ANGLES</text>
        <text x="200" y="185" font-family="system-ui, sans-serif" font-size="18" fill="#fde047" font-weight="900" text-anchor="middle">ACHAARI MASTI</text>

        <!-- Triangle chips illustration -->
        <g transform="translate(200, 290)">
          <polygon points="0,-70 70,50 -70,50" fill="#facc15" stroke="#ca8a04" stroke-width="4" transform="rotate(-15)"/>
          <polygon points="10,-60 80,60 -60,60" fill="#fde047" stroke="#ea580c" stroke-width="3" transform="rotate(25)"/>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#f97316"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">66 g</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#7f1d1d" text-anchor="middle">₹20</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'doritos-nacho-cheese.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#b91c1c"/>
            <stop offset="60%" stop-color="#991b1b"/>
            <stop offset="100%" stop-color="#180404"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- Doritos Logo -->
        <g transform="translate(200, 100)">
          <polygon points="-80,20 -20,-30 80,-10 60,30" fill="#f97316"/>
          <text y="14" font-family="'Arial Black', Impact, sans-serif" font-size="48" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic" stroke="#000" stroke-width="2">Doritos</text>
        </g>

        <rect x="60" y="160" width="280" height="38" rx="8" fill="#f59e0b"/>
        <text x="200" y="186" font-family="'Arial Black', sans-serif" font-size="20" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="1">NACHO CHEESE</text>
        
        <!-- Tortilla chip -->
        <g transform="translate(200, 290)">
          <polygon points="0,-75 75,55 -75,55" fill="#f59e0b" stroke="#b45309" stroke-width="4" transform="rotate(10)"/>
          <path d="M-30 20 Q 0 45 30 20 Q 40 50 -20 40" fill="#fef08a" opacity="0.9"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e293b"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">82.5 g</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#f59e0b"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#000000" text-anchor="middle">₹30</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'parle-g-biscuits.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#facc15"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- Parle-G Banner -->
        <rect x="30" y="60" width="340" height="70" rx="14" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
        <text x="200" y="112" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">Parle-G</text>

        <text x="200" y="165" font-family="'Arial Black', sans-serif" font-size="18" fill="#1e3a8a" font-weight="900" text-anchor="middle">ORIGINAL GLUCOSE BISCUITS</text>
        <text x="200" y="190" font-family="system-ui, sans-serif" font-size="14" fill="#b45309" font-weight="800" text-anchor="middle">G MEANS GENIUS • WITH MILK & WHEAT</text>

        <!-- Nostalgic Biscuit Graphic -->
        <g transform="translate(200, 280)">
          <rect x="-80" y="-45" width="160" height="90" rx="8" fill="#d97706" stroke="#92400e" stroke-width="4"/>
          <text x="0" y="10" font-family="'Arial Black', sans-serif" font-size="24" fill="#fef08a" text-anchor="middle">Parle-G</text>
        </g>

        <rect x="40" y="375" width="100" height="30" rx="6" fill="#1e3a8a"/>
        <text x="90" y="395" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">800 g Family</text>
        
        <rect x="260" y="375" width="100" height="30" rx="6" fill="#dc2626"/>
        <text x="310" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹75</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'britannia-good-day.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="60%" stop-color="#0369a1"/>
            <stop offset="100%" stop-color="#075985"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <ellipse cx="200" cy="80" rx="70" ry="24" fill="#dc2626"/>
        <text x="200" y="86" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" font-weight="900" text-anchor="middle">BRITANNIA</text>

        <text x="200" y="145" font-family="'Brush Script MT', cursive, sans-serif" font-size="46" fill="#fde047" text-anchor="middle">Good Day</text>
        
        <rect x="70" y="165" width="260" height="36" rx="8" fill="#f59e0b"/>
        <text x="200" y="189" font-family="'Arial Black', sans-serif" font-size="18" fill="#000" font-weight="900" text-anchor="middle">CASHEW COOKIES</text>

        <!-- Cookie illustration -->
        <g transform="translate(200, 285)">
          <circle r="60" fill="#d97706" stroke="#92400e" stroke-width="4"/>
          <!-- Smile curves -->
          <path d="M-30 -10 Q 0 15 30 -10" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
          <path d="M-35 15 Q 0 40 35 15" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
          <!-- Cashew piece -->
          <path d="M-15 -30 Q -5 -40 10 -30 Q 15 -15 -5 -15 Z" fill="#fef08a"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e293b"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">200 g</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#f59e0b"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#000" text-anchor="middle">₹45</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'snacks',
    file: 'haldirams-aloo-bhujia.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ca8a04"/>
            <stop offset="50%" stop-color="#a16207"/>
            <stop offset="100%" stop-color="#713f12"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <polygon points="200,40 280,80 200,120 120,80" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
        <text x="200" y="86" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" font-weight="900" text-anchor="middle">Haldiram's</text>

        <text x="200" y="165" font-family="'Arial Black', sans-serif" font-size="28" fill="#fde047" font-weight="900" text-anchor="middle">ALOO BHUJIA</text>
        <text x="200" y="195" font-family="system-ui, sans-serif" font-size="14" fill="#fed7aa" font-weight="800" text-anchor="middle">CRISPY POTATO-MINT NAMKEEN SEV</text>

        <circle cx="200" cy="285" r="65" fill="#fde047" stroke="#eab308" stroke-width="4"/>
        <text x="200" y="295" font-family="'Arial Black', sans-serif" font-size="36" fill="#854d0e" text-anchor="middle">100%</text>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e293b"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">400 g</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#facc15"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#713f12" text-anchor="middle">₹115</text>

        ${barcodeSvg()}
      </svg>
    `
  },

  // ── SWEETS ─────────────────────────────────────────────────────────────
  {
    folder: 'sweets',
    file: 'cadbury-dairy-milk-silk.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3b1373"/>
            <stop offset="40%" stop-color="#2c0e5a"/>
            <stop offset="100%" stop-color="#180435"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <text x="200" y="90" font-family="'Brush Script MT', cursive, sans-serif" font-size="44" fill="#fbbf24" text-anchor="middle">Cadbury</text>
        <text x="200" y="140" font-family="'Arial Black', sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">Dairy Milk</text>
        
        <!-- Golden Silk ribbon -->
        <g transform="translate(200, 210)">
          <ellipse rx="130" ry="28" fill="#d97706"/>
          <ellipse rx="120" ry="24" fill="#f59e0b"/>
          <text y="9" font-family="'Brush Script MT', cursive, sans-serif" font-size="38" font-weight="bold" fill="#451a03" text-anchor="middle">Silk</text>
        </g>

        <!-- Chocolate Block Graphic -->
        <g transform="translate(200, 310)">
          <rect x="-80" y="-35" width="160" height="70" rx="8" fill="#451a03" stroke="#78350f" stroke-width="4"/>
          <text x="0" y="10" font-family="'Brush Script MT', cursive, sans-serif" font-size="24" fill="#fde68a" text-anchor="middle">Cadbury</text>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e1035"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">150 g</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#f59e0b"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#451a03" text-anchor="middle">₹165</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'sweets',
    file: 'nestle-kitkat.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="60%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#7f1d1d"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- KitKat Oval -->
        <g transform="translate(200, 140)">
          <ellipse rx="130" ry="60" fill="#ffffff"/>
          <ellipse rx="122" ry="54" fill="#dc2626"/>
          <text y="20" font-family="'Arial Black', Impact, sans-serif" font-size="56" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic">KitKat</text>
        </g>

        <text x="200" y="235" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" font-weight="900" text-anchor="middle">HAVE A BREAK, HAVE A KITKAT</text>
        <text x="200" y="260" font-family="system-ui, sans-serif" font-size="14" fill="#fecaca" font-weight="800" text-anchor="middle">CRISP WAFER FINGERS IN MILK CHOCOLATE</text>

        <!-- 4 Wafer Fingers -->
        <g transform="translate(200, 315)">
          <rect x="-55" y="-30" width="20" height="60" rx="4" fill="#451a03" stroke="#78350f" stroke-width="2"/>
          <rect x="-25" y="-30" width="20" height="60" rx="4" fill="#451a03" stroke="#78350f" stroke-width="2"/>
          <rect x="5" y="-30" width="20" height="60" rx="4" fill="#451a03" stroke="#78350f" stroke-width="2"/>
          <rect x="35" y="-30" width="20" height="60" rx="4" fill="#451a03" stroke="#78350f" stroke-width="2"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e293b"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">75 g (2-Pack)</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#ffffff"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#dc2626" text-anchor="middle">₹70</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'sweets',
    file: 'cadbury-5-star.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="60%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <text x="200" y="90" font-family="'Brush Script MT', cursive, sans-serif" font-size="40" fill="#ffffff" text-anchor="middle">Cadbury</text>
        
        <g transform="translate(200, 160)">
          <text y="10" font-family="'Arial Black', sans-serif" font-size="62" font-weight="900" fill="#ffffff" text-anchor="middle">5 STAR</text>
          <polygon points="90,-30 96,-15 110,-15 100,-5 104,10 90,0 76,10 80,-5 70,-15 84,-15" fill="#facc15"/>
        </g>

        <rect x="50" y="220" width="300" height="40" rx="10" fill="#2c0e5a"/>
        <text x="200" y="247" font-family="'Arial Black', sans-serif" font-size="18" fill="#facc15" font-weight="900" text-anchor="middle">CARAMEL & NOUGAT</text>

        <g transform="translate(200, 310)">
          <rect x="-80" y="-20" width="160" height="40" rx="8" fill="#451a03" stroke="#f59e0b" stroke-width="3"/>
          <text y="6" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#fde68a" text-anchor="middle">EXTRA CHEWY</text>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#2c0e5a"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">40 g</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#451a03" text-anchor="middle">₹20</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'sweets',
    file: 'nestle-munch.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#facc15"/>
            <stop offset="60%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <text x="200" y="80" font-family="sans-serif" font-size="20" font-weight="900" fill="#dc2626" text-anchor="middle">Nestle</text>
        
        <g transform="translate(200, 150)">
          <path d="M-130 -30 L130 -10 L110 30 L-140 10 Z" fill="#1e40af"/>
          <text y="14" font-family="'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic">MUNCH</text>
        </g>

        <rect x="60" y="215" width="280" height="36" rx="8" fill="#dc2626"/>
        <text x="200" y="240" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" font-weight="900" text-anchor="middle">CRUNCHILICIOUS WAFER</text>

        <g transform="translate(200, 310)">
          <rect x="-85" y="-18" width="170" height="36" rx="6" fill="#451a03" stroke="#92400e" stroke-width="3"/>
          <text y="5" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fde047" text-anchor="middle">SUPER CRUNCHY</text>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#1e40af"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">32 g</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#dc2626"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹20</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'sweets',
    file: 'ferrero-rocher.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ca8a04"/>
            <stop offset="40%" stop-color="#a16207"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- Luxury crest -->
        <circle cx="200" cy="80" r="30" fill="#facc15" stroke="#713f12" stroke-width="3"/>
        <text x="200" y="87" font-family="serif" font-size="24" font-weight="bold" fill="#713f12" text-anchor="middle">FR</text>

        <text x="200" y="145" font-family="'Times New Roman', serif" font-size="32" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="3">FERRERO ROCHER</text>
        <text x="200" y="175" font-family="system-ui, sans-serif" font-size="14" fill="#fde047" font-weight="700" text-anchor="middle">THE GOLDEN EXPERIENCE</text>

        <!-- Golden Praline illustration -->
        <g transform="translate(200, 275)">
          <circle r="55" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
          <ellipse cx="0" cy="50" rx="50" ry="14" fill="#451a03"/>
          <rect x="-35" y="-12" width="70" height="24" rx="4" fill="#ffffff"/>
          <text y="4" font-family="serif" font-size="12" font-weight="bold" fill="#713f12" text-anchor="middle">ROCHER</text>
        </g>

        <rect x="40" y="375" width="110" height="30" rx="6" fill="#451a03"/>
        <text x="95" y="395" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">16 Pieces Box</text>
        
        <rect x="260" y="375" width="100" height="30" rx="6" fill="#facc15"/>
        <text x="310" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#451a03" text-anchor="middle">₹499</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'sweets',
    file: 'haldirams-gulab-jamun.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="50%" stop-color="#172554"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <polygon points="200,35 270,70 200,105 130,70" fill="#dc2626" stroke="#facc15" stroke-width="3"/>
        <text x="200" y="76" font-family="'Arial Black', sans-serif" font-size="16" fill="#ffffff" font-weight="900" text-anchor="middle">Haldiram's</text>

        <text x="200" y="150" font-family="'Arial Black', sans-serif" font-size="28" fill="#fde047" font-weight="900" text-anchor="middle">GULAB JAMUN</text>
        <text x="200" y="180" font-family="system-ui, sans-serif" font-size="14" fill="#93c5fd" font-weight="800" text-anchor="middle">TRADITIONAL SWEETS IN SAFFRON SYRUP</text>

        <!-- Dumpling Graphic -->
        <g transform="translate(200, 275)">
          <circle cx="-35" cy="15" r="40" fill="#78350f" stroke="#451a03" stroke-width="3"/>
          <circle cx="35" cy="15" r="40" fill="#78350f" stroke="#451a03" stroke-width="3"/>
          <circle cx="0" cy="-15" r="42" fill="#92400e" stroke="#451a03" stroke-width="3"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e293b"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">1 kg Tin</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#facc15"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#1e3a8a" text-anchor="middle">₹240</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'sweets',
    file: 'haldirams-kaju-katli.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <polygon points="200,35 270,70 200,105 130,70" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
        <text x="200" y="76" font-family="'Arial Black', sans-serif" font-size="16" fill="#ffffff" font-weight="900" text-anchor="middle">Haldiram's</text>

        <text x="200" y="150" font-family="'Arial Black', sans-serif" font-size="28" fill="#713f12" font-weight="900" text-anchor="middle">ROYAL KAJU KATLI</text>
        <text x="200" y="180" font-family="system-ui, sans-serif" font-size="14" fill="#854d0e" font-weight="800" text-anchor="middle">AUTHENTIC CASHEW FUDGE WITH SILVER VARK</text>

        <!-- Diamond Kaju Katli Graphic -->
        <g transform="translate(200, 275)">
          <polygon points="0,-45 50,0 0,45 -50,0" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"/>
          <polygon points="-55,0 -5,45 -55,90 -105,45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
          <polygon points="55,0 105,45 55,90 5,45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#713f12"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">500 g Box</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#dc2626"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹495</text>

        ${barcodeSvg()}
      </svg>
    `
  },

  // ── GROCERIES ──────────────────────────────────────────────────────────
  {
    folder: 'groceries',
    file: 'aashirvaad-shudh-chakki-atta.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#15803d"/>
            <stop offset="50%" stop-color="#166534"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <g transform="translate(200, 90)">
          <ellipse rx="130" ry="40" fill="#dc2626" stroke="#facc15" stroke-width="3"/>
          <text y="14" font-family="'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">AASHIRVAAD</text>
        </g>

        <text x="200" y="165" font-family="'Arial Black', sans-serif" font-size="24" fill="#fde047" font-weight="900" text-anchor="middle">SHUDH CHAKKI ATTA</text>
        <text x="200" y="195" font-family="system-ui, sans-serif" font-size="15" fill="#bbf7d0" font-weight="800" text-anchor="middle">100% WHOLE WHEAT • SOFTEST ROTIS</text>

        <!-- Golden Wheat Stalks Illustration -->
        <g transform="translate(200, 290)">
          <circle r="60" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
          <text y="12" font-family="'Arial Black', sans-serif" font-size="28" fill="#14532d" text-anchor="middle">100%</text>
          <text y="34" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#14532d" text-anchor="middle">WHOLE WHEAT</text>
        </g>

        <rect x="40" y="375" width="100" height="30" rx="6" fill="#14532d"/>
        <text x="90" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">10 kg Bag</text>
        
        <rect x="260" y="375" width="100" height="30" rx="6" fill="#facc15"/>
        <text x="310" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#14532d" text-anchor="middle">₹420</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'groceries',
    file: 'fortune-sunflower-oil.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#facc15"/>
            <stop offset="100%" stop-color="#eab308"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <rect x="50" y="55" width="300" height="55" rx="12" fill="#15803d" stroke="#ca8a04" stroke-width="3"/>
        <text x="200" y="93" font-family="'Arial Black', sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle">Fortune</text>

        <text x="200" y="145" font-family="'Arial Black', sans-serif" font-size="24" fill="#166534" font-weight="900" text-anchor="middle">SUNLITE SUNFLOWER OIL</text>
        <text x="200" y="175" font-family="system-ui, sans-serif" font-size="14" fill="#854d0e" font-weight="800" text-anchor="middle">ENRICHED WITH VITAMINS A &amp; D • HEART HEALTHY</text>

        <!-- Sunflower Bloom Graphic -->
        <g transform="translate(200, 275)">
          <circle r="40" fill="#78350f"/>
          <ellipse cx="0" cy="0" rx="12" ry="55" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
          <ellipse cx="0" cy="0" rx="12" ry="55" fill="#facc15" stroke="#ca8a04" stroke-width="2" transform="rotate(30)"/>
          <ellipse cx="0" cy="0" rx="12" ry="55" fill="#facc15" stroke="#ca8a04" stroke-width="2" transform="rotate(60)"/>
          <ellipse cx="0" cy="0" rx="12" ry="55" fill="#facc15" stroke="#ca8a04" stroke-width="2" transform="rotate(90)"/>
          <ellipse cx="0" cy="0" rx="12" ry="55" fill="#facc15" stroke="#ca8a04" stroke-width="2" transform="rotate(120)"/>
          <ellipse cx="0" cy="0" rx="12" ry="55" fill="#facc15" stroke="#ca8a04" stroke-width="2" transform="rotate(150)"/>
          <circle r="28" fill="#451a03"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#15803d"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">5 Litre Can</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#dc2626"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹640</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'groceries',
    file: 'india-gate-basmati-rice.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#831843"/>
            <stop offset="60%" stop-color="#701a75"/>
            <stop offset="100%" stop-color="#4a044e"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- Monument Arch -->
        <g transform="translate(200, 85)">
          <path d="M-40 20 L-40 -30 L40 -30 L40 20 L25 20 L25 -10 Q 0 -25 -25 -10 L-25 20 Z" fill="#facc15"/>
        </g>

        <text x="200" y="145" font-family="'Times New Roman', serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">INDIA GATE</text>
        <rect x="60" y="165" width="280" height="34" rx="8" fill="#ca8a04"/>
        <text x="200" y="188" font-family="'Arial Black', sans-serif" font-size="18" fill="#000" font-weight="900" text-anchor="middle">CLASSIC BASMATI RICE</text>
        <text x="200" y="225" font-family="system-ui, sans-serif" font-size="14" fill="#fbcfe8" font-weight="700" text-anchor="middle">AGED TO PERFECTION • EXTRA LONG GRAIN</text>

        <!-- Rice grains illustration -->
        <g transform="translate(200, 300)">
          <ellipse cx="0" cy="0" rx="65" ry="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="3" transform="rotate(-25)"/>
          <ellipse cx="10" cy="15" rx="70" ry="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" transform="rotate(15)"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#4a044e"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">5 kg Bag</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#facc15"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#701a75" text-anchor="middle">₹575</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'groceries',
    file: 'tata-salt.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1d4ed8"/>
            <stop offset="50%" stop-color="#1e40af"/>
            <stop offset="100%" stop-color="#172554"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <g transform="translate(200, 100)">
          <text y="0" font-family="'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle">TATA</text>
          <text y="48" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#facc15" text-anchor="middle">SALT</text>
        </g>

        <rect x="50" y="180" width="300" height="40" rx="10" fill="#dc2626"/>
        <text x="200" y="207" font-family="'Arial Black', sans-serif" font-size="20" fill="#ffffff" font-weight="900" text-anchor="middle">DESH KA NAMAK</text>
        <text x="200" y="248" font-family="system-ui, sans-serif" font-size="14" fill="#bfdbfe" font-weight="700" text-anchor="middle">VACUUM EVAPORATED IODIZED SALT</text>

        <circle cx="200" cy="310" r="50" fill="#ffffff" stroke="#93c5fd" stroke-width="4"/>
        <text x="200" y="318" font-family="'Arial Black', sans-serif" font-size="28" fill="#1d4ed8" text-anchor="middle">IODINE</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#172554"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">1 kg</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#172554" text-anchor="middle">₹28</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'groceries',
    file: 'tata-sampann-toor-dal.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="50%" stop-color="#c2410c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <text x="200" y="70" font-family="'Arial Black', sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">TATA SAMPANN</text>
        <text x="200" y="115" font-family="'Arial Black', sans-serif" font-size="32" font-weight="900" fill="#fde047" text-anchor="middle">UNPOLISHED TOOR DAL</text>
        <text x="200" y="145" font-family="system-ui, sans-serif" font-size="14" fill="#fed7aa" font-weight="700" text-anchor="middle">NATURAL SOURCE OF PLANT PROTEIN</text>

        <!-- Pulses transparent window -->
        <g transform="translate(200, 260)">
          <ellipse rx="100" ry="60" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
          <text y="8" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#78350f" text-anchor="middle">100% UNPOLISHED</text>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#1e293b"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">1 kg</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#7c2d12" text-anchor="middle">₹165</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'groceries',
    file: 'maggi-2-minute-noodles.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#facc15"/>
            <stop offset="50%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <!-- Maggi Red Tag -->
        <g transform="translate(200, 95)">
          <path d="M-90 -35 L90 -35 L110 25 L-110 25 Z" fill="#dc2626"/>
          <text y="14" font-family="'Arial Black', Impact, sans-serif" font-size="52" font-weight="900" fill="#fde047" text-anchor="middle" font-style="italic">Maggi</text>
        </g>

        <rect x="40" y="165" width="320" height="42" rx="10" fill="#dc2626"/>
        <text x="200" y="195" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">2-MINUTE NOODLES</text>
        <text x="200" y="235" font-family="'Arial Black', sans-serif" font-size="24" fill="#713f12" font-weight="900" text-anchor="middle">MASALA</text>

        <!-- Steaming Noodle Bowl -->
        <g transform="translate(200, 310)">
          <ellipse cx="0" cy="20" rx="75" ry="30" fill="#dc2626" stroke="#b91c1c" stroke-width="4"/>
          <path d="M-60 20 Q 0 -20 60 20" fill="#fde047" stroke="#ca8a04" stroke-width="6"/>
          <circle cx="-15" cy="10" r="5" fill="#15803d"/>
          <circle cx="20" cy="5" r="5" fill="#ea580c"/>
        </g>

        <rect x="40" y="375" width="110" height="30" rx="6" fill="#dc2626"/>
        <text x="95" y="395" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">12-Pack (840g)</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#1e293b"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#facc15" text-anchor="middle">₹144</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'groceries',
    file: 'madhur-sugar.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="50%" stop-color="#0369a1"/>
            <stop offset="100%" stop-color="#075985"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>
        ${vegIcon(348, 28)}

        <text x="200" y="90" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">MADHUR</text>
        <text x="200" y="130" font-family="'Arial Black', sans-serif" font-size="24" fill="#fde047" font-weight="900" text-anchor="middle">PURE &amp; HYGIENIC SUGAR</text>
        <text x="200" y="160" font-family="system-ui, sans-serif" font-size="15" fill="#bae6fd" font-weight="700" text-anchor="middle">100% SULFUR FREE PROCESS</text>

        <!-- Sparkling Crystals Graphic -->
        <g transform="translate(200, 275)">
          <polygon points="0,-40 30,0 0,40 -30,0" fill="#ffffff" stroke="#bae6fd" stroke-width="3"/>
          <polygon points="50,-10 70,10 50,30 30,10" fill="#ffffff" opacity="0.8"/>
          <polygon points="-50,-10 -30,10 -50,30 -70,10" fill="#ffffff" opacity="0.8"/>
        </g>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#075985"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">5 kg Bag</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#facc15"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#0369a1" text-anchor="middle">₹245</text>

        ${barcodeSvg()}
      </svg>
    `
  },

  // ── PERSONAL CARE ──────────────────────────────────────────────────────
  {
    folder: 'personal-care',
    file: 'head-and-shoulders-shampoo.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="50%" stop-color="#0369a1"/>
            <stop offset="100%" stop-color="#0c4a6e"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Head & Shoulders Logo -->
        <g transform="translate(200, 95)">
          <text y="0" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">head &amp; shoulders</text>
          <path d="M-90 15 Q 0 35 90 15" stroke="#38bdf8" stroke-width="4" fill="none"/>
        </g>

        <rect x="50" y="150" width="300" height="42" rx="10" fill="#0369a1"/>
        <text x="200" y="179" font-family="'Arial Black', sans-serif" font-size="22" fill="#38bdf8" font-weight="900" text-anchor="middle">COOL MENTHOL</text>
        <text x="200" y="220" font-family="system-ui, sans-serif" font-size="15" fill="#ffffff" font-weight="800" text-anchor="middle">UP TO 100% DANDRUFF FREE</text>

        <!-- Bottle silhouette & menthol leaf -->
        <g transform="translate(200, 300)">
          <path d="M-30 -50 C-45 -20 -40 40 -30 50 C0 55 30 50 30 50 C40 40 45 -20 30 -50 Z" fill="#ffffff"/>
          <path d="M-15 -60 L15 -60 L10 -50 L-10 -50 Z" fill="#0284c7"/>
          <circle cx="0" cy="5" r="14" fill="#38bdf8"/>
        </g>

        <rect x="40" y="375" width="100" height="30" rx="6" fill="#0c4a6e"/>
        <text x="90" y="395" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">650 ml Pump</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#38bdf8"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#0c4a6e" text-anchor="middle">₹439</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'personal-care',
    file: 'dettol-bathing-soap.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#16a34a"/>
            <stop offset="50%" stop-color="#15803d"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Sword Cross Shield -->
        <g transform="translate(200, 95)">
          <circle r="45" fill="#ffffff" stroke="#15803d" stroke-width="4"/>
          <!-- Sword -->
          <rect x="-4" y="-35" width="8" height="70" fill="#15803d"/>
          <rect x="-20" y="-15" width="40" height="8" fill="#15803d"/>
        </g>

        <text x="200" y="185" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">Dettol</text>
        <text x="200" y="225" font-family="'Arial Black', sans-serif" font-size="20" fill="#facc15" font-weight="900" text-anchor="middle">ORIGINAL SOAP</text>
        <text x="200" y="255" font-family="system-ui, sans-serif" font-size="15" fill="#bbf7d0" font-weight="700" text-anchor="middle">BE 100% SURE • 99.9% GERM PROTECTION</text>

        <circle cx="200" cy="315" r="45" fill="#ffffff" stroke="#facc15" stroke-width="3"/>
        <text x="200" y="322" font-family="'Arial Black', sans-serif" font-size="22" fill="#15803d" text-anchor="middle">99.9%</text>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#14532d"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">Pack of 5</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#facc15"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#14532d" text-anchor="middle">₹195</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'personal-care',
    file: 'colgate-strong-teeth.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="50%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#7f1d1d"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Colgate Logo -->
        <g transform="translate(200, 105)">
          <text y="0" font-family="'Arial Black', Impact, sans-serif" font-size="58" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic">Colgate</text>
          <!-- Smile curve -->
          <path d="M-80 18 Q 0 42 80 18" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
        </g>

        <rect x="40" y="165" width="320" height="40" rx="10" fill="#ffffff"/>
        <text x="200" y="193" font-family="'Arial Black', sans-serif" font-size="20" fill="#dc2626" font-weight="900" text-anchor="middle">STRONG TEETH</text>
        <text x="200" y="240" font-family="system-ui, sans-serif" font-size="15" fill="#fecaca" font-weight="800" text-anchor="middle">AMINO SHAKTI CALCIUM BOOST • 2X STRONGER</text>

        <!-- Tooth Calcium Shield -->
        <g transform="translate(200, 310)">
          <circle r="45" fill="#ffffff" stroke="#facc15" stroke-width="3"/>
          <text y="8" font-family="'Arial Black', sans-serif" font-size="28" fill="#dc2626" text-anchor="middle">2X</text>
        </g>

        <rect x="40" y="375" width="100" height="30" rx="6" fill="#7f1d1d"/>
        <text x="90" y="395" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">500g Twin Pack</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#ffffff"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#dc2626" text-anchor="middle">₹220</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'personal-care',
    file: 'dove-deep-moisture-body-wash.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)" stroke="#cbd5e1" stroke-width="3"/>

        <!-- Dove Silhouette Icon -->
        <g transform="translate(200, 85)">
          <path d="M-30 0 C-10 -25 25 -25 40 0 C25 25 -10 25 -30 0 Z" fill="#d97706"/>
        </g>

        <text x="200" y="145" font-family="'Arial Black', sans-serif" font-size="42" font-weight="900" fill="#1e3a8a" text-anchor="middle">Dove</text>
        <rect x="60" y="165" width="280" height="36" rx="8" fill="#1e3a8a"/>
        <text x="200" y="190" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" font-weight="900" text-anchor="middle">DEEP MOISTURE</text>
        <text x="200" y="235" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" font-weight="700" text-anchor="middle">NOURISHING BODY WASH • SOFT SKIN</text>

        <!-- Moisture drop -->
        <circle cx="200" cy="305" r="45" fill="#38bdf8" opacity="0.3"/>
        <circle cx="200" cy="305" r="30" fill="#0284c7"/>

        <rect x="40" y="375" width="90" height="30" rx="6" fill="#1e3a8a"/>
        <text x="85" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">800 ml</text>
        
        <rect x="270" y="375" width="90" height="30" rx="6" fill="#d97706"/>
        <text x="315" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹380</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'personal-care',
    file: 'parachute-coconut-oil.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1d4ed8"/>
            <stop offset="50%" stop-color="#1e40af"/>
            <stop offset="100%" stop-color="#172554"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Palm Tree Graphic -->
        <g transform="translate(200, 75)">
          <path d="M-5 25 L-3 -20 L3 -20 L5 25 Z" fill="#92400e"/>
          <path d="M0 -20 Q -30 -40 -40 -20 M0 -20 Q 30 -40 40 -20 M0 -20 Q -20 -50 0 -50 M0 -20 Q 20 -50 0 -50" stroke="#16a34a" stroke-width="5" fill="none"/>
        </g>

        <text x="200" y="150" font-family="'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">Parachute</text>
        <rect x="50" y="170" width="300" height="38" rx="8" fill="#16a34a"/>
        <text x="200" y="196" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" font-weight="900" text-anchor="middle">100% PURE COCONUT OIL</text>
        <text x="200" y="240" font-family="system-ui, sans-serif" font-size="14" fill="#93c5fd" font-weight="700" text-anchor="middle">NOTHING BUT 100% PURE OIL</text>

        <circle cx="200" cy="305" r="45" fill="#ffffff" stroke="#ca8a04" stroke-width="4"/>
        <text x="200" y="313" font-family="'Arial Black', sans-serif" font-size="20" fill="#1e40af" text-anchor="middle">100%</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#172554"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">600 ml</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#16a34a"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹235</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'personal-care',
    file: 'nivea-soft-cream.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="60%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)" stroke="#cbd5e1" stroke-width="3"/>

        <!-- Blue Nivea Roundel -->
        <circle cx="200" cy="110" r="60" fill="#1e3a8a"/>
        <text x="200" y="118" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">NIVEA</text>

        <text x="200" y="210" font-family="'Brush Script MT', cursive, sans-serif" font-size="44" fill="#0284c7" text-anchor="middle">Soft</text>
        <text x="200" y="245" font-family="'Arial Black', sans-serif" font-size="18" fill="#1e293b" font-weight="900" text-anchor="middle">LIGHT MOISTURIZING CREAM</text>
        <text x="200" y="275" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" font-weight="700" text-anchor="middle">WITH JOJOBA OIL &amp; VITAMIN E</text>

        <circle cx="200" cy="325" r="28" fill="#0284c7"/>
        <text x="200" y="331" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">VIT E</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#1e3a8a"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">300 ml</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#0284c7"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹299</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'personal-care',
    file: 'himalaya-neem-face-wash.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#15803d"/>
            <stop offset="50%" stop-color="#166534"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <text x="200" y="80" font-family="'Times New Roman', serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle">Himalaya</text>
        <text x="200" y="105" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#facc15" text-anchor="middle">SINCE 1930</text>

        <rect x="40" y="135" width="320" height="42" rx="10" fill="#ffffff"/>
        <text x="200" y="164" font-family="'Arial Black', sans-serif" font-size="20" fill="#15803d" font-weight="900" text-anchor="middle">PURIFYING NEEM</text>
        <text x="200" y="210" font-family="'Arial Black', sans-serif" font-size="18" fill="#facc15" font-weight="900" text-anchor="middle">FACE WASH</text>
        <text x="200" y="240" font-family="system-ui, sans-serif" font-size="14" fill="#bbf7d0" font-weight="700" text-anchor="middle">PREVENTS PIMPLES • PURIFIES SKIN</text>

        <circle cx="200" cy="305" r="45" fill="#facc15" stroke="#15803d" stroke-width="4"/>
        <text x="200" y="313" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#14532d" text-anchor="middle">NEEM</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#14532d"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">400 ml</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#14532d" text-anchor="middle">₹260</text>

        ${barcodeSvg()}
      </svg>
    `
  },

  // ── HOUSEHOLD ──────────────────────────────────────────────────────────
  {
    folder: 'household',
    file: 'surf-excel-matic-powder.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="50%" stop-color="#0369a1"/>
            <stop offset="100%" stop-color="#075985"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Multi-Color Stain Lifter Splash -->
        <g transform="translate(200, 95)">
          <path d="M-80 0 L-20 -40 L40 -10 L90 -40 L60 30 L-20 40 Z" fill="#ec4899" opacity="0.8"/>
          <text y="14" font-family="'Arial Black', sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle">Surf excel</text>
        </g>

        <rect x="50" y="160" width="300" height="42" rx="10" fill="#ec4899"/>
        <text x="200" y="189" font-family="'Arial Black', sans-serif" font-size="22" fill="#ffffff" font-weight="900" text-anchor="middle">MATIC FRONT LOAD</text>
        <text x="200" y="235" font-family="system-ui, sans-serif" font-size="15" fill="#fbcfe8" font-weight="800" text-anchor="middle">TOUGH STAIN REMOVAL IN MACHINE</text>

        <circle cx="200" cy="305" r="48" fill="#ffffff" stroke="#ec4899" stroke-width="4"/>
        <text x="200" y="313" font-family="'Arial Black', sans-serif" font-size="22" fill="#0369a1" text-anchor="middle">MATIC</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#075985"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">4 kg Box</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#ec4899"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹495</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'household',
    file: 'vim-dishwash-gel.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#84cc16"/>
            <stop offset="50%" stop-color="#65a30d"/>
            <stop offset="100%" stop-color="#4d7c0f"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Vim Yellow Oval -->
        <g transform="translate(200, 100)">
          <ellipse rx="100" ry="45" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
          <text y="16" font-family="'Arial Black', Impact, sans-serif" font-size="52" font-weight="900" fill="#15803d" text-anchor="middle" font-style="italic">Vim</text>
        </g>

        <rect x="40" y="170" width="320" height="40" rx="10" fill="#15803d"/>
        <text x="200" y="198" font-family="'Arial Black', sans-serif" font-size="20" fill="#fef08a" font-weight="900" text-anchor="middle">DISHWASH GEL • LEMON</text>
        <text x="200" y="240" font-family="system-ui, sans-serif" font-size="15" fill="#fef08a" font-weight="800" text-anchor="middle">POWER OF 100 LEMONS • EASY GREASE CUT</text>

        <!-- Fresh Lemon Graphic -->
        <g transform="translate(200, 305)">
          <circle r="45" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
          <circle r="36" fill="#fef08a"/>
          <line x1="-36" y1="0" x2="36" y2="0" stroke="#ca8a04" stroke-width="2"/>
          <line x1="0" y1="-36" x2="0" y2="36" stroke="#ca8a04" stroke-width="2"/>
          <line x1="-25" y1="-25" x2="25" y2="25" stroke="#ca8a04" stroke-width="2"/>
          <line x1="-25" y1="25" x2="25" y2="-25" stroke="#ca8a04" stroke-width="2"/>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#15803d"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">2 Litre</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#15803d" text-anchor="middle">₹380</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'household',
    file: 'lizol-floor-cleaner.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="50%" stop-color="#c2410c"/>
            <stop offset="100%" stop-color="#9a3412"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <g transform="translate(200, 100)">
          <rect x="-85" y="-35" width="170" height="65" rx="14" fill="#ffffff" stroke="#c2410c" stroke-width="4"/>
          <text y="12" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ea580c" text-anchor="middle">Lizol</text>
        </g>

        <rect x="50" y="165" width="300" height="40" rx="10" fill="#1e293b"/>
        <text x="200" y="193" font-family="'Arial Black', sans-serif" font-size="18" fill="#facc15" font-weight="900" text-anchor="middle">DISINFECTANT CLEANER</text>
        <text x="200" y="235" font-family="system-ui, sans-serif" font-size="15" fill="#ffedd5" font-weight="800" text-anchor="middle">10X BETTER CLEANING • CITRUS FRAGRANCE</text>

        <!-- 10x shield -->
        <circle cx="200" cy="305" r="45" fill="#facc15" stroke="#9a3412" stroke-width="4"/>
        <text x="200" y="313" font-family="'Arial Black', sans-serif" font-size="28" fill="#9a3412" text-anchor="middle">10X</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#1e293b"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">2 Litre</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#facc15"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#9a3412" text-anchor="middle">₹340</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'household',
    file: 'harpic-toilet-cleaner.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e40af"/>
            <stop offset="50%" stop-color="#1e3a8a"/>
            <stop offset="100%" stop-color="#172554"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Harpic Red Oval -->
        <g transform="translate(200, 100)">
          <ellipse rx="110" ry="45" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
          <text y="16" font-family="'Arial Black', Impact, sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="middle" font-style="italic">HARPIC</text>
        </g>

        <rect x="50" y="165" width="300" height="40" rx="10" fill="#dc2626"/>
        <text x="200" y="193" font-family="'Arial Black', sans-serif" font-size="20" fill="#fef08a" font-weight="900" text-anchor="middle">POWER PLUS ORIGINAL</text>
        <text x="200" y="235" font-family="system-ui, sans-serif" font-size="15" fill="#93c5fd" font-weight="800" text-anchor="middle">10X MAX CLEAN • 100% LIMESCALE REMOVAL</text>

        <!-- Power germ kill symbol -->
        <circle cx="200" cy="305" r="45" fill="#dc2626" stroke="#facc15" stroke-width="4"/>
        <text x="200" y="313" font-family="'Arial Black', sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">KILL 99.9%</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#172554"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">1 Litre</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#dc2626"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">₹185</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'household',
    file: 'ariel-liquid-detergent.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#059669"/>
            <stop offset="50%" stop-color="#047857"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Ariel Atom Rings -->
        <g transform="translate(200, 85)">
          <ellipse rx="45" ry="18" fill="none" stroke="#6ee7b7" stroke-width="3" transform="rotate(30)"/>
          <ellipse rx="45" ry="18" fill="none" stroke="#6ee7b7" stroke-width="3" transform="rotate(-30)"/>
          <circle r="8" fill="#facc15"/>
        </g>

        <text x="200" y="160" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">ARIEL</text>
        <rect x="50" y="180" width="300" height="40" rx="10" fill="#064e3b"/>
        <text x="200" y="208" font-family="'Arial Black', sans-serif" font-size="18" fill="#6ee7b7" font-weight="900" text-anchor="middle">MATIC COMPLETE LIQUID</text>
        <text x="200" y="245" font-family="system-ui, sans-serif" font-size="14" fill="#a7f3d0" font-weight="700" text-anchor="middle">BRIGHT COLORS &amp; DEEP STAIN REMOVAL</text>

        <circle cx="200" cy="305" r="45" fill="#ffffff" stroke="#059669" stroke-width="4"/>
        <text x="200" y="313" font-family="'Arial Black', sans-serif" font-size="20" fill="#047857" text-anchor="middle">1 WASH</text>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#064e3b"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">2 Litre</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#6ee7b7"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#064e3b" text-anchor="middle">₹410</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'household',
    file: 'colin-surface-cleaner.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="50%" stop-color="#0369a1"/>
            <stop offset="100%" stop-color="#075985"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <!-- Colin Red Oval -->
        <g transform="translate(200, 95)">
          <ellipse rx="85" ry="38" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
          <text y="14" font-family="'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">Colin</text>
        </g>

        <rect x="40" y="160" width="320" height="40" rx="10" fill="#ffffff"/>
        <text x="200" y="188" font-family="'Arial Black', sans-serif" font-size="18" fill="#0284c7" font-weight="900" text-anchor="middle">GLASS &amp; SURFACE CLEANER</text>
        <text x="200" y="235" font-family="system-ui, sans-serif" font-size="15" fill="#bae6fd" font-weight="800" text-anchor="middle">2X MORE SHINE • STREAK-FREE FORMULA</text>

        <!-- Sparkle diamond -->
        <g transform="translate(200, 305)">
          <polygon points="0,-45 40,0 0,45 -40,0" fill="#ffffff"/>
          <polygon points="0,-35 30,0 0,35 -30,0" fill="#38bdf8"/>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#075985"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">500 ml</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#38bdf8"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#075985" text-anchor="middle">₹95</text>

        ${barcodeSvg()}
      </svg>
    `
  },
  {
    folder: 'household',
    file: 'comfort-fabric-conditioner.svg',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ec4899"/>
            <stop offset="50%" stop-color="#db2777"/>
            <stop offset="100%" stop-color="#9d174d"/>
          </linearGradient>
        </defs>
        <rect width="400" height="500" rx="20" fill="url(#bg)"/>

        <text x="200" y="90" font-family="'Brush Script MT', cursive, sans-serif" font-size="52" fill="#ffffff" text-anchor="middle">Comfort</text>
        <rect x="50" y="130" width="300" height="38" rx="8" fill="#ffffff"/>
        <text x="200" y="156" font-family="'Arial Black', sans-serif" font-size="18" fill="#be185d" font-weight="900" text-anchor="middle">AFTER WASH FABRIC CONDITIONER</text>
        <text x="200" y="205" font-family="system-ui, sans-serif" font-size="15" fill="#fce7f3" font-weight="800" text-anchor="middle">MORNING FRESH LILY • 14 DAYS FRAGRANCE</text>

        <!-- Lily flower blossom -->
        <g transform="translate(200, 290)">
          <circle r="40" fill="#fdf2f8" stroke="#f472b6" stroke-width="3"/>
          <circle r="12" fill="#facc15"/>
        </g>

        <rect x="40" y="375" width="80" height="30" rx="6" fill="#831843"/>
        <text x="80" y="395" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">2 Litre</text>
        
        <rect x="280" y="375" width="80" height="30" rx="6" fill="#fce7f3"/>
        <text x="320" y="395" font-family="'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#be185d" text-anchor="middle">₹399</text>

        ${barcodeSvg()}
      </svg>
    `
  }
];

let count = 0;
for (const p of products) {
  const dir = path.join(baseDir, p.folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, p.file);
  fs.writeFileSync(filePath, p.svg.trim(), 'utf8');
  count++;
}

console.log(`Successfully generated ${count} authentic product SVG packaging assets in ${baseDir}!`);
