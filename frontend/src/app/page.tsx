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
        <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-8 text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Ambient specular background glows */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Brand Logo Badge */}
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-1 ring-white/20">
                <Store className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0B0F17]" />
              </span>
            </div>

            {/* Titles & Description */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen 3D Virtual Supermarket</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to Martverse
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-md mx-auto">
                Step inside our two-floor virtual store modeled after DMart and BigBasket. Walk through grocery aisles, ride the escalator to the fashion floor, steer your trolley, and checkout at the express billing counter!
              </p>
            </div>

            {/* Store Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-left">
              <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] p-3 rounded-2xl transition-all">
                <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center mb-1.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-white font-bold text-xs">Floor 1</div>
                <div className="text-[10px] text-slate-400">Groceries & Staples</div>
              </div>

              <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] p-3 rounded-2xl transition-all">
                <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="text-white font-bold text-xs">Floor 2</div>
                <div className="text-[10px] text-slate-400">Fashion & Apparel</div>
              </div>

              <div className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] p-3 rounded-2xl transition-all">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1.5">
                  <Barcode className="w-3.5 h-3.5" />
                </div>
                <div className="text-white font-bold text-xs">POS Billing</div>
                <div className="text-[10px] text-slate-400">Conveyor & Scanner</div>
              </div>
            </div>

            {/* Enter Button */}
            <button
              onClick={() => setHasEnteredStore(true)}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 border border-blue-400/30 text-sm active:scale-[0.98] transition-all btn-shine group"
            >
              <span>Enter Supermarket & Grab Trolley</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
