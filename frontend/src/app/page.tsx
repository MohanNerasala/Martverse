'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
import { CinematicIntro } from '@/components/intro/CinematicIntro';

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
  const [hasEnteredStore, setHasEnteredStore] = useState(false);

  const handleIntroComplete = React.useCallback(() => {
    sessionStorage.setItem('martverse_entered', 'true');
    setHasEnteredStore(true);
    const isAuth = useAuthStore.getState().isAuthenticated;
    const hasSkipped = sessionStorage.getItem('martverse_login_skipped');
    if (!isAuth && !hasSkipped) {
      setTimeout(() => {
        useAuthStore.getState().openLoginModal();
      }, 700);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const forceIntro = params.get('intro') === 'true' || params.get('intro') === '1' || params.get('cinematic') === '1';

      if (forceIntro) {
        sessionStorage.removeItem('martverse_entered');
        setHasEnteredStore(false);
      } else if (sessionStorage.getItem('martverse_entered') === 'true') {
        setHasEnteredStore(true);
      }

      useAuthStore.getState().hydrateAuth();

      // Check if user is already authenticated; only prompt if store was already entered
      const isAuth = useAuthStore.getState().isAuthenticated;
      const hasSkipped = sessionStorage.getItem('martverse_login_skipped');
      const alreadyEntered = sessionStorage.getItem('martverse_entered') === 'true' && !forceIntro;
      if (!isAuth && !hasSkipped && alreadyEntered) {
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
      (window as any).__replayCinematicIntro = () => {
        sessionStorage.removeItem('martverse_entered');
        setHasEnteredStore(false);
      };

      if (params.get('checkout')) {
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
          setHasEnteredStore(true);
          setTimeout(() => {
            store.openProductModal(target);
          }, 300);
        }
      }
    }
  }, [router]);

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

      {/* Full-Screen Scroll-Driven Cinematic Opening Sequence */}
      {!hasEnteredStore && (
        <CinematicIntro onComplete={handleIntroComplete} />
      )}
    </main>
  );
}
