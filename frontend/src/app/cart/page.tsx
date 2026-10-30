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
  AlertTriangle,
  Info,
  X,
  CreditCard,
  Percent,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const discountTotal = useCartStore((state) => state.discountTotal);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const phone = useAuthStore((state) => state.phone);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const showToast = useMartStore((state) => state.showToast);
  const toast = useMartStore((state) => state.toast);
  const hideToast = useMartStore((state) => state.hideToast);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const handleApplyCoupon = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const code = (customCode || couponCode).trim().toUpperCase();
    if (!code) return;

    if (code === 'MART50' || code === 'SUPER50') {
      const discount = Math.min(50, Math.round(subtotal * 0.1));
      setAppliedCoupon(code);
      setCouponDiscount(discount);
      setCouponError(null);
      setCouponCode(code);
      showToast('Coupon Applied!', `Saved an extra ₹${discount} with ${code}`, 'success');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon(code);
      setCouponDiscount(subtotal < 499 ? 40 : 0);
      setCouponError(null);
      setCouponCode(code);
      showToast('Coupon Applied!', 'Free express shipping voucher active!', 'success');
    } else {
      setCouponError('Invalid coupon code. Try "MART50" or "FREESHIP".');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError(null);
    showToast('Coupon Removed', 'Voucher discount removed from trolley', 'info');
  };

  // Exact calculations strictly aligned with backend BillingService
  const deliveryFee = subtotal >= 499 || appliedCoupon === 'FREESHIP' || subtotal === 0 ? 0 : 40;
  const finalPayable = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const progressPercent = Math.min(100, Math.round((subtotal / 499) * 100));

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openLoginModal('Please sign in to proceed with your shopping checkout.');
      return;
    }
    // Navigate back to 3D supermarket and open POS billing counter
    router.push('/?checkout=true');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <LoginModal />

      {/* Floating Confirmation Toast */}
      {toast && (
        <div className="pointer-events-auto fixed top-20 right-4 sm:right-6 md:right-8 z-50 animate-in slide-in-from-top-2 fade-in duration-200 ease-out">
          <div
            className={`relative overflow-hidden px-3.5 py-2.5 rounded-2xl border flex items-center gap-2.5 max-w-[280px] sm:max-w-[320px] bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all ${
              toast.type === 'success'
                ? 'border-emerald-300/90'
                : toast.type === 'warning'
                ? 'border-amber-300/90'
                : 'border-blue-300/90'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/90'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200/90'
                  : 'bg-blue-50 text-blue-600 border border-blue-200/90'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-slate-900 leading-tight tracking-tight">
                {toast.title}
              </div>
              {toast.subtitle && (
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5 leading-tight">
                  {toast.subtitle}
                </div>
              )}
            </div>

            <button
              onClick={hideToast}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div
              className={`absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full ${
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : toast.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* --- Top Navigation Header --- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Back Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black font-extrabold text-xs transition-all border border-slate-200 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to 3D Mart</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 hidden xs:inline">
                MART<span className="text-blue-600">VERSE</span>
              </span>
            </Link>
          </div>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer"
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span className="hidden xs:inline">My Orders</span>
            </Link>

            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">+91 {phone}</span>
              </Link>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-blue-600" />
              <span>Shopping Trolley</span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Review your picked supermarket items, verify item totals, and proceed to instant POS billing.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entire Trolley</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
              <ShoppingCart className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Your Shopping Trolley is Empty</h2>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Step into our 3D aisles on Floor 1 (Groceries) or Floor 2 (Fashion) and interact with any shelf product to add it.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <span>Enter 3D Supermarket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Grid: Items (Left) + Summary (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Cart Items & Free Delivery Progress */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Express Delivery Progress Meter */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 rounded-2xl border border-emerald-200/90 p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {subtotal >= 499 ? (
                      <span className="text-emerald-800 font-black">
                        🎉 Congratulations! You unlocked FREE Express Delivery!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-slate-900 font-black">₹{499 - subtotal}</strong> more for{' '}
                        <strong className="text-emerald-700 font-black">FREE Delivery</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black text-emerald-700">{progressPercent}%</span>
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300 animate-sheen"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                {items.map((it) => {
                  const itemTotal = it.price * it.quantity;
                  const itemSavings = (it.mrp > it.price ? it.mrp - it.price : 0) * it.quantity;

                  return (
                    <div
                      key={it.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-all duration-200 group cart-card-hover"
                    >
                      {/* Product Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                          <img
                            src={it.productImage || '/products/fallback.svg'}
                            alt={it.productName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/products/fallback.svg';
                            }}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                              {it.brand || 'SUPERMARKET'}
                            </span>
                            {itemSavings > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
                                Save ₹{itemSavings.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-black text-slate-900 leading-snug truncate" title={it.productName}>
                            {it.productName}
                          </h3>

                          {it.variantName && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md inline-block">
                              {it.size || it.variantName}
                            </span>
                          )}

                          {/* Unit Price vs MRP */}
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-sm font-black text-slate-900">
                              ₹{it.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">per unit</span>
                            {it.mrp > it.price && (
                              <span className="text-xs text-slate-400 line-through font-medium ml-1">
                                ₹{it.mrp.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total (Separated clearly) */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {/* Tactile Stepper */}
                        <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 shadow-inner">
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer border border-slate-200"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs sm:text-sm font-black text-slate-900 select-none">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer border border-slate-200"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Separate Item Total Calculation */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Item Total
                          </span>
                          <span className="text-base font-black text-slate-900 block leading-tight">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {it.quantity} × ₹{it.price}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(it.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer active:scale-90"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Supermarket Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 flex items-center gap-3 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">100% Genuine</h4>
                    <p className="text-[11px] text-slate-500">Directly from verified brands</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 flex items-center gap-3 shadow-2xs">
                  <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Express Delivery</h4>
                    <p className="text-[11px] text-slate-500">Free above ₹499 or in-store</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 flex items-center gap-3 shadow-2xs">
                  <CreditCard className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Instant POS Billing</h4>
                    <p className="text-[11px] text-slate-500">Direct checkout counter sync</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              
              {/* Promo Code Card with Quick-Apply Pills */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-black text-slate-900">Apply Promo Voucher</h3>
                  </div>
                  {appliedCoupon && (
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <form onSubmit={(e) => handleApplyCoupon(e)} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter MART50 or FREESHIP"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase text-slate-900 outline-none focus:border-blue-600 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Apply
                  </button>
                </form>

                {/* Quick-Apply Suggestion Pills */}
                {!appliedCoupon && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => handleApplyCoupon(undefined, 'MART50')}
                      className="text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <Percent className="w-3 h-3" />
                      <span>MART50 (10% OFF)</span>
                    </button>
                    <button
                      onClick={() => handleApplyCoupon(undefined, 'FREESHIP')}
                      className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <Truck className="w-3 h-3" />
                      <span>FREESHIP</span>
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 font-bold">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Voucher &quot;{appliedCoupon}&quot; Active</span>
                    </span>
                    <span className="font-black text-emerald-700">- ₹{couponDiscount}</span>
                  </div>
                )}
              </div>

              {/* Order Summary & Bill Details */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-bold text-slate-500">{totalItems} Items</span>
                </h3>

                {/* Itemized Bill Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
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

                  {/* Total Payable */}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm sm:text-base font-black text-slate-900 block leading-tight">Total Payable</span>
                      <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-blue-600">
                      ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Savings Callout Banner */}
                {(discountTotal > 0 || couponDiscount > 0) && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs font-black text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Total Savings on this order:</span>
                    </div>
                    <span className="text-emerald-700 font-black">
                      ₹{(discountTotal + couponDiscount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Checkout CTA Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 hover:shadow-[0_0_28px_rgba(56,189,248,0.45)] active:scale-[0.98] transition-all text-sm cursor-pointer"
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
