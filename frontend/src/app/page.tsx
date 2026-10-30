'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SupermarketHUD } from '@/components/ui/SupermarketHUD';
import { useMartStore } from '@/store/useMartStore';
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
  const [hasEnteredStore, setHasEnteredStore] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('martverse_entered') === 'true') {
        setHasEnteredStore(true);
      }
      useAuthStore.getState().hydrateAuth();

      // Check if user is already authenticated; if not, open LoginModal so user can sign in or skip
      const isAuth = useAuthStore.getState().isAuthenticated;
      const hasSkipped = sessionStorage.getItem('martverse_login_skipped');
      if (!isAuth && !hasSkipped) {
        setTimeout(() => {
          useAuthStore.getState().openLoginModal();
        }, 500);
      }

      (window as any).__openProductModal = (prod?: any) => {
        const store = (window as any).__martStore || useMartStore.getState();
        const p = prod || store.products.find((item: any) => item.slug === 'surf-excel-easy-wash-4kg') || store.products[0];
        store.openProductModal(p);
      };
      (window as any).__martStore = useMartStore;

      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout')) {
        setHasEnteredStore(true);
        setTimeout(() => {
          useMartStore.getState().setPlayerPos([0, 1.5, 15], 0);
          useMartStore.getState().setCameraMode('billing');
          useBillingStore.getState().startCheckout(useCartStore.getState().items);
        }, 600);
      }

      if (params.get('modal')) {
        const modalQuery = params.get('modal');
        const store = useMartStore.getState();
        const target = store.products.find(
          (p) => p.slug === modalQuery || p.id === modalQuery || p.slug.includes(modalQuery || '')
        ) || store.products.find((p) => p.slug.includes('surf-excel')) || store.products[0];
        if (target) {
          setHasEnteredStore(true);
          setTimeout(() => {
            store.openProductModal(target);
          }, 300);
        }
      }
    }
  }, []);

  return (
    <main className="w-full h-screen overflow-hidden bg-[#080B11] relative">
      {/* 3D Supermarket Canvas */}
      <div className="w-full h-full absolute inset-0">
        <SupermarketScene />
      </div>

      {/* 2D Interactive HUD & Overlays */}
      <SupermarketHUD />
      <ProductModal />
      <CartDrawer />
      <BillingModal />
      <ExitModal />
      <LoginModal />
      <WishlistModal />

      {/* Welcome Walk-in Overlay for first-time entrance */}
      {!hasEnteredStore && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5 relative shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            
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

            {/* Title & 1-Line Clean Content with Smooth Blue-to-Green-to-White Animated Gradient */}
            <div className="space-y-1.5 pt-1">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                <span className="animated-gradient-heading">
                  Welcome to Martverse
                </span>
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
                <div className="text-[11px] text-black font-bold mt-0.5">Groceries & Staples</div>
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
                <div className="text-[11px] text-black font-bold mt-0.5">Fashion Studio</div>
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

            {/* High-Visibility Animated Blue-to-Green-to-White Button */}
            <button
              onClick={() => {
                sessionStorage.setItem('martverse_entered', 'true');
                setHasEnteredStore(true);
              }}
              className="w-full animated-gradient-btn py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm sm:text-base active:scale-[0.98] group cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 30%, #059669 68%, #2563eb 100%)',
                backgroundSize: '240% 240%',
                animation: 'gradient-flow 4s ease infinite',
              }}
            >
              {/* Sweeping Light Beam Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'light-sweep 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                }}
              />
              <span className="relative z-10 text-white tracking-wide font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Enter Supermarket & Grab Trolley
              </span>
              <ArrowRight className="relative z-10 w-5 h-5 text-white drop-shadow group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
