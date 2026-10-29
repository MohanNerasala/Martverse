'use client';

import React from 'react';
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
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-xl flex justify-end">
      <div className="w-full max-w-md bg-[#090D14] border-l border-white/[0.08] h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Shopping Trolley</h2>
              <p className="text-xs text-slate-400">{totalItems} items picked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => toggleCart(false)}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-all border border-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-white/[0.02] px-5 py-2.5 border-b border-white/[0.06] text-xs flex items-center gap-2 text-slate-300">
          <Truck className="w-4 h-4 text-emerald-400" />
          {subtotal >= 499 ? (
            <span className="text-emerald-400 font-bold">
              🎉 Congratulations! You have unlocked FREE Express Delivery!
            </span>
          ) : (
            <span>
              Add <strong className="text-white">₹{499 - subtotal}</strong> more for FREE Delivery!
            </span>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Your Trolley is Empty</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Walk through the supermarket aisles, explore the shelves, and press [E] on any product to add it to your cart.
              </p>
              <button
                onClick={() => toggleCart(false)}
                className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/25"
              >
                Explore Supermarket
              </button>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] rounded-2xl p-3 flex gap-3 items-center transition-all"
              >
                <img
                  src={it.productImage}
                  alt={it.productName}
                  className="w-16 h-16 rounded-xl object-cover bg-black/40 border border-white/[0.06]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                    {it.brand}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{it.productName}</h4>
                  {it.variantName && (
                    <span className="text-[10px] bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded mr-1">
                      {it.size || it.variantName}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xs font-bold text-white">
                      ₹{it.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 line-through">
                      ₹{it.mrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.08]">
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
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
          <div className="p-5 bg-black/40 border-t border-white/[0.08] space-y-3">
            {discountTotal > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>Martverse Savings: You are saving ₹{discountTotal.toLocaleString('en-IN')} on this order!</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Savings:</span>
                <span className="text-emerald-400 font-medium">- ₹{discountTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className={subtotal >= 499 ? 'text-emerald-400' : 'text-white'}>
                  {subtotal >= 499 ? 'FREE' : '₹40'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/[0.08]">
                <span>Grand Total:</span>
                <span className="text-blue-400">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToBilling}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all text-sm btn-shine border border-blue-400/30"
            >
              <CreditCard className="w-4 h-4" />
              <span>Go to Billing Counter</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
