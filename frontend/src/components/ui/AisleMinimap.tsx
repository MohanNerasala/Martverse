'use client';

import React, { useEffect, useRef, useState } from 'react';
import { martRuntime, useMartStore } from '@/store/useMartStore';
import { Compass, Minimize2, Navigation, MapPin, ArrowRight, Sparkles } from 'lucide-react';

interface AisleDef {
  number: number;
  name: string;
  hindiName: string;
  teluguName: string;
  icon: string;
  shortLabel: string;
  hindiShort: string;
  teluguShort: string;
  itemsPreview: string;
  x: number;
  z: number;
  w: number;
  h: number;
  color: string;
  walkTarget: { x: number; z: number; yaw: number };
}

// 72m x 72m hypermarket floor plan (-36 to +36 in X and Z)
// Map coordinates: mapX = ((x + 36) / 72) * 200, mapY = ((z + 36) / 72) * 200
const AISLES: AisleDef[] = [
  {
    number: 1,
    name: 'Snacks & Namkeen',
    hindiName: 'स्नैक्स और नमकीन',
    teluguName: 'స్నాక్స్ & నమ్కీన్',
    icon: '🥨',
    shortLabel: 'SNACKS',
    hindiShort: 'स्नैक्स',
    teluguShort: 'స్నాక్స్',
    itemsPreview: 'Kurkure, Lays, Haldiram Bhujia',
    x: -24.0,
    z: 0,
    w: 2.2,
    h: 28,
    color: '#f59e0b',
    walkTarget: { x: -21.2, z: -8, yaw: -Math.PI / 2 },
  },
  {
    number: 2,
    name: 'Bakery & Biscuits',
    hindiName: 'बेकरी और बिस्कुट',
    teluguName: 'బేకరీ & బిస్కెట్లు',
    icon: '🍪',
    shortLabel: 'BAKERY',
    hindiShort: 'बेकरी',
    teluguShort: 'బేకరీ',
    itemsPreview: 'Parle-G, Good Day, Oreo Cookies',
    x: -17.5,
    z: 0,
    w: 2.2,
    h: 28,
    color: '#d97706',
    walkTarget: { x: -14.8, z: -8, yaw: -Math.PI / 2 },
  },
  {
    number: 3,
    name: 'Beverages & Tea/Coffee',
    hindiName: 'पेय और चाय/कॉफी',
    teluguName: 'టీ & కాఫీ పానీయాలు',
    icon: '☕',
    shortLabel: 'TEA/COFFEE',
    hindiShort: 'चाय/कॉफी',
    teluguShort: 'టీ/కాఫీ',
    itemsPreview: 'Tata Tea, Nescafe, Horlicks',
    x: -11.0,
    z: -5.0,
    w: 10,
    h: 2.2,
    color: '#0284c7',
    walkTarget: { x: -11.0, z: -8.0, yaw: 0 },
  },
  {
    number: 4,
    name: 'Dairy & Breakfast',
    hindiName: 'डेयरी और नाश्ता',
    teluguName: 'డైరీ & అల్పాహారం',
    icon: '🧀',
    shortLabel: 'DAIRY',
    hindiShort: 'डेयरी',
    teluguShort: 'డైరీ',
    itemsPreview: 'Amul Butter, Paneer, Cheese',
    x: -11.0,
    z: 5.0,
    w: 10,
    h: 2.2,
    color: '#06b6d4',
    walkTarget: { x: -11.0, z: 2.0, yaw: 0 },
  },
  {
    number: 5,
    name: 'Rice, Atta & Dals (Staples)',
    hindiName: 'अनाज, आटा और दालें',
    teluguName: 'బియ్యం, పిండి & పప్పులు',
    icon: '🌾',
    shortLabel: 'ATTA/RICE',
    hindiShort: 'आटा/चावल',
    teluguShort: 'పిండి/బియ్యం',
    itemsPreview: 'Aashirvaad Atta, Daawat Basmati',
    x: 17.5,
    z: 0,
    w: 2.2,
    h: 28,
    color: '#10b981',
    walkTarget: { x: 14.8, z: -8, yaw: Math.PI / 2 },
  },
  {
    number: 6,
    name: 'Cooking Oils & Ghee',
    hindiName: 'कुकिंग ऑयल और घी',
    teluguName: 'వంట నూనెలు & నెయ్యి',
    icon: '🌶️',
    shortLabel: 'OILS/GHEE',
    hindiShort: 'तेल/घी',
    teluguShort: 'నూనె/నెయ్యి',
    itemsPreview: 'Fortune Sunflower Oil, Amul Ghee',
    x: 24.0,
    z: 0,
    w: 2.2,
    h: 28,
    color: '#ef4444',
    walkTarget: { x: 21.2, z: -8, yaw: Math.PI / 2 },
  },
  {
    number: 7,
    name: 'Cooking Essentials & Spices',
    hindiName: 'मसाले और रसोई सामग्री',
    teluguName: 'మసాలాలు & వంట సరుకులు',
    icon: '🧂',
    shortLabel: 'SPICES',
    hindiShort: 'मसाले',
    teluguShort: 'మసాలాలు',
    itemsPreview: 'MDH Masalas, Tata Salt, Sugar',
    x: 11.0,
    z: -5.0,
    w: 10,
    h: 2.2,
    color: '#f97316',
    walkTarget: { x: 11.0, z: -8.0, yaw: 0 },
  },
  {
    number: 8,
    name: 'Instant Foods & Noodles',
    hindiName: 'इंस्टेंट फूड्स और नूडल्स',
    teluguName: 'ఇన్‌స్టంట్ ఫుడ్స్ & నూడుల్స్',
    icon: '🍜',
    shortLabel: 'NOODLES',
    hindiShort: 'नूडल्स',
    teluguShort: 'నూడుల్స్',
    itemsPreview: 'Maggi, Yippee, Knorr Soups',
    x: 11.0,
    z: 5.0,
    w: 10,
    h: 2.2,
    color: '#8b5cf6',
    walkTarget: { x: 11.0, z: 2.0, yaw: 0 },
  },
  {
    number: 9,
    name: 'Personal Care & Drinks',
    hindiName: 'पर्सनल केयर और पेय',
    teluguName: 'వ్యక్తిగత సంరక్షణ & కూల్ డ్రింక్స్',
    icon: '🧴',
    shortLabel: 'CARE/DRINKS',
    hindiShort: 'केयर',
    teluguShort: 'కేర్',
    itemsPreview: 'Dettol, Dove Soap, Shampoos',
    x: 29.5,
    z: 0,
    w: 2.2,
    h: 22,
    color: '#ec4899',
    walkTarget: { x: 26.8, z: -6, yaw: Math.PI / 2 },
  },
];

// Promotional Promenade stations in the center aisle
const PROMO_ISLANDS = [
  {
    id: 'promo-1',
    label: '01 PROMO',
    icon: '⭐',
    name: '01 Promotions • Cadbury Chocolates',
    hindiName: '01 स्पेशल ऑफर्स (चॉकलेट्स)',
    teluguName: '01 ప్రత్యేక ఆఫర్లు (చాక్లెట్లు)',
    color: '#f43f5e',
    cx: 100,
    cy: 37.5,
    walkTarget: { x: 0, z: -20, yaw: 0 },
  },
  {
    id: 'promo-2',
    label: 'FESTIVE',
    icon: '🎁',
    name: 'Festive Offers & Beverages',
    hindiName: 'त्योहारी ऑफर्स व पेय',
    teluguName: 'పండుగ ఆఫర్లు & పానీయాలు',
    color: '#0284c7',
    cx: 100,
    cy: 58.3,
    walkTarget: { x: 0, z: -13, yaw: 0 },
  },
  {
    id: 'promo-3',
    label: 'DEALS',
    icon: '🏷️',
    name: 'Super Saver Deals & Value Packs',
    hindiName: 'सुपर सेवर डील्स',
    teluguName: 'సూపర్ సేవర్ డీల్స్',
    color: '#f59e0b',
    cx: 100,
    cy: 86.1,
    walkTarget: { x: 0, z: -3, yaw: 0 },
  },
];

export const AisleMinimap: React.FC = () => {
  const isMinimapOpen = useMartStore((state) => state.isMinimapOpen);
  const toggleMinimap = useMartStore((state) => state.toggleMinimap);
  const language = useMartStore((state) => state.language);
  const highlightedAisle = useMartStore((state) => state.highlightedAisle);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);

  const markerRef = useRef<SVGGElement>(null);
  const [hoveredAisle, setHoveredAisle] = useState<AisleDef | null>(null);
  const [hoveredPromo, setHoveredPromo] = useState<typeof PROMO_ISLANDS[0] | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [playerProximityLabel, setPlayerProximityLabel] = useState<string>('Store Entrance');

  // Convert store 3D world meters (-36 to +36) to SVG canvas coordinates (0 to 200)
  const toSvgX = (worldX: number) => ((worldX + 36) / 72) * 200;
  const toSvgY = (worldZ: number) => ((worldZ + 36) / 72) * 200;

  useEffect(() => {
    let animId: number;
    let tick = 0;

    const updateMarker = () => {
      const px = martRuntime.playerPos[0];
      const pz = martRuntime.playerPos[2];
      const yaw = martRuntime.playerYaw ?? 0;

      if (markerRef.current) {
        const svgX = toSvgX(px);
        const svgY = toSvgY(pz);
        const deg = (yaw * 180) / Math.PI;

        markerRef.current.setAttribute(
          'transform',
          `translate(${svgX.toFixed(2)}, ${svgY.toFixed(2)}) rotate(${deg.toFixed(1)})`
        );
      }

      // Update proximity label periodically (every ~30 frames)
      tick++;
      if (tick % 25 === 0) {
        if (pz < -22) {
          setPlayerProximityLabel(
            language === 'TE' ? 'ప్రవేశం & ట్రాలీలు' : language === 'HI' ? 'प्रवेश व ट्रॉली बे' : 'Entrance & Trolley Bay'
          );
        } else if (pz > 15) {
          setPlayerProximityLabel(
            language === 'TE' ? 'బిల్లింగ్ కౌంటర్లు & నిష్క్రమణ' : language === 'HI' ? 'बिलिंग काउंटर व निकास' : 'Billing Counters & Exit'
          );
        } else if (px < -20) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 01: స్నాక్స్' : language === 'HI' ? 'आइसल 01: स्नैक्स' : 'Aisle 01: Snacks & Namkeen'
          );
        } else if (px < -14) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 02: బేకరీ' : language === 'HI' ? 'आइसल 02: बेकरी' : 'Aisle 02: Bakery & Biscuits'
          );
        } else if (px < 0 && pz < 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 03: టీ & కాఫీ' : language === 'HI' ? 'आइसल 03: चाय/कॉफी' : 'Aisle 03: Beverages & Tea'
          );
        } else if (px < 0 && pz >= 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 04: డైరీ' : language === 'HI' ? 'आइसल 04: डेयरी' : 'Aisle 04: Dairy & Breakfast'
          );
        } else if (px > 0 && px <= 14 && pz < 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 07: మసాలాలు' : language === 'HI' ? 'आइसल 07: मसाले' : 'Aisle 07: Cooking Essentials'
          );
        } else if (px > 0 && px <= 14 && pz >= 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 08: ఇన్‌స్టంట్ ఫుడ్స్' : language === 'HI' ? 'आइसल 08: नूडल्स' : 'Aisle 08: Instant Foods'
          );
        } else if (px > 14 && px <= 20) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 05: పిండి & బియ్యం' : language === 'HI' ? 'आइसल 05: आटा व चावल' : 'Aisle 05: Staples (Atta/Rice)'
          );
        } else if (px > 20 && px <= 26) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 06: వంట నూనెలు' : language === 'HI' ? 'आइसल 06: कुकिंग ऑयल' : 'Aisle 06: Cooking Oils'
          );
        } else if (px > 26) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 09: కేర్' : language === 'HI' ? 'आइसल 09: पर्सनल केयर' : 'Aisle 09: Personal Care'
          );
        } else {
          setPlayerProximityLabel(
            language === 'TE' ? 'సెంట్రల్ ప్రోమెనేడ్' : language === 'HI' ? 'सेंट्रल प्रोमेनेड' : 'Central Promenade'
          );
        }
      }

      animId = requestAnimationFrame(updateMarker);
    };

    animId = requestAnimationFrame(updateMarker);
    return () => cancelAnimationFrame(animId);
  }, [language]);

  const handleWalkToAisle = (aisle: AisleDef) => {
    const target = aisle.walkTarget;
    setPlayerPos([target.x, 1.6, target.z], target.yaw);
    useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));
    useMartStore.getState().showToast(
      language === 'TE'
        ? `విభాగం 0${aisle.number}`
        : language === 'HI'
        ? `आइसल 0${aisle.number}`
        : `Aisle 0${aisle.number}`,
      language === 'TE' ? aisle.teluguName : language === 'HI' ? aisle.hindiName : aisle.name,
      'info'
    );
  };

  const handleWalkToBilling = () => {
    setPlayerPos([0, 1.5, 16.0], 0);
    useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));
    useMartStore.getState().showToast(
      language === 'TE' ? 'బిల్లింగ్ కౌంటర్' : language === 'HI' ? 'बिलिंग काउंटर' : 'Billing Counters',
      language === 'TE' ? 'లేన్ 02 చెక్అవుట్ కౌంటర్' : language === 'HI' ? 'लेन 02 चेकआउट काउंटर' : 'Lane 02 Checkout Counter',
      'info'
    );
  };

  const handleWalkToEntrance = () => {
    setPlayerPos([0, 1.6, -27.5], 0);
    useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));
    useMartStore.getState().showToast(
      language === 'TE' ? 'స్టోర్ ప్రవేశం' : language === 'HI' ? 'स्टोर प्रवेश' : 'Store Entrance',
      language === 'TE' ? 'ప్రవేశ లాబీ & ట్రాలీ బే' : language === 'HI' ? 'प्रवेश द्वार व ट्रॉली बे' : 'Main Entrance & Trolley Bay',
      'info'
    );
  };

  const handleWalkToPromo = (promo: typeof PROMO_ISLANDS[0]) => {
    setPlayerPos([promo.walkTarget.x, 1.6, promo.walkTarget.z], promo.walkTarget.yaw);
    useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));
    useMartStore.getState().showToast(
      promo.label,
      language === 'TE' ? promo.teluguName : language === 'HI' ? promo.hindiName : promo.name,
      'info'
    );
  };

  if (!isMinimapOpen) {
    return (
      <button
        onClick={() => toggleMinimap(true)}
        className="pointer-events-auto fixed bottom-20 left-4 sm:left-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-blue-400 text-slate-800 p-2.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer group active:scale-95"
        title="Open Supermarket Mini-map"
      >
        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
        </div>
        <span className="text-[11px] font-black tracking-tight text-slate-800">
          {language === 'TE' ? 'మ్యాప్' : language === 'HI' ? 'नక్शा' : 'Store Map'}
        </span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Supermarket Mini-map"
      className="pointer-events-auto fixed bottom-20 left-4 sm:left-6 z-40 w-64 sm:w-72 bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_16px_40px_rgba(15,23,42,0.16)] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* 1. Header: Clean Luxury Mall Directory Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                {language === 'TE' ? 'స్టోర్ మ్యాప్' : language === 'HI' ? 'स्टोर मैप' : 'STORE DIRECTORY'}
              </span>
              <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.2 rounded border border-blue-200">
                72m²
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-medium -mt-0.5">
              {language === 'TE' ? 'ప్రత్యక్ష విభాగాల స్థానం' : language === 'HI' ? 'लाइव विभाग नक्शा' : 'Interactive Hypermarket Map'}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleMinimap(false)}
          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer"
          title="Minimize map"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Quick Category Department Pills (Single-Click Teleport) */}
      <div className="px-2.5 py-1.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {AISLES.slice(0, 6).map((aisle) => (
          <button
            key={aisle.number}
            onClick={() => handleWalkToAisle(aisle)}
            className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              highlightedAisle === aisle.number
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={`Walk to Aisle 0${aisle.number}: ${aisle.name}`}
          >
            <span>{aisle.icon}</span>
            <span>0{aisle.number}</span>
          </button>
        ))}
        <button
          onClick={handleWalkToBilling}
          className="flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer flex items-center gap-1"
          title="Walk directly to Billing Counter Lane 02"
        >
          <span>💳</span>
          <span>Pay</span>
        </button>
      </div>

      {/* 3. SVG Floor Plan Blueprint (200x200 viewBox) */}
      <div className="relative p-2 bg-[#F8F9FA]">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-auto aspect-square rounded-2xl bg-white border border-slate-200 shadow-inner"
        >
          <defs>
            {/* Architectural floor tile grid pattern */}
            <pattern id="hypermarketGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.6" />
            </pattern>

            {/* Drop shadow for racks to make them look real and elevated */}
            <filter id="shelfElevatedShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#0f172a" floodOpacity="0.18" />
            </filter>

            {/* Luminous glow for highlighted aisle */}
            <filter id="highlightPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Floor Tile Grid Background */}
          <rect x="2" y="2" width="196" height="196" fill="url(#hypermarketGrid)" rx="8" />
          <rect x="2" y="2" width="196" height="196" fill="none" stroke="#e2e8f0" strokeWidth="1.2" rx="8" />

          {/* ---------------------------------------------------- */}
          {/* ENTRANCE PORTAL & LOBBY (Y = 6 to 16, X = 65 to 135) */}
          {/* Clean clearance so player marker at Y = 22 does NOT overlap! */}
          {/* ---------------------------------------------------- */}
          <g
            className="cursor-pointer group"
            onClick={handleWalkToEntrance}
            onMouseEnter={() => setHoveredZone('entrance')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            {/* Entrance Wall / Lobby Portal */}
            <rect
              x="65"
              y="6"
              width="70"
              height="11"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="1"
              rx="3"
              className="group-hover:fill-sky-100 transition-colors"
            />
            {/* Sliding Glass Doors Graphic */}
            <line x1="93" y1="6" x2="93" y2="17" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="1.5,1" />
            <line x1="107" y1="6" x2="107" y2="17" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="1.5,1" />
            <text
              x="100"
              y="14"
              textAnchor="middle"
              fontSize="5.2"
              fontWeight="900"
              fill="#0369a1"
              letterSpacing="0.4"
            >
              {language === 'TE' ? '🚪 ప్రవేశం (ENTER)' : language === 'HI' ? '🚪 प्रवेश (ENTER)' : '🚪 ENTRANCE'}
            </text>
            {/* Green entry flow indicator arrow */}
            <polygon points="100,19 97,16 103,16" fill="#16a34a" />
          </g>

          {/* Trolley Pick-up Bay (Left of entrance) */}
          <g
            className="cursor-pointer"
            onClick={handleWalkToEntrance}
            onMouseEnter={() => setHoveredZone('trolley')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect x="8" y="7" width="48" height="11" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" rx="2" strokeDasharray="2,1" />
            <text x="32" y="14.5" textAnchor="middle" fontSize="4.5" fontWeight="800" fill="#475569">
              {language === 'TE' ? '🛒 ట్రాలీలు' : language === 'HI' ? '🛒 ट्रॉली बे' : '🛒 Trolley Bay'}
            </text>
          </g>

          {/* Customer Service / Help Desk (Right of entrance) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredZone('info')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect x="144" y="7" width="48" height="11" fill="#f0fdf4" stroke="#86efac" strokeWidth="0.8" rx="2" />
            <text x="168" y="14.5" textAnchor="middle" fontSize="4.5" fontWeight="800" fill="#166534">
              {language === 'TE' ? 'ℹ️ హెల్ప్ డెస్క్' : language === 'HI' ? 'ℹ️ हेल्प डेस्क' : 'ℹ️ Help Desk'}
            </text>
          </g>

          {/* ---------------------------------------------------- */}
          {/* CENTRAL PROMENADE: 3 PROMOTIONAL ISLAND DISPLAY STATIONS */}
          {/* ---------------------------------------------------- */}
          {PROMO_ISLANDS.map((promo) => (
            <g
              key={promo.id}
              className="cursor-pointer group"
              onClick={() => handleWalkToPromo(promo)}
              onMouseEnter={() => setHoveredPromo(promo)}
              onMouseLeave={() => setHoveredPromo(null)}
            >
              {/* Pulsing Outer Glow Ring */}
              <circle
                cx={promo.cx}
                cy={promo.cy}
                r="7"
                fill={promo.color}
                opacity="0.18"
                className="group-hover:scale-125 transition-transform origin-center"
              />
              {/* Podium Base */}
              <circle
                cx={promo.cx}
                cy={promo.cy}
                r="5"
                fill={promo.color}
                stroke="#ffffff"
                strokeWidth="1.2"
                filter="url(#shelfElevatedShadow)"
              />
              {/* Label Tag beside island */}
              <rect
                x={promo.cx + 7}
                y={promo.cy - 3.5}
                width="28"
                height="7"
                fill="#ffffff"
                stroke={promo.color}
                strokeWidth="0.6"
                rx="1.5"
                opacity="0.95"
              />
              <text
                x={promo.cx + 21}
                y={promo.cy + 1.2}
                textAnchor="middle"
                fontSize="3.8"
                fontWeight="900"
                fill={promo.color}
              >
                {promo.label}
              </text>
            </g>
          ))}

          {/* ---------------------------------------------------- */}
          {/* GONDOLA AISLES 1 TO 9 WITH LABELS & CATEGORY BADGES */}
          {/* ---------------------------------------------------- */}
          {AISLES.map((aisle) => {
            const rx = toSvgX(aisle.x - aisle.w / 2);
            const ry = toSvgY(aisle.z - aisle.h / 2);
            const rw = (aisle.w / 72) * 200;
            const rh = (aisle.h / 72) * 200;
            const isHighlighted = highlightedAisle === aisle.number;
            const isHorizontal = aisle.w > aisle.h;

            return (
              <g
                key={aisle.number}
                className="cursor-pointer group"
                onClick={() => handleWalkToAisle(aisle)}
                onMouseEnter={() => setHoveredAisle(aisle)}
                onMouseLeave={() => setHoveredAisle(null)}
              >
                {/* 1. Category Header Badge above Vertical Aisles (Aisles 1, 2, 5, 6, 9) */}
                {!isHorizontal && (
                  <g transform={`translate(${rx + rw / 2}, ${ry - 5.5})`}>
                    <rect
                      x="-14"
                      y="-4.5"
                      width="28"
                      height="8"
                      fill="#ffffff"
                      stroke={isHighlighted ? '#ef4444' : aisle.color}
                      strokeWidth={isHighlighted ? '1.2' : '0.7'}
                      rx="2"
                      filter="url(#shelfElevatedShadow)"
                      className="group-hover:scale-105 transition-transform"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fontSize="3.6"
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {aisle.icon} 0{aisle.number} {language === 'TE' ? aisle.teluguShort : language === 'HI' ? aisle.hindiShort : aisle.shortLabel}
                    </text>
                  </g>
                )}

                {/* 2. Gondola Shelf Rack Body */}
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  fill={isHighlighted ? '#ef4444' : aisle.color}
                  stroke={isHighlighted ? '#b91c1c' : '#334155'}
                  strokeWidth={isHighlighted ? 1.5 : 0.7}
                  rx="1.8"
                  filter={isHighlighted ? 'url(#highlightPulse)' : 'url(#shelfElevatedShadow)'}
                  className="transition-all group-hover:brightness-110"
                />

                {/* 3. Internal Shelf divisions / textures */}
                {isHorizontal ? (
                  // Horizontal Aisle text & badge right inside the rack
                  <g pointerEvents="none">
                    <line x1={rx + 2} y1={ry + rh / 2} x2={rx + rw - 2} y2={ry + rh / 2} stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2 + 1.6}
                      textAnchor="middle"
                      fontSize="4.0"
                      fontWeight="900"
                      fill="#ffffff"
                      letterSpacing="0.2"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                    >
                      {aisle.icon} 0{aisle.number} {language === 'TE' ? aisle.teluguShort : language === 'HI' ? aisle.hindiShort : aisle.shortLabel}
                    </text>
                  </g>
                ) : (
                  // Vertical Aisle numbers & icons along the shelf
                  <g pointerEvents="none">
                    {/* Top Number Pin */}
                    <circle cx={rx + rw / 2} cy={ry + 5} r="2.8" fill="#ffffff" />
                    <text
                      x={rx + rw / 2}
                      y={ry + 6.3}
                      textAnchor="middle"
                      fontSize="3.8"
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {aisle.number}
                    </text>

                    {/* Middle Icon */}
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2 + 1.5}
                      textAnchor="middle"
                      fontSize="4.8"
                    >
                      {aisle.icon}
                    </text>

                    {/* Bottom Number Pin */}
                    <circle cx={rx + rw / 2} cy={ry + rh - 5} r="2.8" fill="#ffffff" />
                    <text
                      x={rx + rw / 2}
                      y={ry + rh - 3.7}
                      textAnchor="middle"
                      fontSize="3.8"
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {aisle.number}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ---------------------------------------------------- */}
          {/* BILLING COUNTER LANES & EXIT ZONE (Y = 158 to 176) */}
          {/* ---------------------------------------------------- */}
          <g
            className="cursor-pointer group"
            onClick={handleWalkToBilling}
            onMouseEnter={() => setHoveredZone('billing')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            {/* Cash Counters Base */}
            <rect
              x="25"
              y="158"
              width="142"
              height="18"
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="1"
              rx="3"
              filter="url(#shelfElevatedShadow)"
              className="group-hover:fill-amber-100 transition-colors"
            />
            {/* Title Bar */}
            <text
              x="96"
              y="165"
              textAnchor="middle"
              fontSize="5.0"
              fontWeight="900"
              fill="#b45309"
              letterSpacing="0.4"
            >
              {language === 'TE'
                ? '💳 బిల్లింగ్ కౌంటర్లు (లేన్స్ 01 - 06)'
                : language === 'HI'
                ? '💳 बिलिंग काउंटर (लेन 01 - 06)'
                : '💳 BILLING & CHECKOUT (LANES 01 - 06)'}
            </text>

            {/* 6 Individual POS Cash Counters */}
            {[0, 1, 2, 3, 4, 5].map((lane) => {
              const lx = 32 + lane * 22;
              return (
                <g key={lane}>
                  <rect x={lx} y="167" width="18" height="7" fill="#ffffff" stroke="#d97706" strokeWidth="0.6" rx="1.5" />
                  <circle cx={lx + 3.5} cy="170.5" r="1.5" fill="#22c55e" />
                  <text x={lx + 11} y="172.2" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="#92400e">
                    L0{lane + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Store Exit Portal */}
          <g
            className="cursor-pointer"
            onClick={handleWalkToBilling}
            onMouseEnter={() => setHoveredZone('exit')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect x="172" y="158" width="22" height="18" fill="#dcfce7" stroke="#22c55e" strokeWidth="1" rx="3" />
            <text x="183" y="166" textAnchor="middle" fontSize="4.2" fontWeight="900" fill="#15803d">
              {language === 'TE' ? '🚪నిష్క్రమణ' : language === 'HI' ? '🚪निकास' : '🚪EXIT'}
            </text>
            <polygon points="183,173 186,169 180,169" fill="#16a34a" />
          </g>

          {/* ---------------------------------------------------- */}
          {/* SHOPPER RADAR BEACON (GPU-Driven Live transform) */}
          {/* ---------------------------------------------------- */}
          <g ref={markerRef} transform="translate(100, 22.2)">
            {/* Vision Field Cone (60° FOV) */}
            <path d="M 0 0 L -12 24 L 12 24 Z" fill="#3b82f6" opacity="0.32" />
            {/* Animated Radar Pulse Wave */}
            <circle cx="0" cy="0" r="7.5" fill="#3b82f6" opacity="0.3" className="animate-ping" />
            {/* Crisp High-Contrast Core Marker */}
            <circle cx="0" cy="0" r="4.2" fill="#2563eb" stroke="#ffffff" strokeWidth="1.4" />
            {/* Forward Direction Needle */}
            <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
          </g>
        </svg>

        {/* 4. Interactive Live Aisle Inspector Card / Proximity Prompt */}
        <div className="mt-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-xs transition-all">
          {hoveredAisle ? (
            <div
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => handleWalkToAisle(hoveredAisle)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs flex-shrink-0"
                  style={{ backgroundColor: `${hoveredAisle.color}20`, border: `1px solid ${hoveredAisle.color}60` }}
                >
                  {hoveredAisle.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 truncate">
                    Aisle 0{hoveredAisle.number}: {language === 'TE' ? hoveredAisle.teluguName : language === 'HI' ? hoveredAisle.hindiName : hoveredAisle.name}
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-medium truncate">
                    {hoveredAisle.itemsPreview}
                  </p>
                </div>
              </div>
              <button className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black flex items-center gap-1 flex-shrink-0 shadow-xs">
                <span>Walk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : hoveredPromo ? (
            <div
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => handleWalkToPromo(hoveredPromo)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-sm flex-shrink-0">
                  {hoveredPromo.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 truncate">
                    {language === 'TE' ? hoveredPromo.teluguName : language === 'HI' ? hoveredPromo.hindiName : hoveredPromo.name}
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-medium truncate">
                    Special promotional podium • Click to visit
                  </p>
                </div>
              </div>
              <button className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 flex-shrink-0 shadow-xs">
                <span>Walk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : hoveredZone === 'billing' || hoveredZone === 'exit' ? (
            <div
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={handleWalkToBilling}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-sm flex-shrink-0">
                  💳
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 truncate">
                    {language === 'TE' ? 'బిల్లింగ్ కౌంటర్లు (లేన్స్ 1-6)' : language === 'HI' ? 'बिलिंग काउंटर (लेन 1-6)' : 'Billing Counters (Lanes 1-6)'}
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-medium truncate">
                    Automated barcode scanning & payment desk
                  </p>
                </div>
              </div>
              <button className="px-2 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-black flex items-center gap-1 flex-shrink-0 shadow-xs">
                <span>Pay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : hoveredZone === 'entrance' || hoveredZone === 'trolley' ? (
            <div
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={handleWalkToEntrance}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-sm flex-shrink-0">
                  🛒
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 truncate">
                    {language === 'TE' ? 'ప్రవేశ లాబీ & ట్రాలీ బే' : language === 'HI' ? 'प्रवेश द्वार व ट्रॉली बे' : 'Main Entrance & Trolley Bay'}
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-medium truncate">
                    Store entrance concourse & cart pick-up
                  </p>
                </div>
              </div>
              <button className="px-2 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-black flex items-center gap-1 flex-shrink-0 shadow-xs">
                <span>Walk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-left">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-black text-slate-800 truncate">
                    {playerProximityLabel}
                  </p>
                  <p className="text-[9.5px] text-slate-400 font-medium truncate">
                    {language === 'TE'
                      ? 'నడవడానికి ఏదైనా విభాగంపై క్లిక్ చేయండి'
                      : language === 'HI'
                      ? 'जाने के लिए किसी भी आइसल पर क्लिक करें'
                      : 'Click any aisle on the map to walk there'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                Live GPS
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
