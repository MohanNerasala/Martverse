'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { useBillingStore } from '@/store/useBillingStore';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const discountTotal = useCartStore((state) => state.discountTotal);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const startCheckout = useBillingStore((state) => state.startCheckout);

  if (!isCartOpen) return null;

  // Exact calculations aligned with backend
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;
  const progressPercent = Math.min(100, Math.round((subtotal / 499) * 100));

  const handleProceedToBilling = () => {
    toggleCart(false);

    // If currently in the 3D supermarket scene (at '/'), instantly teleport to Lane 02 Billing Counter and start checkout
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      martRuntime.playerPos[0] = 0;
      martRuntime.playerPos[1] = 1.5;
      martRuntime.playerPos[2] = 16.0;
      martRuntime.playerYaw = 0;
      martRuntime.billingCooldownUntil = 0;
      setPlayerPos([0, 1.5, 16.0], 0);
      setCameraMode('billing');
      useMartStore.setState((state) => ({ teleportTrigger: state.teleportTrigger + 1 }));

      if (items.length > 0) {
        startCheckout(items);
      }
    } else {
      // If opened from another page (e.g. /cart, /wishlist), navigate to mart with return=billing
      martRuntime.playerPos[0] = 0;
      martRuntime.playerPos[1] = 1.5;
      martRuntime.playerPos[2] = 14.6;
      martRuntime.playerYaw = 0;
      useMartStore.getState().setHasEnteredStore(true);
      useMartStore.getState().setPlayerPos([0, 1.5, 14.6], 0);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('martverse_entered', 'true');
        sessionStorage.setItem('martverse_skip_intro', 'true');
        sessionStorage.setItem('martverse_return_target', 'billing');
        localStorage.setItem('martverse_entered', 'true');
        localStorage.setItem('martverse_intro_completed', 'true');
        localStorage.setItem('martverse_skip_intro', 'true');
      }
      router.replace('/?return=billing');
    }
  };

  const handleOpenFullCart = () => {
    toggleCart(false);
    router.push('/cart');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/65 flex justify-end animate-backdrop-fade"
      onClick={() => toggleCart(false)}
    >
      {/* High-Performance Smooth Drawer Panel */}
      <div
        className="w-full max-w-[440px] bg-white border-l border-slate-200/90 h-full flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.35)] animate-drawer-slide text-slate-900 select-none relative"
        style={{ willChange: 'transform' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
                  Shopping Trolley
                </h2>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                3D Supermarket Live Trolley Cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-rose-600 font-bold px-2.5 py-1 rounded-xl hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
                title="Clear all items from trolley"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleCart(false)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer active:scale-90 border border-slate-200/80"
              aria-label="Close trolley drawer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* --- Delivery Progress Capsule --- */}
        <div className="flex-shrink-0 bg-slate-50/90 px-4 sm:px-6 py-3 border-b border-slate-100">
          <div className="text-xs flex items-center justify-between text-slate-700 font-semibold">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              {subtotal >= 499 ? (
                <span className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Free Express Delivery Unlocked!
                </span>
              ) : (
                <span>
                  Add <strong className="text-slate-900 font-black">₹{499 - subtotal}</strong> more for{' '}
                  <strong className="text-blue-600 font-black">Free Delivery</strong>
                </span>
              )}
            </div>
            {subtotal < 499 && (
              <span className="text-[11px] font-black text-slate-500 font-mono">{progressPercent}%</span>
            )}
          </div>
          {subtotal < 499 && (
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 h-1.5 rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* --- Trolley Items Scrollable List (Ultra-Smooth 60FPS / 120FPS with GPU Accelerated Scrolling) --- */}
        <div
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 bg-slate-50/70 pb-36 light-scrollbar scroll-smooth"
          style={{
            overscrollBehaviorY: 'contain',
            WebkitOverflowScrolling: 'touch',
            transform: 'translateZ(0)',
            willChange: 'scroll-position',
            contain: 'content',
          }}
        >
          {items.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-sm">
                <ShoppingCart className="w-8 h-8 text-slate-300 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Your Trolley is Empty</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Walk through the supermarket aisles, explore the shelves, and click products to add them directly to your trolley.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleCart(false)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-500/20"
              >
                Explore Supermarket Aisles
              </button>
            </div>
          ) : (
            items.map((it) => {
              const itemTotal = it.price * it.quantity;
              const itemSavings = (it.mrp > it.price ? it.mrp - it.price : 0) * it.quantity;

              return (
                <div
                  key={it.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xs hover:shadow-md hover:border-blue-300/80 transition-[border-color,box-shadow,transform] duration-150 group"
                  style={{
                    transform: 'translateZ(0)',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '0 120px',
                  }}
                >
                  {/* Top: Product Image & Info */}
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-center p-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                      <img
                        src={it.productImage || '/products/fallback.svg'}
                        alt={it.productName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/fallback.svg';
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          {it.brand || 'MARTVERSE'}
                        </span>
                        {itemSavings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0">
                            Save ₹{itemSavings.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h4
                        className="text-xs font-bold text-slate-900 leading-snug line-clamp-2"
                        title={it.productName}
                      >
                        {it.productName}
                      </h4>

                      {it.variantName && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md inline-block">
                          {it.size || it.variantName}
                        </span>
                      )}

                      {/* Unit Price & MRP Display */}
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                          ₹{it.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">/ unit</span>
                        {it.mrp > it.price && (
                          <span className="text-[10px] text-slate-400 line-through font-mono ml-0.5">
                            ₹{it.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Item Subtotal & Tactile Stepper Controls */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    {/* Separate Item Amount Calculation */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Item Subtotal
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({it.quantity} × ₹{it.price})
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Trash Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(it.id, it.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs border border-slate-200/60"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono font-black text-xs text-slate-900 select-none">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(it.id, it.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs border border-slate-200/60"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="w-7 h-7 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- Bill Breakdown Footer (Crisp, High-Contrast Luxury Checkout Dock) --- */}
        {items.length > 0 && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-slate-200/80 space-y-3.5 shadow-[0_-10px_30px_rgba(0,0,0,0.07)] z-20">
            {/* Itemized Calculation Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Items Subtotal:</span>
                <span className="text-slate-900 font-bold font-mono">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Savings on MRP:</span>
                  </span>
                  <span className="font-mono font-bold">- ₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 font-medium">
                <span>Delivery Charges:</span>
                {deliveryFee === 0 ? (
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="line-through text-slate-400 text-[11px] font-normal">₹40</span>
                    <span className="text-emerald-700 font-black">FREE</span>
                  </span>
                ) : (
                  <span className="text-slate-900 font-bold font-mono">₹40</span>
                )}
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Taxes & Duties (GST):</span>
                <span className="text-slate-500 font-medium">Included in Price</span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-100">
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-tight">
                    Total Payable
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Matches POS billing counter
                  </span>
                </div>
                <span className="text-slate-900 text-xl sm:text-2xl font-black font-mono tracking-tight">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CTAs: Interactive Luxury Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Button 1: View Full Cart Page (Distinctive, Clickable Luxury Pill) */}
              <button
                type="button"
                onClick={handleOpenFullCart}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 hover:from-sky-100 hover:via-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 border-2 border-blue-200/90 hover:border-blue-400 font-black text-xs shadow-xs hover:shadow-md flex items-center justify-between transition-all duration-200 active:scale-95 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <span className="tracking-wide">View Full Cart Page</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    {totalItems} items
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Button 2: Go to Billing Section */}
              <button
                type="button"
                onClick={handleProceedToBilling}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-600 text-white font-black text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer group btn-shine"
                title="Go directly to POS Billing Counter (Lane 02)"
              >
                <CreditCard className="w-4.5 h-4.5 text-sky-200 group-hover:scale-110 transition-transform" />
                <span>Go to Billing Section</span>
                <ArrowRight className="w-4.5 h-4.5 text-sky-200 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Express automated scanning at Lane 02</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
