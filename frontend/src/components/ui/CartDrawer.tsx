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
  Sparkles,
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      {/* Luxury Pure White Drawer Panel with Crisp Typography & Calibrated Transitions */}
      <div className="w-full max-w-md bg-white border-l border-slate-200/90 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 ease-out text-slate-900">
        
        {/* --- Header --- */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight tracking-tight">Shopping Trolley</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-500 font-bold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in trolley
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[11px] text-blue-600 font-bold">Floor 1 & 2 Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
                title="Clear all items from trolley"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => toggleCart(false)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition-all flex items-center justify-center border border-slate-200/80 cursor-pointer shadow-xs active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- Free Express Delivery Progress Bar --- */}
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 px-5 py-3 border-b border-emerald-100 space-y-1.5">
          <div className="text-xs flex items-center justify-between text-slate-900 font-bold">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {subtotal >= 499 ? (
                <span className="text-emerald-800 font-black">
                  🎉 FREE Express Delivery Unlocked!
                </span>
              ) : (
                <span>
                  Add <strong className="text-slate-900 font-black">₹{499 - subtotal}</strong> more for{' '}
                  <strong className="text-emerald-700 font-black">FREE Delivery</strong>
                </span>
              )}
            </div>
            {subtotal < 499 && (
              <span className="text-[11px] font-black text-emerald-700">{progressPercent}%</span>
            )}
          </div>
          {subtotal < 499 && (
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300 animate-sheen"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* --- Trolley Items Scrollable List --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <ShoppingCart className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-black text-slate-900">Your Trolley is Empty</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Walk through the supermarket aisles, explore the shelves, and interact with products to add them directly to your trolley.
              </p>
              <button
                onClick={() => toggleCart(false)}
                className="mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
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
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-blue-200/80 transition-all duration-200 group"
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
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                          {it.brand || 'SUPERMARKET'}
                        </span>
                        {itemSavings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
                            Save ₹{itemSavings.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-slate-900 truncate" title={it.productName}>
                        {it.productName}
                      </h4>

                      {it.variantName && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200/60 inline-block">
                          {it.size || it.variantName}
                        </span>
                      )}

                      {/* Unit Price & MRP Display */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          ₹{it.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">/ unit</span>
                        {it.mrp > it.price && (
                          <span className="text-[10px] text-slate-400 line-through font-medium ml-1">
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Item Subtotal
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({it.quantity} × ₹{it.price})
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Trash Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity - 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-900 select-none">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity + 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-90"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
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

        {/* --- Bill Breakdown Footer (Accurate Calculations) --- */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3 shadow-lg">
            {discountTotal > 0 && (
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800 font-black">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Martverse Savings on MRP</span>
                </div>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-black">
                  - ₹{discountTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Itemized Calculation Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Items Subtotal:</span>
                <span className="text-slate-900 font-black">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Discount Savings:</span>
                  <span>- ₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 font-medium">
                <span>Delivery Charges:</span>
                {deliveryFee === 0 ? (
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="line-through text-slate-400 text-[11px]">₹40</span>
                    <span className="text-emerald-700 font-black">FREE</span>
                  </span>
                ) : (
                  <span className="text-slate-900 font-bold">₹40</span>
                )}
              </div>

              <div className="flex justify-between text-slate-500 font-medium">
                <span>Taxes & Duties (GST):</span>
                <span className="text-slate-700 font-semibold">Included in Price (₹0 extra)</span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200">
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-tight">Total Payable</span>
                  <span className="text-[10px] text-slate-400 font-medium">Matches POS billing counter</span>
                </div>
                <span className="text-blue-600 text-lg sm:text-xl font-black">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CTAs: Full Cart Page Link & POS Counter Checkout */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenFullCart}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer active:scale-[0.98] shadow-2xs"
              >
                <span>View Full Cart Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={handleProceedToBilling}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all text-sm cursor-pointer border border-blue-400/30"
              >
                <CreditCard className="w-4 h-4" />
                <span>Go to Billing Counter</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
