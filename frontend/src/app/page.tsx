'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { SupermarketHUD } from '@/components/ui/SupermarketHUD';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { ProductModal } from '@/components/ui/ProductModal';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { BillingModal } from '@/components/ui/BillingModal';
import { ExitModal } from '@/components/ui/ExitModal';
import { LoginModal } from '@/components/ui/LoginModal';
import { WishlistModal } from '@/components/ui/WishlistModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useBillingStore } from '@/store/useBillingStore';
import { ShoppingBag, Sparkles, Store, ArrowRight, Layers, Barcode, ShieldCheck } from 'lucide-react';
import { CinematicIntro } from '@/components/intro/CinematicIntro';
import { preloadAllShelfAssets } from '@/lib/assetPreloader';

// Dynamic import with SSR disabled for WebGL canvas
const SupermarketScene = dynamic(
  () => import('@/components/supermarket/SupermarketScene').then((mod) => mod.SupermarketScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#080B11] flex flex-col items-center justify-center space-y-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-2xl shadow-blue-500/30 ring-1 ring-white/20 animate-pulse">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-lg animate-pulse" />
        </div>
        <div className="text-center space-y-1.5">
          <div className="text-white font-bold text-base tracking-tight flex items-center justify-center gap-2">
            <span>Loading Martverse 3D Supermarket</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            </span>
          </div>
          <div className="text-xs text-slate-400">Rendering 3D physical aisles, trolley physics & inventory</div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const router = useRouter();
  const hasEnteredStore = useMartStore((state) => state.hasEnteredStore);
  const setHasEnteredStore = useMartStore((state) => state.setHasEnteredStore);
  const [isMounted, setIsMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // 1. Cinematic Intro Completed -> Show Welcome Popup Box before entering store
  const handleIntroComplete = React.useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem('martverse_intro_completed', 'true');
    localStorage.setItem('martverse_intro_completed', 'true');
    sessionStorage.setItem('martverse_entered', 'true');
    localStorage.setItem('martverse_entered', 'true');
    setShowWelcomeModal(true);
  }, []);

  // 2. User clicks "Enter Supermarket & Grab Trolley" on the popup box -> officially enters mart
  const handleEnterStore = React.useCallback(() => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('martverse_entered', 'true');
    localStorage.setItem('martverse_entered', 'true');
    sessionStorage.setItem('martverse_intro_completed', 'true');
    localStorage.setItem('martverse_intro_completed', 'true');
    setHasEnteredStore(true);
    const isAuth = useAuthStore.getState().isAuthenticated;
    const hasSkipped = sessionStorage.getItem('martverse_login_skipped');
    if (!isAuth && !hasSkipped) {
      setTimeout(() => {
        useAuthStore.getState().openLoginModal();
      }, 700);
    }
  }, [setHasEnteredStore]);

  React.useEffect(() => {
    setIsMounted(true);

    const params = new URLSearchParams(window.location.search);
    const storedTarget = sessionStorage.getItem('martverse_return_target');
    const returnTarget = params.get('return') || storedTarget;
    const hasEntered =
      sessionStorage.getItem('martverse_entered') === 'true' ||
      localStorage.getItem('martverse_entered') === 'true' ||
      localStorage.getItem('martverse_intro_completed') === 'true';
    const skipIntro =
      sessionStorage.getItem('martverse_skip_intro') === 'true' ||
      localStorage.getItem('martverse_skip_intro') === 'true';
    const isInternalReferrer =
      typeof document !== 'undefined' &&
      document.referrer &&
      (document.referrer.includes('/orders') ||
        document.referrer.includes('/cart') ||
        document.referrer.includes('/checkout') ||
        document.referrer.includes('/wishlist') ||
        document.referrer.includes('/profile'));

    if (storedTarget) {
      sessionStorage.removeItem('martverse_return_target');
    }

    useAuthStore.getState().hydrateAuth();
    useMartStore.getState().hydrateProductsFromCache();
    preloadAllShelfAssets();

    (window as any).__openProductModal = (prod?: any) => {
      const store = (window as any).__martStore || useMartStore.getState();
      const p = prod || store.products.find((item: any) => item.slug === 'surf-excel-easy-wash-4kg') || store.products[0];
      store.openProductModal(p);
    };
    (window as any).__martStore = useMartStore;
    (window as any).__replayCinematicIntro = () => {
      sessionStorage.removeItem('martverse_entered');
      localStorage.removeItem('martverse_entered');
      sessionStorage.removeItem('martverse_intro_completed');
      localStorage.removeItem('martverse_intro_completed');
      sessionStorage.removeItem('martverse_skip_intro');
      localStorage.removeItem('martverse_skip_intro');
      setHasEnteredStore(false);
      setShowIntro(true);
      setShowWelcomeModal(false);
    };

    if (returnTarget || hasEntered || skipIntro || isInternalReferrer) {
      // Navigating back from checkout, orders, or continue shopping, or on refresh:
      sessionStorage.setItem('martverse_entered', 'true');
      localStorage.setItem('martverse_entered', 'true');
      localStorage.setItem('martverse_intro_completed', 'true');
      sessionStorage.removeItem('martverse_skip_intro');
      setHasEnteredStore(true);
      setShowIntro(false);
      setShowWelcomeModal(false);

      const store = useMartStore.getState();
      useBillingStore.getState().resetBilling();
      martRuntime.billingCooldownUntil = Date.now() + 2500;

      if (returnTarget === 'billing') {
        // ONLY FROM CHECKOUT PAGE (Back to Store or Martverse Logo):
        // Placed cleanly at Billing Section in front of Lane 02 ([0, 1.5, 14.6])
        martRuntime.playerPos[0] = 0;
        martRuntime.playerPos[1] = 1.5;
        martRuntime.playerPos[2] = 14.6;
        martRuntime.playerYaw = 0;
        store.setPlayerPos([0, 1.5, 14.6], 0);
        store.setCameraMode('third_person');
        useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));
      } else {
        // ANY OTHER PAGE / CONTINUE SHOPPING AFTER ORDER:
        // Return directly to Trolley Reset Place in mart ([0, 1.5, -20]) without starting from scratch
        martRuntime.playerPos[0] = 0;
        martRuntime.playerPos[1] = 1.5;
        martRuntime.playerPos[2] = -20;
        martRuntime.playerYaw = 0;
        store.setPlayerPos([0, 1.5, -20], 0);
        store.setCameraMode('third_person');
        useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));
      }

      if (params.get('return')) {
        window.history.replaceState({}, '', '/');
      }
      return;
    }

    // Fresh visit in a brand new session with no session storage -> Play intro animation
    setHasEnteredStore(false);
    setShowIntro(true);
    setShowWelcomeModal(false);

    if (params.get('checkout')) {
      setShowIntro(false);
      setShowWelcomeModal(false);
      setHasEnteredStore(true);
      router.push('/checkout');
      return;
    }

    if (params.get('modal')) {
      const modalQuery = params.get('modal');
      const store = useMartStore.getState();
      const target = store.products.find(
        (p) => p.slug === modalQuery || p.id === modalQuery || p.slug.includes(modalQuery || '')
      ) || store.products.find((p) => p.slug.includes('surf-excel')) || store.products[0];
      if (target) {
        setShowIntro(false);
        setShowWelcomeModal(false);
        setHasEnteredStore(true);
        setTimeout(() => {
          store.openProductModal(target);
        }, 300);
      }
    }
  }, [router, setHasEnteredStore]);

  if (!isMounted) {
    return (
      <main className="w-full h-screen overflow-hidden bg-[#080B11] relative">
        <div className="w-full h-screen bg-[#080B11] flex flex-col items-center justify-center space-y-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-2xl shadow-blue-500/30 ring-1 ring-white/20 animate-pulse">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-lg animate-pulse" />
          </div>
          <div className="text-center space-y-1.5">
            <div className="text-white font-bold text-base tracking-tight flex items-center justify-center gap-2">
              <span>Loading Martverse 3D Supermarket</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              </span>
            </div>
            <div className="text-xs text-slate-400">Rendering 3D physical aisles, trolley physics & inventory</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden bg-[#080B11] relative">
      {/* Full-Screen Scroll-Driven Cinematic Opening Sequence */}
      {showIntro && (
        <CinematicIntro onComplete={handleIntroComplete} />
      )}

      {/* 3D Supermarket Application - Revealed upon intro completion */}
      <div
        className={`w-full h-full absolute inset-0 transition-opacity duration-700 ${
          !showIntro
            ? 'opacity-100 pointer-events-auto z-10'
            : 'opacity-0 pointer-events-none z-0 invisible'
        }`}
      >
        {/* 3D Supermarket Canvas */}
        <div className="w-full h-full absolute inset-0">
          <SupermarketScene isPaused={showIntro} />
        </div>

        {/* 2D Interactive HUD & Overlays */}
        <SupermarketHUD />
        <ProductModal />
        <CartDrawer />
        <BillingModal />
        <ExitModal />
        <LoginModal />
        <WishlistModal />
      </div>

      {/* Welcome Walk-in Popup Box before entering the Martverse Mart */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5 relative shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Top Navbar Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  MART<span className="text-blue-600">VERSE</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                3D Virtual Mart
              </span>
            </div>

            {/* Title & 1-Line Clean Content */}
            <div className="space-y-1.5 pt-1">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Welcome to Martverse
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto">
                Explore two floors of groceries and fashion with full 3D trolley freedom.
              </p>
            </div>

            {/* Store Highlights Grid - Floor 1, Floor 2, Billing in Crisp Luxury White Cards with Black Text */}
            <div className="grid grid-cols-3 gap-3 text-left">
              {/* Floor 1 */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">L1</span>
                </div>
                <div className="text-black font-black text-xs sm:text-sm tracking-tight">Floor 1</div>
                <div className="text-[11px] text-black font-bold mt-0.5">Groceries &amp; Staples</div>
              </div>

              {/* Floor 2 */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white flex items-center justify-center shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">L2</span>
                </div>
                <div className="text-black font-black text-xs sm:text-sm tracking-tight">Floor 2</div>
                <div className="text-[11px] text-black font-bold mt-0.5">Upper Level (Coming Soon)</div>
              </div>

              {/* POS Billing */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">POS</span>
                </div>
                <div className="text-black font-black text-xs sm:text-sm tracking-tight">POS Billing</div>
                <div className="text-[11px] text-black font-bold mt-0.5">Instant Checkout</div>
              </div>
            </div>

            {/* High-Visibility Enter Supermarket Button */}
            <button
              onClick={handleEnterStore}
              className="w-full relative overflow-hidden py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm sm:text-base active:scale-[0.98] group cursor-pointer shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 35%, #059669 70%, #2563eb 100%)',
                backgroundSize: '240% 240%',
              }}
            >
              <span className="relative z-10 text-white tracking-wide font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Enter Supermarket &amp; Grab Trolley
              </span>
              <ArrowRight className="relative z-10 w-5 h-5 text-white drop-shadow group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
