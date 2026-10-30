import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMartStore } from '@/store/useMartStore';
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
  const showToast = useMartStore((state) => state.showToast);
  const resetToOriginalState = useMartStore((state) => state.resetToOriginalState);
  const products = useMartStore((state) => state.products);
  const navigateToProduct = useMartStore((state) => state.navigateToProduct);
  const isMinimapOpen = useMartStore((state) => state.isMinimapOpen);
  const toggleMinimap = useMartStore((state) => state.toggleMinimap);

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

  // Filter products sorted Alphabetically (A to Z) - only computed when query exists
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.placement?.aisleName?.toLowerCase().includes(q)
    );
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
        <div className="glass-panel rounded-2xl px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.65)] border border-white/[0.08]">
          
          {/* Brand Identity: Gradient text blue to white */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Store className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black tracking-wider text-sm sm:text-base leading-none bg-gradient-to-r from-blue-400 via-sky-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                  MART<span className="text-white">VERSE</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3D LIVE
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden xs:block leading-tight mt-0.5">
                Virtual Hypermarket
              </p>
            </div>
          </div>

          {/* Floor Navigation Segmented Switcher (Floor 1 & Floor 2) */}
          <nav className="h-10 flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] backdrop-blur-md flex-shrink-0">
            <button
              onClick={() => setActiveFloor(1)}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFloor === 1
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="Ground Floor: Groceries & Staples"
            >
              <Layers className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Floor 1:</span>
              <span>Groceries</span>
            </button>
            <button
              onClick={() => setActiveFloor(2)}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFloor === 2
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
              title="First Floor: Fashion Studio & Apparel"
            >
              <Layers className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Floor 2:</span>
              <span>Fashion</span>
            </button>
          </nav>

          {/* Search Bar - Standardized h-10 height to match navbar controls */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-[160px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md h-10">
            <div className="relative h-10 flex items-center">
              <Search className="w-3.5 h-3.5 text-blue-400 absolute left-3 pointer-events-none" />
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
                placeholder="Search items A–Z..."
                className="w-full h-10 bg-black/40 hover:bg-black/60 focus:bg-[#070b12] text-white placeholder-slate-400 text-xs rounded-xl pl-8 sm:pl-9 pr-8 border border-white/[0.08] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-block absolute right-2.5 text-[9px] font-mono text-slate-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08] pointer-events-none">
                  /
                </kbd>
              )}
            </div>

            {/* Clean Dropdown — ONLY displayed when user has typed a search query */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 sm:left-auto sm:right-0 w-72 sm:w-80 md:w-96 bg-[#090D14]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-300">Search Results</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded-full border border-blue-500/30">
                      {filteredProducts.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Click to locate</span>
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-white/[0.04]">
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">
                      No items found matching &quot;{searchQuery}&quot;
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
                        className="w-full px-2.5 py-2 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors text-left group cursor-pointer rounded-xl"
                      >
                        {/* 1. Item Image & 2. Item Name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5 shadow-sm">
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
                          <span className="font-semibold text-white text-xs truncate group-hover:text-blue-300 transition-colors">
                            {p.name}
                          </span>
                        </div>

                        {/* 3. Amount (Price in INR) */}
                        <span className="text-xs font-bold text-emerald-400 font-mono flex-shrink-0">
                          ₹{p.price}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Utilities & User Area - All standardized to h-10 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Camera Perspective Mode (1st / 3rd Person) */}
            <button
              onClick={() =>
                setCameraMode(cameraMode === 'third_person' ? 'first_person' : 'third_person')
              }
              className="h-10 px-2.5 sm:px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              title="Toggle Camera View (1st / 3rd Person)"
            >
              {cameraMode === 'first_person' ? (
                <Eye className="w-4 h-4 text-blue-400" />
              ) : (
                <Camera className="w-4 h-4 text-slate-300" />
              )}
              <span className="hidden xl:inline font-medium">
                {cameraMode === 'first_person' ? '1st Person' : '3rd Person'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-all flex items-center justify-center cursor-pointer"
              title={isSoundMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Reset to Original State & Starting Position */}
            <button
              onClick={() => {
                resetToOriginalState();
                showToast('Position Reset', 'Returned to store entrance & original view orientation', 'info');
              }}
              className="h-10 px-2.5 sm:px-3 rounded-xl bg-white/[0.04] hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-white/[0.06] hover:border-blue-500/40 transition-all flex items-center gap-1.5 text-xs group cursor-pointer"
              title="Reset to Original State & Starting Position (Entrance)"
            >
              <RotateCcw className="w-4 h-4 text-blue-400 group-hover:-rotate-90 transition-transform duration-300" />
              <span className="hidden xl:inline font-semibold text-slate-200 group-hover:text-white">Reset</span>
            </button>

            {/* Wishlist Icon Only */}
            <button
              onClick={() => toggleWishlist(true)}
              className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 transition-all relative flex items-center justify-center cursor-pointer"
              title="View Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlistItems.length > 0 ? 'text-rose-400 fill-rose-400' : 'text-slate-300'}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#090D14] shadow-sm animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Hero Shopping Trolley Button */}
            <button
              onClick={() => toggleCart(true)}
              className="h-10 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 sm:gap-2.5 shadow-lg shadow-blue-600/30 border border-blue-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all btn-shine cursor-pointer flex-shrink-0"
              title="Open Shopping Trolley"
            >
              <div className="relative flex items-center">
                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#090D14] shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="h-3.5 w-px bg-white/20 hidden xs:block" />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </button>

            {/* Profile Icon */}
            {!isAuthenticated ? (
              <button
                onClick={() => openLoginModal()}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 hover:text-white border border-blue-500/40 transition-all flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0"
                title="Sign in with Indian Mobile Number (+91)"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/profile')}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10 hover:ring-white/20 transition-all cursor-pointer flex-shrink-0"
                title="My Profile"
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
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
      {/* ============================================================== */}
      {(promptText?.includes('Escalator') || promptText?.includes('Ride to')) && (
        <div className="fixed top-20 right-5 sm:right-8 z-40 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 text-slate-900 max-w-xs w-full transition-all">
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
        <div className="glass-panel px-7 py-3.5 rounded-3xl border border-blue-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center flex flex-col items-center gap-1.5 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/35 ring-1 ring-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
              MART<span className="text-blue-400">VERSE</span>
            </h1>
          </div>
          <p className="text-xs text-blue-200 font-semibold tracking-wide">
            3D Virtual Hypermarket
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono mt-1 bg-black/40 px-3 py-1 rounded-full border border-white/[0.08]">
            <span className="text-blue-400 font-bold">W A S D</span>
            <span className="text-slate-400">•</span>
            <span>Push Trolley to Explore</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* --- Bottom: Controls Legend & Interactive 2D Minimap --- */}
      {/* ============================================================== */}
      <footer className="flex items-end justify-between pointer-events-none gap-4">
        {/* Navigation Legend */}
        <div className="pointer-events-auto glass-panel p-3.5 rounded-2xl text-xs text-slate-300 shadow-2xl space-y-2 hidden md:block max-w-xs border border-white/[0.08]">
          <div className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Store Navigation</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="bg-white/[0.06] text-blue-300 font-mono font-bold px-1.5 py-0.5 rounded border border-white/[0.08]">
                W A S D
              </span>
              <span>Walk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-white/[0.06] text-blue-300 font-mono font-bold px-1.5 py-0.5 rounded border border-white/[0.08]">
                Mouse
              </span>
              <span>Look 360°</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-white/[0.06] text-blue-300 font-mono font-bold px-1.5 py-0.5 rounded border border-white/[0.08]">
                E
              </span>
              <span>Inspect Shelf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-white/[0.06] text-blue-300 font-mono font-bold px-1.5 py-0.5 rounded border border-white/[0.08]">
                Click
              </span>
              <span>Add Product</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* --- Floating Confirmation Toast --- */}
      {/* ============================================================== */}
      {toast && (
        <div className="pointer-events-auto fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 max-w-sm backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-white/95 border-emerald-300/80 text-slate-900 shadow-emerald-500/10'
                : toast.type === 'warning'
                ? 'bg-white/95 border-amber-300/80 text-slate-900 shadow-amber-500/10'
                : 'bg-white/95 border-blue-300/80 text-slate-900 shadow-blue-500/10'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
              {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900">{toast.title}</div>
              {toast.subtitle && (
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{toast.subtitle}</div>
              )}
            </div>

            <button
              onClick={hideToast}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
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
