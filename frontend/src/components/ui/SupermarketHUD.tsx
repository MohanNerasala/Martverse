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

  // Filter products sorted Alphabetically (A to Z)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
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
        setIsSearchOpen(true);
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
          <nav className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.06] backdrop-blur-md flex-shrink-0">
            <button
              onClick={() => setActiveFloor(1)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
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

          {/* Search Bar with A-Z Auto-Navigation */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-[160px] xs:max-w-[190px] md:max-w-xs lg:max-w-sm">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 sm:left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search items A–Z (e.g. Maggi)..."
                className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#070b12] text-white placeholder-slate-400 text-xs rounded-xl pl-7 sm:pl-8 pr-7 py-2 border border-white/[0.08] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-block absolute right-2 text-[9px] font-mono text-slate-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
                  /
                </kbd>
              )}
            </div>

            {/* A-Z Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#090D14]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 overflow-hidden max-h-96 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 w-72 sm:w-88 md:w-96">
                <div className="p-3 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-300">Catalog (Alphabetical A–Z)</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded-full border border-blue-500/30">
                      {filteredProducts.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden xs:inline">Click item to go to shelf</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
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
                        className="w-full p-2.5 flex items-center justify-between gap-2.5 hover:bg-white/[0.06] transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white border border-white/[0.08] overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/products/fallback.svg';
                                }}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-sm">🛍️</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs truncate group-hover:text-blue-300 transition-colors">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                              <span className="text-emerald-400 font-extrabold">₹{p.price}</span>
                              {p.placement && (
                                <span className="bg-white/[0.06] px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-medium">
                                  F{p.placement.floorNumber} • {p.placement.aisleName || `Aisle ${p.placement.aisleNumber}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-blue-400 font-bold group-hover:translate-x-1 transition-transform flex-shrink-0">
                          <span>Go</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Utilities & User Area */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Camera Perspective Mode (1st / 3rd Person) */}
            <button
              onClick={() =>
                setCameraMode(cameraMode === 'third_person' ? 'first_person' : 'third_person')
              }
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-all flex items-center gap-1.5 text-xs cursor-pointer"
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
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer"
              title={isSoundMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isSoundMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Reset to Original State & Starting Position (No question mark!) */}
            <button
              onClick={() => {
                resetToOriginalState();
                showToast('Position Reset', 'Returned to store entrance & original view orientation', 'info');
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-white/[0.06] hover:border-blue-500/40 transition-all flex items-center gap-1.5 text-xs group cursor-pointer"
              title="Reset to Original State & Starting Position (Entrance)"
            >
              <RotateCcw className="w-4 h-4 text-blue-400 group-hover:-rotate-90 transition-transform duration-300" />
              <span className="hidden xl:inline font-semibold text-slate-200 group-hover:text-white">Reset</span>
            </button>

            {/* Wishlist Icon Only (no text label) */}
            <button
              onClick={() => toggleWishlist(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 transition-all relative cursor-pointer"
              title="View Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlistItems.length > 0 ? 'text-rose-400 fill-rose-400' : 'text-slate-300'}`} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#090D14] shadow-sm animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Hero Shopping Trolley Button (Cart comes BEFORE profile) */}
            <button
              onClick={() => toggleCart(true)}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 sm:gap-2.5 shadow-lg shadow-blue-600/30 border border-blue-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all btn-shine cursor-pointer flex-shrink-0"
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

            {/* Profile Icon — tapping opens /profile page (no dropdown, no phone number shown) */}
            {!isAuthenticated ? (
              <button
                onClick={() => openLoginModal()}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 hover:text-white border border-blue-500/40 transition-all cursor-pointer shadow-sm"
                title="Sign in with Indian Mobile Number (+91)"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/profile')}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10 hover:ring-white/20 transition-all cursor-pointer flex-shrink-0"
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
          <div className="pointer-events-auto glass-card px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-blue-500/40 text-white animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">{promptText}</span>
            <kbd className="bg-blue-950/80 border border-blue-500/50 text-blue-300 text-xs font-mono font-bold px-2 py-0.5 rounded-md shadow-inner">
              E
            </kbd>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* --- Escalator Options: White Board with Black Text --- */}
      {/* ============================================================== */}
      {(promptText?.includes('Escalator') || promptText?.includes('Ride to')) && (
        <div className="fixed top-24 right-5 sm:right-8 z-40 pointer-events-auto bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200 text-slate-900 max-w-xs w-full animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                ↕
              </div>
              <span className="font-extrabold text-xs text-slate-900 tracking-tight">
                ESCALATOR NAVIGATION
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Auto-Glide
            </span>
          </div>

          <div className="space-y-2 text-left">
            {/* Option 1: 2nd Floor (Fashion Studio & Apparel) */}
            <button
              onClick={() => {
                setPlayerPos([14.7, 6.5, 6.2], 0);
                setActiveFloor(2);
                showToast('2nd Floor Reached', 'Exploring Fashion Studio & Apparel', 'success');
              }}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 bg-slate-50/60 hover:bg-purple-50/70 transition-all duration-200 group flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-900 group-hover:text-purple-700 flex items-center gap-1.5">
                  <span>↑ Option 1: 2nd Floor</span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded">L2</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Fashion Studio, Kurtas & Denim
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Option 2: Ground Floor (Groceries, Staples & POS) */}
            <button
              onClick={() => {
                setPlayerPos([14.7, 1.5, -8.0], Math.PI);
                setActiveFloor(1);
                showToast('Ground Floor Reached', 'Exploring Daily Groceries & POS Billing', 'success');
              }}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/70 transition-all duration-200 group flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                  <span>↓ Option 2: Ground Floor</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">L1</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Groceries, Staples & POS Billing
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="text-[10px] text-slate-500 text-center mt-2 pt-2 border-t border-slate-100">
            Step onto the ramp to glide automatically
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
        <div className="pointer-events-auto fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-sm backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-[#0B0F17]/95 border-emerald-500/40 text-white'
                : toast.type === 'warning'
                ? 'bg-[#0B0F17]/95 border-amber-500/40 text-white'
                : 'bg-[#0B0F17]/95 border-blue-500/40 text-white'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : toast.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white">{toast.title}</div>
              {toast.subtitle && (
                <div className="text-[11px] text-slate-300 truncate mt-0.5">{toast.subtitle}</div>
              )}
            </div>

            <button
              onClick={hideToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
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
