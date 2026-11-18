'use client';

import React, { useEffect, useRef, useState } from 'react';
import { martRuntime, useMartStore } from '@/store/useMartStore';
import { Compass, Minimize2, MapPin, ArrowRight } from 'lucide-react';

interface AisleDef {
  number: number;
  name: string;
  hindiName: string;
  teluguName: string;
  icon: string;
  shortLabel: string;
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
    itemsPreview: 'Kurkure, Lays, Haldiram',
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
    itemsPreview: 'Parle-G, Good Day, Oreo',
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
    shortLabel: 'TEA',
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
    shortLabel: 'ATTA',
    itemsPreview: 'Aashirvaad Atta, Basmati',
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
    shortLabel: 'OILS',
    itemsPreview: 'Fortune Oil, Amul Ghee',
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
    itemsPreview: 'MDH Masala, Salt, Sugar',
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
    itemsPreview: 'Maggi, Yippee, Pasta',
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
    shortLabel: 'CARE',
    itemsPreview: 'Dove, Dettol, Shampoos',
    x: 29.5,
    z: 0,
    w: 2.2,
    h: 22,
    color: '#ec4899',
    walkTarget: { x: 26.8, z: -6, yaw: Math.PI / 2 },
  },
];

// 3 Central promotional stations
const PROMO_ISLANDS = [
  {
    id: 'promo-1',
    label: '⭐ 01',
    name: '01 Promo • Cadbury Chocolates',
    hindiName: '01 स्पेशल ऑफर्स (चॉकलेट्स)',
    teluguName: '01 ప్రత్యేక ఆఫర్లు (చాక్లెట్లు)',
    color: '#f43f5e',
    cx: 100,
    cy: 37.5,
    walkTarget: { x: 0, z: -20, yaw: 0 },
  },
  {
    id: 'promo-2',
    label: '🎁',
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
    label: '🏷️',
    name: 'Super Saver Deals',
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
  const [playerProximityLabel, setPlayerProximityLabel] = useState<string>('Entrance & Trolley Bay');

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

      tick++;
      if (tick % 25 === 0) {
        if (pz < -22) {
          setPlayerProximityLabel(
            language === 'TE' ? 'ప్రవేశం & ట్రాలీలు' : language === 'HI' ? 'प्रवेश व ट्रॉली' : 'Entrance & Trolleys'
          );
        } else if (pz > 15) {
          setPlayerProximityLabel(
            language === 'TE' ? 'బిల్లింగ్ కౌంటర్లు' : language === 'HI' ? 'बिलिंग काउंटर' : 'Billing Counters'
          );
        } else if (px < -20) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 01: స్నాక్స్' : language === 'HI' ? 'आइसल 01: स्नैक्स' : 'Aisle 01: Snacks'
          );
        } else if (px < -14) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 02: బేకరీ' : language === 'HI' ? 'आइसल 02: बेकरी' : 'Aisle 02: Bakery'
          );
        } else if (px < 0 && pz < 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 03: టీ & కాఫీ' : language === 'HI' ? 'आइसल 03: चाय/कॉफी' : 'Aisle 03: Beverages'
          );
        } else if (px < 0 && pz >= 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 04: డైరీ' : language === 'HI' ? 'आइसल 04: डेयरी' : 'Aisle 04: Dairy'
          );
        } else if (px > 0 && px <= 14 && pz < 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 07: మసాలాలు' : language === 'HI' ? 'आइसल 07: मसाले' : 'Aisle 07: Spices'
          );
        } else if (px > 0 && px <= 14 && pz >= 0) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 08: ఇన్‌స్టంట్' : language === 'HI' ? 'आइसल 08: नूडल्स' : 'Aisle 08: Instant'
          );
        } else if (px > 14 && px <= 20) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 05: పిండి/బియ్యం' : language === 'HI' ? 'आइसल 05: आटा/चावल' : 'Aisle 05: Atta & Rice'
          );
        } else if (px > 20 && px <= 26) {
          setPlayerProximityLabel(
            language === 'TE' ? 'విభాగం 06: వంట నూనెలు' : language === 'HI' ? 'आइसल 06: तेल/घी' : 'Aisle 06: Cooking Oils'
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
        className="pointer-events-auto fixed bottom-20 left-4 sm:left-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-blue-400 text-slate-800 p-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold cursor-pointer group active:scale-95"
        title="Open Store Map"
      >
        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
        </div>
        <span className="text-[11px] font-black tracking-tight text-slate-800">
          {language === 'TE' ? 'మ్యాప్' : language === 'HI' ? 'नक्शा' : 'Store Map'}
        </span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Supermarket Mini-map"
      className="pointer-events-auto fixed bottom-20 left-4 sm:left-6 z-40 w-52 sm:w-56 bg-white/98 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.14)] overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* 1. Header: Slim 1-line clean bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50/90 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-black text-slate-900 tracking-tight">
            {language === 'TE' ? 'స్టోర్ మ్యాప్' : language === 'HI' ? 'स्टोर मैप' : 'STORE MAP'}
          </span>
          <span className="text-[8.5px] bg-blue-50 text-blue-700 font-bold px-1 rounded border border-blue-200/70 ml-0.5">
            72m²
          </span>
        </div>
        <button
          onClick={() => toggleMinimap(false)}
          className="w-5 h-5 rounded-md hover:bg-slate-200/80 text-slate-400 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          title="Minimize map"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
      </div>

      {/* 2. SVG Clean Blueprint Map (200x200 viewBox) */}
      <div className="p-1.5 bg-[#FAFBFD]">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-auto aspect-square rounded-xl bg-white border border-slate-200/90"
        >
          <defs>
            {/* Subtle floor grid */}
            <pattern id="cleanGrid" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Floor grid */}
          <rect x="2" y="2" width="196" height="196" fill="url(#cleanGrid)" rx="6" />
          <rect x="2" y="2" width="196" height="196" fill="none" stroke="#e2e8f0" strokeWidth="1" rx="6" />

          {/* ---------------- ENTRANCE (Y = 8 to 17, X = 65 to 135) ---------------- */}
          <g
            className="cursor-pointer group"
            onClick={handleWalkToEntrance}
            onMouseEnter={() => setHoveredZone('entrance')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect
              x="62"
              y="7"
              width="76"
              height="11"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="0.8"
              rx="2.5"
              className="group-hover:fill-sky-100 transition-colors"
            />
            <text
              x="100"
              y="15"
              textAnchor="middle"
              fontSize="5.2"
              fontWeight="900"
              fill="#0369a1"
              letterSpacing="0.3"
            >
              {language === 'TE' ? '🚪 ప్రవేశం' : language === 'HI' ? '🚪 प्रवेश' : '🚪 ENTRANCE'}
            </text>
            <polygon points="100,20 97.5,18 102.5,18" fill="#16a34a" />
          </g>

          {/* Trolley Bay mark at left */}
          <g
            className="cursor-pointer"
            onClick={handleWalkToEntrance}
            onMouseEnter={() => setHoveredZone('trolley')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect x="8" y="7" width="46" height="11" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.7" rx="2" strokeDasharray="2,1" />
            <text x="31" y="14.8" textAnchor="middle" fontSize="4.6" fontWeight="800" fill="#64748b">
              {language === 'TE' ? '🛒 ట్రాలీలు' : language === 'HI' ? '🛒 ट्रॉली' : '🛒 Carts'}
            </text>
          </g>

          {/* ---------------- 3 PROMO PODIUMS IN CENTER ---------------- */}
          {PROMO_ISLANDS.map((promo) => (
            <g
              key={promo.id}
              className="cursor-pointer group"
              onClick={() => handleWalkToPromo(promo)}
              onMouseEnter={() => setHoveredPromo(promo)}
              onMouseLeave={() => setHoveredPromo(null)}
            >
              <circle cx={promo.cx} cy={promo.cy} r="6.5" fill={promo.color} opacity="0.2" className="group-hover:scale-125 transition-transform origin-center" />
              <circle cx={promo.cx} cy={promo.cy} r="4.6" fill={promo.color} stroke="#ffffff" strokeWidth="1" />
              <text x={promo.cx} y={promo.cy + 1.4} textAnchor="middle" fontSize="3.5" fontWeight="900" fill="#ffffff" pointerEvents="none">
                {promo.label}
              </text>
            </g>
          ))}

          {/* ---------------- GONDOLA AISLES 1 TO 9 (CLEAN, NO OVERLAPPING) ---------------- */}
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
                {/* Gondola Shelf Body */}
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  fill={isHighlighted ? '#ef4444' : aisle.color}
                  stroke={isHighlighted ? '#b91c1c' : '#1e293b'}
                  strokeWidth={isHighlighted ? 1.4 : 0.6}
                  rx="1.5"
                  className="transition-all group-hover:brightness-110"
                />

                {isHorizontal ? (
                  // Horizontal Aisles (3, 4, 7, 8): Neat text centered entirely inside the bar
                  <g pointerEvents="none">
                    {/* Circle badge at left/right endcap */}
                    <circle cx={aisle.number === 3 || aisle.number === 4 ? rx + 3.2 : rx + rw - 3.2} cy={ry + rh / 2} r="2.4" fill="#ffffff" />
                    <text
                      x={aisle.number === 3 || aisle.number === 4 ? rx + 3.2 : rx + rw - 3.2}
                      y={ry + rh / 2 + 1.1}
                      textAnchor="middle"
                      fontSize="3.2"
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {aisle.number}
                    </text>
                    {/* Centered label inside bar */}
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2 + 1.3}
                      textAnchor="middle"
                      fontSize="3.8"
                      fontWeight="900"
                      fill="#ffffff"
                      letterSpacing="0.2"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                    >
                      {aisle.icon} {aisle.shortLabel}
                    </text>
                  </g>
                ) : (
                  // Vertical Aisles (1, 2, 5, 6, 9): Clean endcap number discs and center icon, strictly inside rack
                  <g pointerEvents="none">
                    {/* Top Endcap Marker */}
                    <circle cx={rx + rw / 2} cy={ry + 3.5} r="2.5" fill="#ffffff" />
                    <text x={rx + rw / 2} y={ry + 4.6} textAnchor="middle" fontSize="3.2" fontWeight="900" fill="#0f172a">
                      {aisle.number}
                    </text>

                    {/* Middle Category Emoji */}
                    <text x={rx + rw / 2} y={ry + rh / 2 + 1.5} textAnchor="middle" fontSize="4.6">
                      {aisle.icon}
                    </text>

                    {/* Bottom Endcap Marker */}
                    <circle cx={rx + rw / 2} cy={ry + rh - 3.5} r="2.5" fill="#ffffff" />
                    <text x={rx + rw / 2} y={ry + rh - 2.4} textAnchor="middle" fontSize="3.2" fontWeight="900" fill="#0f172a">
                      {aisle.number}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ---------------- BILLING COUNTER & EXIT (Y = 160 to 174) ---------------- */}
          <g
            className="cursor-pointer group"
            onClick={handleWalkToBilling}
            onMouseEnter={() => setHoveredZone('billing')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect
              x="22"
              y="160"
              width="144"
              height="14"
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="0.8"
              rx="2.5"
              className="group-hover:fill-amber-100 transition-colors"
            />
            <text
              x="94"
              y="169"
              textAnchor="middle"
              fontSize="4.8"
              fontWeight="900"
              fill="#b45309"
              letterSpacing="0.3"
            >
              {language === 'TE'
                ? '💳 బిల్లింగ్ కౌంటర్లు (1 - 6)'
                : language === 'HI'
                ? '💳 बिलिंग काउंटर (1 - 6)'
                : '💳 BILLING & CHECKOUT (LANES 1-6)'}
            </text>
          </g>

          {/* Store Exit */}
          <g
            className="cursor-pointer"
            onClick={handleWalkToBilling}
            onMouseEnter={() => setHoveredZone('exit')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <rect x="170" y="160" width="22" height="14" fill="#dcfce7" stroke="#22c55e" strokeWidth="0.8" rx="2.5" />
            <text x="181" y="169" textAnchor="middle" fontSize="4.2" fontWeight="900" fill="#15803d">
              {language === 'TE' ? '🚪నిష్క్రమణ' : language === 'HI' ? '🚪निकास' : '🚪EXIT'}
            </text>
          </g>

          {/* ---------------- SHOPPER RADAR BEACON ---------------- */}
          <g ref={markerRef} transform="translate(100, 22.2)">
            <path d="M 0 0 L -10 20 L 10 20 Z" fill="#3b82f6" opacity="0.3" />
            <circle cx="0" cy="0" r="6" fill="#3b82f6" opacity="0.35" className="animate-ping" />
            <circle cx="0" cy="0" r="3.6" fill="#2563eb" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="0" y2="6.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>

        {/* 3. Sleek 1-Line Live Inspector / Proximity Pill */}
        <div className="mt-1.5 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-left">
          {hoveredAisle ? (
            <div
              className="flex items-center justify-between gap-1.5 cursor-pointer"
              onClick={() => handleWalkToAisle(hoveredAisle)}
            >
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="text-xs">{hoveredAisle.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-slate-900 truncate">
                    Aisle 0{hoveredAisle.number}: {language === 'TE' ? hoveredAisle.teluguName : language === 'HI' ? hoveredAisle.hindiName : hoveredAisle.name}
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-medium truncate">
                    {hoveredAisle.itemsPreview}
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black flex items-center gap-0.5 flex-shrink-0">
                Walk <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          ) : hoveredPromo ? (
            <div
              className="flex items-center justify-between gap-1.5 cursor-pointer"
              onClick={() => handleWalkToPromo(hoveredPromo)}
            >
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="text-xs">{hoveredPromo.label.slice(0, 2)}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-slate-900 truncate">
                    {language === 'TE' ? hoveredPromo.teluguName : language === 'HI' ? hoveredPromo.hindiName : hoveredPromo.name}
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-medium truncate">
                    Promotional island • Tap to visit
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black flex items-center gap-0.5 flex-shrink-0">
                Walk <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          ) : hoveredZone === 'billing' || hoveredZone === 'exit' ? (
            <div
              className="flex items-center justify-between gap-1.5 cursor-pointer"
              onClick={handleWalkToBilling}
            >
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="text-xs">💳</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-slate-900 truncate">
                    {language === 'TE' ? 'బిల్లింగ్ కౌంటర్లు (1-6)' : language === 'HI' ? 'बिलिंग काउंटर (1-6)' : 'Billing Counters (Lanes 1-6)'}
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-medium truncate">
                    Checkout & payment desks
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-600 text-white text-[9px] font-black flex items-center gap-0.5 flex-shrink-0">
                Pay <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9.5px] font-black text-slate-800 truncate">
                    {playerProximityLabel}
                  </p>
                  <p className="text-[8.5px] text-slate-400 font-medium truncate">
                    {language === 'TE'
                      ? 'నడవడానికి ఏదైనా విభాగంపై క్లిక్ చేయండి'
                      : language === 'HI'
                      ? 'जाने के लिए आइसल पर टैप करें'
                      : 'Tap any aisle to walk there'}
                  </p>
                </div>
              </div>
              <span className="text-[8.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex-shrink-0">
                GPS
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
