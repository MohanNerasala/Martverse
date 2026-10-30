'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useMartStore } from '@/store/useMartStore';
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
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
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

  // Exact mathematically consistent calculations matching backend
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;
  const progressPercent = Math.min(100, Math.round((subtotal / 499) * 100));

  const handleProceedToBilling = () => {
    toggleCart(false);
    // Smooth navigation to POS Billing Counter #02 (x=0, y=1.5, z=15)
    setPlayerPos([0, 1.5, 15], 0);
    setCameraMode('billing');
    startCheckout(items);
  };

  const handleOpenFullCart = () => {
    toggleCart(false);
    router.push('/cart');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm flex justify-end animate-backdrop-fade transition-opacity duration-300"
      onClick={() => toggleCart(false)}
    >
      {/* Luxury Minimalist White Drawer Panel with Restrained Color Palette & Refined Typography */}
      <div
        className="w-full max-w-[420px] bg-white border-l border-slate-100 h-full flex flex-col justify-between shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] animate-drawer-slide text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight tracking-tight">Shopping Trolley</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500 font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in trolley
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Clear all items from trolley"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => toggleCart(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer active:scale-95"
              aria-label="Close trolley drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- Refined Minimal Delivery Progress --- */}
        <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-100">
          <div className="text-xs flex items-center justify-between text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-600 flex-shrink-0" />
              {subtotal >= 499 ? (
                <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                  Free Express Delivery Unlocked
                </span>
              ) : (
                <span>
                  Add <span className="font-bold text-slate-900">₹{499 - subtotal}</span> more for{' '}
                  <span className="font-semibold text-slate-900">Free Delivery</span>
                </span>
              )}
            </div>
            {subtotal < 499 && (
              <span className="text-[11px] font-semibold text-slate-500">{progressPercent}%</span>
            )}
          </div>
          {subtotal < 499 && (
            <div className="w-full bg-slate-200/80 rounded-full h-1 overflow-hidden mt-2">
              <div
                className="bg-slate-900 h-1 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* --- Trolley Items Scrollable List --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-xs">
                <ShoppingCart className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Your Trolley is Empty</h3>
              <p className="text-xs text-slate-500 font-normal max-w-xs leading-relaxed">
                Walk through the supermarket aisles, explore the shelves, and interact with products to add them directly to your trolley.
              </p>
              <button
                onClick={() => toggleCart(false)}
                className="mt-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
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
                  className="bg-white border border-slate-200/70 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xs cart-item-card group"
                >
                  {/* Top: Product Image & Info */}
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
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
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {it.brand || 'SUPERMARKET'}
                        </span>
                        {itemSavings > 0 && (
                          <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            Save ₹{itemSavings.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 truncate" title={it.productName}>
                        {it.productName}
                      </h4>

                      {it.variantName && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded inline-block">
                          {it.size || it.variantName}
                        </span>
                      )}

                      {/* Unit Price & MRP Display */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          ₹{it.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">/ unit</span>
                        {it.mrp > it.price && (
                          <span className="text-[10px] text-slate-400 line-through font-normal ml-0.5">
                            ₹{it.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Item Amount Separate & Tactile Stepper */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    {/* Separate Item Amount Calculation */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Item Subtotal
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({it.quantity} × ₹{it.price})
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Trash Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/60">
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity - 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 select-none">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity + 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer active:scale-90"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- Bill Breakdown Footer (Accurate Calculations & Apple/Stripe Minimal Receipt Style) --- */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {/* Itemized Calculation Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Items Subtotal</span>
                <span className="text-slate-900 font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-slate-500 font-normal">
                  <span>Savings on MRP</span>
                  <span className="text-slate-700 font-semibold">- ₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 font-normal">
                <span>Delivery Charges</span>
                {deliveryFee === 0 ? (
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="line-through text-slate-400 text-[11px] font-normal">₹40</span>
                    <span className="text-slate-900">FREE</span>
                  </span>
                ) : (
                  <span className="text-slate-900 font-semibold">₹40</span>
                )}
              </div>

              <div className="flex justify-between text-slate-400 font-normal">
                <span>Taxes & Duties (GST)</span>
                <span className="text-slate-500 font-medium">Included in Price</span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                <div>
                  <span className="text-sm font-bold text-slate-900 block leading-tight">Total Payable</span>
                  <span className="text-[10px] text-slate-400 font-normal">Matches POS billing counter</span>
                </div>
                <span className="text-slate-900 text-xl font-bold tracking-tight">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CTAs: Full Cart Page Link & POS Counter Checkout */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenFullCart}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer active:scale-[0.98]"
              >
                <span>View Full Cart Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={handleProceedToBilling}
                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer group btn-shine"
              >
                <CreditCard className="w-4 h-4 text-slate-300" />
                <span>Go to Billing Counter</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Express automated scanning at Lane 02</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
