
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Product } from '@/types';
import {
  ShoppingCart,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  RotateCcw,
  Eye,
  Camera,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  CreditCard,
  ShieldAlert,
  Store,
  ArrowRight,
  User,
  LogIn,
  Heart,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Move,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ProductHoverCard } from '@/components/ui/ProductHoverCard';

export const OnboardingHintBanner: React.FC = React.memo(() => {
  const [visible, setVisible] = useState(true);
  const totalItems = useCartStore((state) => state.totalItems);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('martverse_hint_dismissed') === 'true') {
        setVisible(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (totalItems > 0 && visible) {
      setVisible(false);
      try {
        if (typeof window !== 'undefined') localStorage.setItem('martverse_hint_dismissed', 'true');
      } catch {}
    }
  }, [totalItems, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-4 sm:left-8 z-40 pointer-events-auto animate-in fade-in slide-in-from-left duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3">
        <span className="text-base">🛒</span>
        <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-100">
          Tap an item, then Add to trolley
        </span>
        <button
          onClick={() => {
            setVisible(false);
            try {
              if (typeof window !== 'undefined') localStorage.setItem('martverse_hint_dismissed', 'true');
            } catch {}
          }}
          className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
          aria-label="Dismiss hint"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

export const ContextualPromptBanner: React.FC = React.memo(() => {
  const promptText = useMartStore((state) => state.promptText);
  if (!promptText) return null;

  return (
    <div className="flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl flex items-center gap-3 border border-slate-700/80 text-white transition-all">
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide">{promptText}</span>
        <kbd className="bg-white/10 border border-white/20 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-md shadow-inner">
          E
        </kbd>
      </div>
    </div>
  );
});

export const IntroBrandBanner: React.FC = () => null;

const STORE_DEPARTMENTS = [
  { id: 'snacks-namkeen', name: 'Snacks & Namkeen', aisleNumber: 1, icon: '🥨', color: '#f59e0b', desc: 'Chips, Kurkure & Bhujia' },
  { id: 'bakery-biscuits', name: 'Bakery & Biscuits', aisleNumber: 2, icon: '🍪', color: '#d97706', desc: 'Parle-G, Good Day & Oreo' },
  { id: 'beverages-tea-coffee', name: 'Beverages & Tea/Coffee', aisleNumber: 3, icon: '☕', color: '#0284c7', desc: 'Tata Tea, Nescafe & Horlicks' },
  { id: 'dairy-breakfast', name: 'Dairy & Breakfast', aisleNumber: 4, icon: '🧀', color: '#06b6d4', desc: 'Amul Butter, Paneer & Cereals' },
  { id: 'rice-flours-pulses', name: 'Rice, Atta & Pulses', aisleNumber: 5, icon: '🌾', color: '#10b981', desc: 'Aashirvaad Chakki Atta & Basmati' },
  { id: 'spices-cooking-essentials', name: 'Spices & Cooking Oils', aisleNumber: 6, icon: '🌶️', color: '#ef4444', desc: 'Fortune Oil, Ghee & Spices' },
  { id: 'instant-packaged-foods', name: 'Instant & Packaged Foods', aisleNumber: 7, icon: '🍜', color: '#8b5cf6', desc: 'Maggi, Yippee & Pasta' },
  { id: 'personal-care', name: 'Personal Care & Hygiene', aisleNumber: 8, icon: '🧴', color: '#ec4899', desc: 'Dove, Dettol & Colgate' },
  { id: 'household-cleaning', name: 'Household & Cleaning', aisleNumber: 9, icon: '🧼', color: '#3b82f6', desc: 'Surf Excel, Vim & Harpic' },
  { id: 'fresh-produce-fruits-veggies', name: 'Fresh Produce & Fruits', aisleNumber: 10, icon: '🍎', color: '#22c55e', desc: 'Farm Fresh Apples & Veggies' },
];

export const SupermarketHUD: React.FC = () => {
  const router = useRouter();
  const activeFloor = useMartStore((state) => state.activeFloor);
  const setActiveFloor = useMartStore((state) => state.setActiveFloor);
  const isSoundMuted = useMartStore((state) => state.isSoundMuted);
  const toggleSound = useMartStore((state) => state.toggleSound);
  const cameraMode = useMartStore((state) => state.cameraMode);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const hasMovedTrolley = useMartStore((state) => state.hasMovedTrolley);
  const setHasMovedTrolley = useMartStore((state) => state.setHasMovedTrolley);
  const resetToOriginalState = useMartStore((state) => state.resetToOriginalState);
  const products = useMartStore((state) => state.products);
  const navigateToProduct = useMartStore((state) => state.navigateToProduct);
  const activeAutoNav = useMartStore((state) => state.activeAutoNav);
  const startAutoNavToProduct = useMartStore((state) => state.startAutoNavToProduct);
  const cancelAutoNav = useMartStore((state) => state.cancelAutoNav);
  const isMinimapOpen = useMartStore((state) => state.isMinimapOpen);
  const toggleMinimap = useMartStore((state) => state.toggleMinimap);
  const isNavigatorOpen = useMartStore((state) => state.isNavigatorOpen);
  const toggleNavigator = useMartStore((state) => state.toggleNavigator);

  const toast = useMartStore((state) => state.toast);
  const hideToast = useMartStore((state) => state.hideToast);
  const unpaidExitAlertOpen = useMartStore((state) => state.unpaidExitAlertOpen);
  const closeUnpaidExitAlert = useMartStore((state) => state.closeUnpaidExitAlert);

  const cartItems = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);

  const startCheckout = useBillingStore((state) => state.startCheckout);

  // Search & Category Dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const hydrateProductsFromCache = useMartStore((state) => state.hydrateProductsFromCache);

  const handleSelectDepartment = (dept: typeof STORE_DEPARTMENTS[0]) => {
    setIsCategoryDropdownOpen(false);
    const targetProduct = products.find(
      (p) =>
        p.aisleNumber === dept.aisleNumber ||
        p.categoryId === dept.id ||
        p.placement?.aisleNumber === dept.aisleNumber
    ) || products[0];

    if (targetProduct) {
      startAutoNavToProduct(targetProduct, false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    hydrateProductsFromCache();

    let isSubscribed = true;
    async function checkHealth() {
      const ok = await api.checkBackendHealth();
      if (isSubscribed) setIsBackendOnline(ok);
    }
    checkHealth();
    const interval = setInterval(checkHealth, 20000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [hydrateProductsFromCache]);

  // Filter products by starting letters or word-start in name/brand only
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return products
      .filter((p) => {
        const nameLower = p.name.toLowerCase();
        const brandLower = p.brand?.toLowerCase() || '';

        // Match if product name starts with search query
        if (nameLower.startsWith(q)) return true;

        // Match if any individual word in the product name starts with search query (e.g. "Haldiram's ...", "Head & Shoulders")
        const nameWords = nameLower.split(/\s+/);
        if (nameWords.some((w) => w.startsWith(q))) return true;

        // Match if brand name starts with search query
        if (brandLower.startsWith(q)) return true;
        const brandWords = brandLower.split(/\s+/);
        if (brandWords.some((w) => w.startsWith(q))) return true;

        return false;
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [products, searchQuery]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* ============================================================== */}
      {/* --- Top Unified Floating Executive Command Navbar --- */}
      {/* ============================================================== */}
      <header className="w-full max-w-7xl mx-auto pointer-events-auto">
        <div className="relative rounded-2xl px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-3xl backdrop-saturate-150 border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.03)] select-none">

          {/* Brand Identity: Clean Storefront Logo with Light Blue to Passing White Text */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <button
              onClick={() => {
                resetToOriginalState();
              }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 border border-white/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden group shadow-xs"
              title="Martverse Home / Entrance"
            >
              <Store className="w-5 h-5 text-white stroke-[2.2] drop-shadow-xs transition-transform group-hover:scale-110" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black tracking-tight text-sm sm:text-base leading-none bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  MARTVERSE
                </span>
                {/* Status Badge: completely hidden when backend is online. Only shows in RED when backend is offline */}
                {isMounted && isBackendOnline === false && (
                  <span className="hidden md:inline-flex items-center gap-1.5 text-[9px] bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-full border border-rose-200/90 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    BACKEND OFFLINE
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] text-sky-600/80 font-bold hidden xs:block leading-tight mt-0.5 tracking-wide">
                Virtual Hypermarket
              </p>
            </div>
          </div>

          {/* Active Store Section Indicator — Interactive Category Dropdown Pill */}
          <div ref={categoryDropdownRef} className="relative hidden sm:block">
            <button
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              className="h-10 flex items-center px-3.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200/90 text-xs font-bold text-slate-800 gap-2 select-none cursor-pointer transition-all shadow-xs group"
              title="Browse 10 Hypermarket Departments"
            >
              <Layers className="w-3.5 h-3.5 text-sky-600 group-hover:rotate-12 transition-transform" />
              <span>Groceries & Supermarket</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
            </button>

            {/* Dropdown Menu of 10 Departments */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-12 left-0 w-80 max-h-[70vh] overflow-y-auto bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[11px] font-black text-slate-400 tracking-wider uppercase">Hypermarket Departments</div>
                  <p className="text-[10px] text-slate-500 font-medium">Select a department to fly the camera down that aisle</p>
                </div>
                <div className="mt-1 space-y-1">
                  {STORE_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleSelectDepartment(dept)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-left transition-all group/item cursor-pointer border border-transparent hover:border-slate-200/60"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs transition-transform group-hover/item:scale-110"
                        style={{ backgroundColor: `${dept.color}15`, border: `1px solid ${dept.color}40` }}
                      >
                        {dept.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 group-hover/item:text-sky-600 transition-colors">
                            {dept.name}
                          </span>
                          <span className="text-[9.5px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {dept.aisleNumber === 10 ? 'Dept 10' : `Aisle ${dept.aisleNumber}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                          {dept.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar - Standardized h-10 height, Clean Pearl Glass */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-[150px] xs:max-w-[190px] sm:max-w-xs md:max-w-sm lg:max-w-md h-10 group">
            <div className="relative h-10 flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setIsSearchOpen(true);
                  }
                }}
                placeholder="Search items..."
                className="w-full h-10 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-9 pr-8 border border-slate-200/90 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 outline-none shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-all active:scale-90"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clean Dropdown — ONLY displayed when user has typed a search query */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 sm:left-auto sm:right-0 w-72 sm:w-80 md:w-96 bg-white/98 backdrop-blur-3xl rounded-2xl border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.18),0_4px_16px_rgba(15,23,42,0.06)] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-800">Matching Items</span>
                    <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded-full border border-sky-200">
                      {filteredProducts.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Click to locate</span>
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">
                      No items found starting with &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          startAutoNavToProduct(p, true);
                        }}
                        className="w-full px-2.5 py-2 flex items-center justify-between gap-3 hover:bg-sky-50/80 hover:translate-x-0.5 transition-all duration-150 text-left group cursor-pointer rounded-xl"
                      >
                        {/* 1. Item Image & 2. Item Name */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5 shadow-xs">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/products/fallback.svg';
                                }}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <span className="text-xs">🛍️</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 text-xs truncate block group-hover:text-sky-600 transition-colors">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {p.category?.name || 'Groceries'}
                            </span>
                          </div>
                        </div>

                        {/* 3. Price & Dedicated Add to Trolley CTA */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-600 font-mono">
                            ₹{p.price}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSearchOpen(false);
                              setSearchQuery('');
                              startAutoNavToProduct(p, true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            title={`Add ${p.name} to Shopping Trolley`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-white" />
                            <span className="hidden sm:inline">Add to Trolley</span>
                            <span className="sm:hidden">+ Add</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Utilities & User Area - Tactile Frosted Pearl Glass Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Camera Perspective Mode (1st / 3rd Person) */}
            <button
              onClick={() =>
                setCameraMode(cameraMode === 'third_person' ? 'first_person' : 'third_person')
              }
              className="h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs active:scale-90 hover:scale-[1.03] group"
              title="Toggle Camera View (1st / 3rd Person)"
            >
              {cameraMode === 'first_person' ? (
                <Eye className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              ) : (
                <Camera className="w-4 h-4 text-slate-600 group-hover:text-sky-600 group-hover:scale-110 transition-all" />
              )}
              <span className="hidden sm:inline font-semibold">
                {cameraMode === 'first_person' ? '1st Person' : '3rd Person'}
              </span>
            </button>

            {/* On-Screen 4-Arrow Navigator Toggle */}
            <button
              onClick={() => {
                toggleNavigator();
              }}
              className={`h-10 px-2.5 sm:px-3 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs active:scale-90 hover:scale-[1.03] group ${
                isNavigatorOpen
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30 font-bold'
                  : 'bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200/90 hover:border-slate-300'
              }`}
              title={isNavigatorOpen ? 'Hide On-Screen 4-Arrow Navigator' : 'Show On-Screen 4-Arrow Navigator'}
            >
              <Move className={`w-4 h-4 ${isNavigatorOpen ? 'text-white' : 'text-slate-600'} group-hover:scale-110 transition-transform`} />
              <span className="inline font-semibold">Arrows</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="h-10 w-10 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs active:scale-90 hover:scale-[1.03] group"
              title={isSoundMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-600 group-hover:text-sky-600 group-hover:scale-110 transition-all" />
              )}
            </button>

            {/* Reset to Original State & Starting Position */}
            <button
              onClick={() => {
                resetToOriginalState();
              }}
              className="h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold group cursor-pointer shadow-xs active:scale-90 hover:scale-[1.03]"
              title="Reset to Original State & Starting Position (Entrance)"
            >
              <RotateCcw className="w-4 h-4 text-slate-600 group-hover:-rotate-90 group-hover:text-sky-600 transition-all duration-300" />
              <span className="hidden xl:inline font-semibold text-slate-700 group-hover:text-slate-900">Reset</span>
            </button>

            {/* Wishlist Icon Only — Routes directly to dedicated /wishlist page */}
            <button
              onClick={() => router.push('/wishlist')}
              className="h-10 w-10 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 transition-all duration-200 relative flex items-center justify-center cursor-pointer shadow-xs active:scale-90 hover:scale-[1.03] group"
              title="View Saved Wishlist"
            >
              <Heart className={`w-4 h-4 transition-all group-hover:scale-110 ${wishlistItems.length > 0 ? 'text-rose-500 fill-rose-500 drop-shadow-xs' : 'text-slate-600 group-hover:text-rose-500'}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Hero Shopping Trolley Button — Luminous Light Blue to Passing White Jewel Pill */}
            <button
              onClick={() => toggleCart(true)}
              className="h-10 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-500 hover:from-sky-300 hover:via-blue-500 hover:to-sky-400 text-white font-black flex items-center gap-2 sm:gap-2.5 border border-sky-400/40 shadow-xs hover:shadow-sm hover:scale-[1.03] active:scale-90 transition-all duration-200 cursor-pointer flex-shrink-0 group overflow-hidden relative"
              title="Open Shopping Trolley"
            >
              {/* Passing light gleam animation across cart button */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
              
              <div className="relative flex items-center">
                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-emerald-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="h-3.5 w-px bg-white/40 hidden xs:block" />
              <span className="text-xs sm:text-sm font-black tracking-tight text-white font-mono drop-shadow-xs">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </button>

            {/* Profile Icon — Frosted Glass with Hover Ring */}
            {!isAuthenticated ? (
              <button
                onClick={() => openLoginModal()}
                className="h-10 w-10 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 flex items-center justify-center shadow-xs active:scale-90 hover:scale-[1.03] cursor-pointer flex-shrink-0 transition-all duration-200 group"
                title="Sign in with Indian Mobile Number (+91)"
              >
                <LogIn className="w-4 h-4 text-slate-700 group-hover:text-sky-600 group-hover:scale-110 transition-all" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/profile')}
                className="h-10 w-10 rounded-xl bg-slate-100/80 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 flex items-center justify-center shadow-xs active:scale-90 hover:scale-[1.03] cursor-pointer flex-shrink-0 transition-all duration-200 group"
                title="My Profile"
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 group-hover:text-sky-600 group-hover:scale-110 transition-all" />
              </button>
            )}
          </div>
        </div>

        {/* Active Auto Navigation Indicator Banner */}
        {activeAutoNav && (
          <div className="mt-2.5 mx-auto max-w-md bg-slate-900/95 backdrop-blur-2xl text-white px-3.5 py-2 rounded-2xl border border-sky-400/40 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4 animate-pulse text-sky-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                  <span>Guiding to {activeAutoNav.product.name}</span>
                  <span className="text-[10px] bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    ₹{activeAutoNav.product.price}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 truncate">
                  Trolley moving to shelf • Will auto-place into trolley
                </div>
              </div>
            </div>
            <button
              onClick={() => cancelAutoNav()}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[10px] font-bold transition-all cursor-pointer flex-shrink-0 border border-white/15"
            >
              Cancel
            </button>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* --- Middle: Contextual Proximity Interaction Prompt --- */}
      {/* ============================================================== */}
      <ContextualPromptBanner />

      {/* ============================================================== */}
      {/* --- First-Look Prominent Mart Name (First-Time Only, Light Blue to White Theme) --- */}
      {/* ============================================================== */}
      <IntroBrandBanner />

      {/* ============================================================== */}
      {/* --- Bottom: 4-Arrow On-Screen Navigator (Only Shown When User Taps "Arrows") --- */}
      {/* ============================================================== */}
      {isNavigatorOpen && (
        <footer className="flex items-end justify-start pointer-events-none gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* On-Screen 4-Arrow Navigator (Compact Frosted Glass D-Pad) */}
          <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-2xl border border-white/20 p-2.5 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col items-center gap-1.5 select-none">
            {/* Header: Title & Close */}
            <div className="w-full flex items-center justify-between px-1 pb-1 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-sky-400 uppercase">
                <Move className="w-3 h-3 text-sky-400" />
                <span>NAVIGATOR</span>
              </div>
              <button
                onClick={() => toggleNavigator(false)}
                className="text-white/40 hover:text-white p-0.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Hide Arrows (Click 'Arrows' in top bar to reopen)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Directional Arrows Grid (Small, clean, high-precision D-Pad) */}
            <div className="grid grid-cols-3 gap-1.5 items-center justify-items-center w-28 h-28 my-0.5">
              {/* Row 1: Forward (Up Arrow) */}
              <div />
              <button
                onMouseDown={() => { martRuntime.virtualKeys.forward = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onMouseUp={() => { martRuntime.virtualKeys.forward = false; }}
                onMouseLeave={() => { martRuntime.virtualKeys.forward = false; }}
                onTouchStart={(e) => { e.preventDefault(); martRuntime.virtualKeys.forward = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onTouchEnd={() => { martRuntime.virtualKeys.forward = false; }}
                onTouchCancel={() => { martRuntime.virtualKeys.forward = false; }}
                className="w-8.5 h-8.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] active:bg-white active:text-slate-950 text-white border border-white/15 hover:border-white/30 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer backdrop-blur-md"
                title="Push Forward (Up Arrow / W)"
              >
                <ChevronUp className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div />

              {/* Row 2: Turn Left, Center Dot, Turn Right */}
              <button
                onMouseDown={() => { martRuntime.virtualKeys.left = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onMouseUp={() => { martRuntime.virtualKeys.left = false; }}
                onMouseLeave={() => { martRuntime.virtualKeys.left = false; }}
                onTouchStart={(e) => { e.preventDefault(); martRuntime.virtualKeys.left = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onTouchEnd={() => { martRuntime.virtualKeys.left = false; }}
                onTouchCancel={() => { martRuntime.virtualKeys.left = false; }}
                className="w-8.5 h-8.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] active:bg-white active:text-slate-950 text-white border border-white/15 hover:border-white/30 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer backdrop-blur-md"
                title="Move Left (Left Arrow / A)"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="w-8.5 h-8.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
              </div>

              <button
                onMouseDown={() => { martRuntime.virtualKeys.right = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onMouseUp={() => { martRuntime.virtualKeys.right = false; }}
                onMouseLeave={() => { martRuntime.virtualKeys.right = false; }}
                onTouchStart={(e) => { e.preventDefault(); martRuntime.virtualKeys.right = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onTouchEnd={() => { martRuntime.virtualKeys.right = false; }}
                onTouchCancel={() => { martRuntime.virtualKeys.right = false; }}
                className="w-8.5 h-8.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] active:bg-white active:text-slate-950 text-white border border-white/15 hover:border-white/30 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer backdrop-blur-md"
                title="Move Right (Right Arrow / D)"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Row 3: Pull Backward (Down Arrow) */}
              <div />
              <button
                onMouseDown={() => { martRuntime.virtualKeys.backward = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onMouseUp={() => { martRuntime.virtualKeys.backward = false; }}
                onMouseLeave={() => { martRuntime.virtualKeys.backward = false; }}
                onTouchStart={(e) => { e.preventDefault(); martRuntime.virtualKeys.backward = true; if (!hasMovedTrolley) setHasMovedTrolley(true); }}
                onTouchEnd={() => { martRuntime.virtualKeys.backward = false; }}
                onTouchCancel={() => { martRuntime.virtualKeys.backward = false; }}
                className="w-8.5 h-8.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] active:bg-white active:text-slate-950 text-white border border-white/15 hover:border-white/30 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer backdrop-blur-md"
                title="Pull Backward (Down Arrow / S)"
              >
                <ChevronDown className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div />
            </div>

            {/* Sub-label explaining 3 input ways */}
            <div className="text-[9px] text-white/50 font-medium tracking-tight text-center">
              Keys • Arrows • 2-Finger Scroll
            </div>
          </div>
        </footer>
      )}

      {/* ============================================================== */}
      {/* --- Floating Confirmation Toast — Dynamic Wishlist & Trolley, Best Look --- */}
      {/* ============================================================== */}
      {toast && (
        <div className="pointer-events-auto fixed top-[108px] sm:top-[118px] right-3 sm:right-6 md:right-8 z-50 animate-framer-spring">
          {(() => {
            const isWishlist =
              toast.title.toLowerCase().includes('wishlist') ||
              (toast.subtitle || '').toLowerCase().includes('wishlist');
            const isRemoved = toast.title.toLowerCase().includes('removed');
            const isOrder = toast.title.toLowerCase().includes('order');
            const isWarning = toast.type === 'warning';

            return (
              <div
                className={`w-[285px] sm:w-[310px] max-w-[calc(100vw-24px)] p-3 rounded-2xl bg-white/98 backdrop-blur-2xl border shadow-[0_12px_36px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-300 select-none ${
                  isWishlist
                    ? 'border-rose-200/90 hover:border-rose-300 hover:shadow-[0_16px_40px_rgba(244,63,94,0.14)]'
                    : isWarning
                    ? 'border-amber-200/90 hover:border-amber-300 hover:shadow-[0_16px_40px_rgba(245,158,11,0.14)]'
                    : 'border-sky-200/90 hover:border-sky-300 hover:shadow-[0_16px_40px_rgba(2,132,199,0.14)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Product Thumbnail or Dynamic Icon */}
                  {toast.imageUrl || toast.title.includes('Trolley') || isWishlist ? (
                    <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-2xs">
                      <img
                        src={toast.imageUrl || '/products/fallback.svg'}
                        alt={toast.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/fallback.svg';
                        }}
                      />
                      {isWishlist ? (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                          <Heart className="w-2.5 h-2.5 fill-white stroke-white" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-sky-500 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                        isWarning
                          ? 'bg-amber-50 text-amber-600 border border-amber-200/90'
                          : 'bg-sky-50 text-sky-600 border border-sky-200/90'
                      }`}
                    >
                      {isWarning ? (
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-600 stroke-[2.5]" />
                      ) : (
                        <CheckCircle2 className="w-4.5 h-4.5 text-sky-600 stroke-[2.5]" />
                      )}
                    </div>
                  )}

                  {/* Title, Subtitle, and Clean In Trolley / In Wishlist Pill */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-900 leading-tight tracking-tight">
                        {toast.title}
                      </span>
                      <button
                        onClick={hideToast}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-full transition-all cursor-pointer flex-shrink-0 active:scale-90 -mr-1 -mt-0.5"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {toast.subtitle && (
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 leading-snug">
                        {toast.subtitle}
                      </p>
                    )}

                    <div className="mt-1 flex items-center justify-between gap-1">
                      {isWishlist ? (
                        <>
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs ${
                              isRemoved
                                ? 'text-slate-500 bg-slate-50 border-slate-200'
                                : 'text-rose-600 bg-rose-50 border-rose-200/80'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isRemoved ? 'bg-slate-400' : 'bg-rose-500 animate-pulse'
                              }`}
                            />
                            {isRemoved ? 'Removed' : 'In Wishlist'}
                          </span>
                          <button
                            onClick={() => {
                              hideToast();
                              router.push('/wishlist');
                            }}
                            className="text-[9.5px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-0.5 group active:scale-95"
                          >
                            <span>View Wishlist</span>
                            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                          </button>
                        </>
                      ) : isOrder ? (
                        <>
                          <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Order Placed
                          </span>
                          <button
                            onClick={() => {
                              hideToast();
                              router.push('/orders');
                            }}
                            className="text-[9.5px] font-bold text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-0.5 group active:scale-95"
                          >
                            <span>View Orders</span>
                            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[9.5px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/80 flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                            In Trolley
                          </span>
                          <button
                            onClick={() => {
                              hideToast();
                              toggleCart(true);
                            }}
                            className="text-[9.5px] font-bold text-slate-400 hover:text-sky-600 transition-colors cursor-pointer flex items-center gap-0.5 group active:scale-95"
                          >
                            <span>View Cart</span>
                            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* --- Unpaid Exit Blocked Alert Modal --- */}
      {/* ============================================================== */}
      {unpaidExitAlertOpen && (
        <div className="pointer-events-auto fixed inset-0 bg-black/65 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-card border-2 border-rose-500/40 rounded-3xl max-w-md w-full shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Security RFID Barrier Locked
              </span>
              <h3 className="text-xl font-black text-white">Supermarket Exit Blocked!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have <strong className="text-white font-bold">{totalItems} unpaid item(s)</strong> in your shopping trolley (Total: ₹{totalAmount.toLocaleString('en-IN')}).
              </p>
              <p className="text-xs text-slate-400">
                Please proceed to the POS Billing Counter to scan and pay for your products before exiting.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  closeUnpaidExitAlert();
                  setPlayerPos([0, 1.5, 15], 0);
                  setCameraMode('billing');
                  startCheckout(cartItems);
                }}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Go to POS Billing Counter #02
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeUnpaidExitAlert();
                    toggleCart(true);
                  }}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all border border-white/[0.08]"
                >
                  View Trolley Items
                </button>
                <button
                  type="button"
                  onClick={closeUnpaidExitAlert}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top-Left Onboarding Hint: Tap an item, then Add to trolley */}
      <OnboardingHintBanner />

      {/* Real-time Product Hover Information Card */}
      <ProductHoverCard />

    </div>
  );
};
