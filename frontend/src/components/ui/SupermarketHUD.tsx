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
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  CreditCard,
  ShieldAlert,
  Store,
  ArrowRight,
  ArrowUpDown,
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

export const SupermarketHUD: React.FC = () => {
  const router = useRouter();
  const activeFloor = useMartStore((state) => state.activeFloor);
  const setActiveFloor = useMartStore((state) => state.setActiveFloor);
  const isSoundMuted = useMartStore((state) => state.isSoundMuted);
  const toggleSound = useMartStore((state) => state.toggleSound);
  const cameraMode = useMartStore((state) => state.cameraMode);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const promptText = useMartStore((state) => state.promptText);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const hasMovedTrolley = useMartStore((state) => state.hasMovedTrolley);
  const setHasMovedTrolley = useMartStore((state) => state.setHasMovedTrolley);
  const showToast = useMartStore((state) => state.showToast);
  const resetToOriginalState = useMartStore((state) => state.resetToOriginalState);
  const products = useMartStore((state) => state.products);
  const navigateToProduct = useMartStore((state) => state.navigateToProduct);
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
                showToast('Martverse Entrance', 'Returned to virtual hypermarket lobby', 'info');
              }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 border border-white/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden group shadow-xs"
              title="Martverse Home / Entrance"
            >
              <Store className="w-5 h-5 text-white stroke-[2.2] drop-shadow-xs transition-transform group-hover:scale-110" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-passing-shimmer font-black tracking-tight text-sm sm:text-base leading-none">
                  MARTVERSE
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[9px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-200/90 shadow-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
                  </span>
                  3D LIVE
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-sky-600/80 font-bold hidden xs:block leading-tight mt-0.5 tracking-wide">
                Virtual Hypermarket
              </p>
            </div>
          </div>

          {/* Floor Navigation Segmented Switcher — High-Contrast Capsule on White */}
          <nav className="h-10 flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shadow-inner gap-1">
            <button
              onClick={() => {
                if (activeFloor !== 1) {
                  setPlayerPos([14.7, 1.5, -9.2], 0);
                  setActiveFloor(1);
                  showToast('Ground Floor', 'Welcome to Daily Groceries & Staples', 'info');
                }
              }}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 hover:scale-[1.02] ${
                activeFloor === 1
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 text-white shadow-xs border border-sky-400/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              title="Ground Floor: Groceries & Staples"
            >
              <Layers className={`w-3.5 h-3.5 ${activeFloor === 1 ? 'text-white' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Floor 1:</span>
              <span>Groceries</span>
            </button>
            <button
              onClick={() => {
                if (activeFloor !== 2) {
                  setPlayerPos([14.7, 6.5, 6.2], 0);
                  setActiveFloor(2);
                  showToast('2nd Floor', 'Welcome to Fashion Studio & Apparel', 'info');
                }
              }}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 hover:scale-[1.02] ${
                activeFloor === 2
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 text-white shadow-xs border border-sky-400/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
              title="First Floor: Fashion Studio & Apparel"
            >
              <Layers className={`w-3.5 h-3.5 ${activeFloor === 2 ? 'text-white' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Floor 2:</span>
              <span>Fashion</span>
            </button>
          </nav>

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
                      <button
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigateToProduct(p);
                        }}
                        className="w-full px-2.5 py-2 flex items-center justify-between gap-3 hover:bg-sky-50/80 hover:translate-x-0.5 transition-all duration-150 text-left group cursor-pointer rounded-xl"
                      >
                        {/* 1. Item Image & 2. Item Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
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
                          <span className="font-semibold text-slate-800 text-xs truncate group-hover:text-sky-600 transition-colors">
                            {p.name}
                          </span>
                        </div>

                        {/* 3. Amount (Price in INR) */}
                        <span className="text-xs font-bold text-emerald-600 font-mono flex-shrink-0">
                          ₹{p.price}
                        </span>
                      </button>
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
              <span className="hidden xl:inline font-semibold">
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
                showToast('Position Reset', 'Returned to store entrance & original view orientation', 'info');
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
      </header>

      {/* ============================================================== */}
      {/* --- Middle: Contextual Proximity Interaction Prompt --- */}
      {/* ============================================================== */}
      <div className="flex justify-center">
        {promptText && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl flex items-center gap-3 border border-slate-700/80 text-white transition-all">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">{promptText}</span>
            <kbd className="bg-white/10 border border-white/20 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-md shadow-inner">
              E
            </kbd>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* --- Escalator Options: Clean White Card with High-End Styling --- */}
      {/* Positioned comfortably below navbar toasts to prevent overlapping */}
      {/* ============================================================== */}
      {(promptText?.includes('Escalator') || promptText?.includes('Ride to')) && (
        <div className="fixed top-36 sm:top-40 right-5 sm:right-8 z-40 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 text-slate-900 max-w-xs w-full transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-slate-900 tracking-tight block">
                  Store Escalator & Floors
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {activeFloor === 2 ? 'Currently on Floor 2' : 'Currently on Ground Floor'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Walkway
            </span>
          </div>

          <div className="space-y-2 text-left">
            {/* Option 1: 2nd Floor (Fashion Studio & Apparel) */}
            <button
              type="button"
              onClick={() => {
                setPlayerPos([14.7, 6.5, 6.2], 0);
                setActiveFloor(2);
                showToast('2nd Floor Reached', 'Exploring Fashion Studio & Apparel', 'success');
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group flex items-center justify-between cursor-pointer ${
                activeFloor === 2
                  ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30'
                  : 'bg-white hover:bg-blue-50/50 border-slate-200 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                  <span>↑ 2nd Floor • Fashion Studio</span>
                  {activeFloor === 2 ? (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">Current</span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">L2</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Kurtas, Ethnic, Western & Denim
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
                activeFloor === 2
                  ? 'text-blue-600'
                  : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1'
              }`} />
            </button>

            {/* Option 2: Ground Floor (Groceries, Staples & POS) */}
            <button
              type="button"
              onClick={() => {
                setPlayerPos([14.7, 1.5, -9.2], 0);
                setActiveFloor(1);
                showToast('Ground Floor Reached', 'Exploring Daily Groceries & POS Billing', 'success');
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group flex items-center justify-between cursor-pointer ${
                activeFloor === 1
                  ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30'
                  : 'bg-white hover:bg-blue-50/50 border-slate-200 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                  <span>↓ Ground Floor • Groceries & POS</span>
                  {activeFloor === 1 ? (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">Current</span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">L1</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Groceries, Snacks & Billing Counters
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
                activeFloor === 1
                  ? 'text-blue-600'
                  : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="text-[10px] text-slate-400 font-medium text-center mt-2.5 pt-2 border-t border-slate-100">
            Walk onto moving ramp or click a floor to glide
          </div>
        </div>
      )}
      {/* --- First-Look Prominent Mart Name (Hides when moving trolley) --- */}
      {/* ============================================================== */}
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-all duration-700 ease-out transform ${
          hasMovedTrolley
            ? 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="bg-slate-950/60 px-7 py-3.5 rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.25)] text-center flex flex-col items-center gap-1.5 backdrop-blur-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
              MART<span className="text-white/60">VERSE</span>
            </h1>
          </div>
          <p className="text-xs text-white/70 font-semibold tracking-wide">
            3D Virtual Hypermarket
          </p>
          <div className="flex items-center gap-2 text-[11px] text-white/80 font-mono mt-1 bg-white/[0.08] px-3.5 py-1 rounded-full border border-white/15 backdrop-blur-md">
            <span className="text-white font-bold">W A S D</span>
            <span className="text-white/40">•</span>
            <span>Push Trolley to Explore</span>
          </div>
        </div>
      </div>

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
      {/* --- Floating Confirmation Toast (Moved Down with Best Look Small Box) --- */}
      {/* ============================================================== */}
      {toast && (
        <div className="pointer-events-auto fixed top-[118px] sm:top-[128px] right-3 sm:right-6 md:right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300 ease-out">
          <div
            className={`relative overflow-hidden px-3.5 py-3 rounded-2xl border flex items-center gap-3.5 max-w-[330px] sm:max-w-[370px] bg-white/95 backdrop-blur-2xl shadow-[0_20px_45px_rgba(15,23,42,0.15),0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] transition-all ${
              toast.type === 'success'
                ? 'border-emerald-300/90 ring-1 ring-emerald-400/20'
                : toast.type === 'warning'
                ? 'border-amber-300/90 ring-1 ring-amber-400/20'
                : 'border-sky-300/90 ring-1 ring-sky-400/20'
            }`}
          >
            {/* Visual Thumbnail: Best-Look Small Product Box Image or Dynamic Icon */}
            {toast.imageUrl || toast.title.includes('Trolley') ? (
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/90 flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden shadow-xs">
                <img
                  src={toast.imageUrl || '/products/fallback.svg'}
                  alt={toast.title}
                  className="w-full h-full object-contain drop-shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/products/fallback.svg';
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                  toast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/90'
                    : toast.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200/90'
                    : 'bg-sky-50 text-sky-600 border border-sky-200/90'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 stroke-[2.5]" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-sky-600 stroke-[2.5]" />}
              </div>
            )}

            {/* Toast Title & Subtitle in Clean Hierarchy */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 leading-tight tracking-tight">
                  {toast.title}
                </span>
                {toast.type === 'success' && (
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 leading-none">
                    In Trolley
                  </span>
                )}
              </div>
              {toast.subtitle && (
                <div className="text-[11px] text-slate-600 font-semibold truncate mt-0.5 leading-tight">
                  {toast.subtitle}
                </div>
              )}
            </div>

            {/* Quick Dismiss Button */}
            <button
              onClick={hideToast}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 active:scale-90"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Top Accent Micro-Indicator Bar */}
            <div
              className={`absolute top-0 left-3 right-3 h-[2px] rounded-full ${
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400'
                  : toast.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-500'
              }`}
            />
          </div>
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

      {/* Real-time Product Hover Information Card */}
      <ProductHoverCard />

    </div>
  );
};
