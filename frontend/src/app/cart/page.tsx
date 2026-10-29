'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMartStore } from '@/store/useMartStore';
import { LoginModal } from '@/components/ui/LoginModal';
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Tag,
  ArrowRight,
  Store,
  Sparkles,
  User,
  LogIn,
  CheckCircle2,
  Package,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const discountTotal = useCartStore((state) => state.discountTotal);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const phone = useAuthStore((state) => state.phone);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const showToast = useMartStore((state) => state.showToast);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'MART50' || code === 'SUPER50') {
      const discount = Math.min(50, Math.round(subtotal * 0.1));
      setAppliedCoupon(code);
      setCouponDiscount(discount);
      setCouponError(null);
      showToast('Coupon Applied!', `Saved an extra ₹${discount} with ${code}`, 'success');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon(code);
      setCouponDiscount(subtotal < 499 ? 40 : 0);
      setCouponError(null);
      showToast('Coupon Applied!', 'Free shipping voucher active!', 'success');
    } else {
      setCouponError('Invalid coupon code. Try "MART50" or "FREESHIP".');
    }
  };

  const deliveryCharge = subtotal >= 499 || appliedCoupon === 'FREESHIP' || subtotal === 0 ? 0 : 40;
  const finalPayable = Math.max(0, totalAmount - couponDiscount);
  const progressPercent = Math.min(100, Math.round((subtotal / 499) * 100));

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openLoginModal('Please sign in to proceed with your shopping order.');
      return;
    }
    // Navigate back to 3D store or open checkout counter
    router.push('/?checkout=true');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <LoginModal />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Back Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black font-extrabold text-xs transition-all border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to 3D Mart</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 hidden xs:inline">
                MART<span className="text-blue-600">VERSE</span>
              </span>
            </Link>
          </div>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-sm"
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>My Orders</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-inner">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>+91 {phone}</span>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-blue-600" />
              <span>Shopping Trolley</span>
              <span className="text-sm font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Review your picked supermarket items, apply coupon codes, and proceed to instant POS billing.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entire Trolley</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Your Shopping Trolley is Empty</h2>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                Step into our 3D aisles on Floor 1 (Groceries) or Floor 2 (Fashion) and interact with any shelf product to add it.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Enter 3D Supermarket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Grid: Items (Left) + Summary (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items & Free Delivery Progress */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Delivery Meter Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {subtotal >= 499 ? (
                      <span className="text-emerald-700 font-black">
                        🎉 Free Express Delivery Unlocked!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-black font-black">₹{499 - subtotal}</strong> more for{' '}
                        <strong className="text-emerald-700 font-black">FREE Delivery</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-500">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {items.map((it) => (
                  <div key={it.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    
                    {/* Item Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={it.productImage}
                        alt={it.productName}
                        className="w-20 h-20 rounded-2xl object-cover bg-white border border-slate-200 shadow-sm flex-shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <span className="text-[11px] font-black text-blue-700 uppercase tracking-wide">
                          {it.brand}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 leading-snug truncate">
                          {it.productName}
                        </h3>
                        {it.variantName && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md inline-block">
                            {it.size || it.variantName}
                          </span>
                        )}
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-base font-black text-slate-900">
                            ₹{it.price.toLocaleString('en-IN')}
                          </span>
                          {it.mrp > it.price && (
                            <span className="text-xs text-slate-400 line-through font-medium">
                              ₹{it.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      
                      {/* Stepper */}
                      <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 shadow-inner">
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity - 1)}
                          className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-black text-slate-900 select-none">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(it.id, it.quantity + 1)}
                          className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-base font-black text-slate-900 block">
                          ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {it.quantity} × ₹{it.price}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(it.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">100% Genuine</h4>
                    <p className="text-[11px] text-slate-500">Sourced directly from verified brands</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">15-Min Delivery</h4>
                    <p className="text-[11px] text-slate-500">Or pickup at POS Billing Counter</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Simulated Payment</h4>
                    <p className="text-[11px] text-slate-500">Zero charges in demo mode</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              
              {/* Promo Code Box */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900">Apply Promo Voucher</h3>
                </div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter MART50"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase text-slate-900 outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black transition-all cursor-pointer shadow-sm"
                  >
                    Apply
                  </button>
                </form>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-bold">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span>Coupon &quot;{appliedCoupon}&quot; Applied!</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
              </div>

              {/* Bill Details Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-bold text-slate-500">{totalItems} Items</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Items Subtotal:</span>
                    <span className="text-slate-900 font-black">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Supermarket Discount:</span>
                      <span>- ₹{discountTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo Coupon Savings:</span>
                      <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Delivery Charges:</span>
                    <span className={deliveryCharge === 0 ? 'text-emerald-700 font-black' : 'text-slate-900 font-bold'}>
                      {deliveryCharge === 0 ? 'FREE' : '₹40'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-black text-slate-900 block">Total Payable</span>
                      <span className="text-[10px] text-slate-500 font-medium">Inclusive of all taxes</span>
                    </div>
                    <span className="text-2xl font-black text-blue-700">
                      ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Savings highlight */}
                {(discountTotal > 0 || couponDiscount > 0) && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-black text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Total Savings on this order: ₹{(discountTotal + couponDiscount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Checkout CTA Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Proceed to POS Checkout' : 'Sign In & Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
