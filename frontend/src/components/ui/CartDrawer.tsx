'use client';

import React from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const discountTotal = useCartStore((state) => state.discountTotal);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const startCheckout = useBillingStore((state) => state.startCheckout);

  if (!isCartOpen) return null;

  const handleProceedToBilling = () => {
    toggleCart(false);
    // Move player smoothly to POS Billing Counter #02 (x=0, y=1.5, z=15)
    setPlayerPos([0, 1.5, 15], 0);
    setCameraMode('billing');
    startCheckout(items);
  };

  const handleOpenFullCart = () => {
    toggleCart(false);
    router.push('/cart');
  };

  const progressPercent = Math.min(100, Math.round((subtotal / 499) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Luxury Pure White Drawer Panel with Crisp Black Typography */}
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">Shopping Trolley</h2>
              <p className="text-xs text-slate-500 font-bold">{totalItems} items picked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-black hover:underline px-2 py-1 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => toggleCart(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition-all border border-slate-200 cursor-pointer shadow-sm active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar with Progress Meter */}
        <div className="bg-emerald-50/90 px-5 py-3 border-b border-emerald-100/90 space-y-1.5">
          <div className="text-xs flex items-center gap-2 text-slate-900 font-bold">
            <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {subtotal >= 499 ? (
              <span className="text-emerald-800 font-black">
                🎉 Congratulations! You have unlocked FREE Express Delivery!
              </span>
            ) : (
              <span>
                Add <strong className="text-black font-black">₹{499 - subtotal}</strong> more for{' '}
                <strong className="text-emerald-700 font-black">FREE Delivery</strong>
              </span>
            )}
          </div>
          {subtotal < 499 && (
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">Your Trolley is Empty</h3>
              <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed">
                Walk through the supermarket aisles, explore the shelves, and press [E] on any product to add it to your trolley.
              </p>
              <button
                onClick={() => toggleCart(false)}
                className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                Explore Supermarket
              </button>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 flex gap-3.5 items-center transition-all shadow-sm"
              >
                <img
                  src={it.productImage || '/products/fallback.svg'}
                  alt={it.productName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/products/fallback.svg';
                  }}
                  className="w-16 h-16 rounded-xl object-contain p-1 bg-white border border-slate-200 shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-wide block">
                    {it.brand}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 truncate">{it.productName}</h4>
                  {it.variantName && (
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded mr-1 inline-block mt-0.5">
                      {it.size || it.variantName}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xs font-black text-slate-900">
                      ₹{it.price.toLocaleString('en-IN')}
                    </span>
                    {it.mrp > it.price && (
                      <span className="text-[10px] text-slate-400 line-through font-medium">
                        ₹{it.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-300 shadow-sm">
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900 select-none">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary Footer */}
        {items.length > 0 && (
          <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3 shadow-lg">
            {discountTotal > 0 && (
              <div className="bg-emerald-100/80 border border-emerald-300/80 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-800 font-black">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                <span>Martverse Savings: You save ₹{discountTotal.toLocaleString('en-IN')}!</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Items Subtotal:</span>
                <span className="text-slate-900 font-black">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Savings:</span>
                  <span>- ₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Delivery Charges:</span>
                <span className={subtotal >= 499 ? 'text-emerald-700 font-black' : 'text-slate-900 font-bold'}>
                  {subtotal >= 499 ? 'FREE' : '₹40'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-blue-700 text-base font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons: Full Cart Page Link & Billing Counter CTA */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenFullCart}
                className="w-full bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-900 font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <span>View Full Cart Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              </button>

              <button
                onClick={handleProceedToBilling}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all text-sm cursor-pointer border border-blue-500/30"
              >
                <CreditCard className="w-4 h-4" />
                <span>Go to Billing Counter</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
