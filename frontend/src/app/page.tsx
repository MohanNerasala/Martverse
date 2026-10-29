'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SupermarketHUD } from '@/components/ui/SupermarketHUD';
import { ProductModal } from '@/components/ui/ProductModal';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { BillingModal } from '@/components/ui/BillingModal';
import { ExitModal } from '@/components/ui/ExitModal';
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

            {/* Title & 1-Line Clean Content (No over matter) */}
            <div className="space-y-1.5 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome to Martverse
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-sm mx-auto">
                Explore two floors of groceries and fashion with full 3D trolley freedom.
              </p>
            </div>

            {/* Store Highlights Grid - Floor 1, Floor 2, Billing in Best Curated Colors */}
            <div className="grid grid-cols-3 gap-3 text-left">
              {/* Floor 1 */}
              <div className="bg-gradient-to-b from-blue-50/90 to-white border border-blue-100/90 hover:border-blue-300 p-3 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm shadow-blue-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-slate-900 font-bold text-xs">Floor 1</div>
                <div className="text-[11px] text-blue-700/80 font-medium mt-0.5">Groceries & Staples</div>
              </div>

              {/* Floor 2 */}
              <div className="bg-gradient-to-b from-purple-50/90 to-white border border-purple-100/90 hover:border-purple-300 p-3 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-sm shadow-purple-500/30">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-slate-900 font-bold text-xs">Floor 2</div>
                <div className="text-[11px] text-purple-700/80 font-medium mt-0.5">Fashion & Apparel</div>
              </div>

              {/* POS Billing */}
              <div className="bg-gradient-to-b from-emerald-50/90 to-white border border-emerald-100/90 hover:border-emerald-300 p-3 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm shadow-emerald-500/30">
                  <Barcode className="w-4 h-4" />
                </div>
                <div className="text-slate-900 font-bold text-xs">POS Billing</div>
                <div className="text-[11px] text-emerald-800/80 font-medium mt-0.5">Conveyor & Scanner</div>
              </div>
            </div>

            {/* Enter Button with Luxury Blue-to-White Passing Light Shimmer */}
            <button
              onClick={() => setHasEnteredStore(true)}
              className="w-full btn-blue-white-shimmer py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-extrabold active:scale-[0.98] group cursor-pointer"
            >
              <span className="shimmer-text tracking-wide">Enter Supermarket & Grab Trolley</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 group-hover:scale-110 transition-all duration-300 drop-shadow" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
