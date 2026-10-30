'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useMartStore } from '@/store/useMartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginModal } from '@/components/ui/LoginModal';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Store,
  User,
  LogIn,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  PackagePlus,
  ShieldCheck,
} from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const syncWithBackend = useWishlistStore((state) => state.syncWithBackend);

  const addItem = useCartStore((state) => state.addItem);
  const cartTotalItems = useCartStore((state) => state.totalItems);
  const showToast = useMartStore((state) => state.showToast);
  const openProductModal = useMartStore((state) => state.openProductModal);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authPhone = useAuthStore((state) => state.phone);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
    syncWithBackend();
  }, [hydrateAuth, syncWithBackend]);

  const handleMoveToTrolley = (product: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem(product, 1);
    removeFromWishlist(product.id);
    showToast(
      'Moved to Trolley!',
      `${product.name} moved from your wishlist to the shopping trolley.`,
      'success'
    );
  };

  const handleAddAllToTrolley = () => {
    if (items.length === 0) return;
    let count = 0;
    for (const item of items) {
      addItem(item, 1);
      count++;
    }
    clearWishlist();
    showToast(
      'All Items Moved to Trolley!',
      `Added ${count} items to your shopping trolley.`,
      'success'
    );
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <LoginModal />

      {/* ============================================================== */}
      {/* --- Pure White Executive Navigation Bar --- */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Quick Navigation Links & Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all border border-slate-200 cursor-pointer shadow-xs active:scale-95"
              title="Return to 3D Supermarket"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span>Back to Mart</span>
            </Link>

            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
              title="View My Profile"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>My Profile</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900 hidden xs:inline">
                MART<span className="text-blue-600">VERSE</span>
              </span>
            </Link>
          </div>

          {/* Right: Trolley & Account Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/cart"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span className="hidden xs:inline">Trolley</span>
              {cartTotalItems > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-blue-700 font-black text-[10px] rounded-full shadow-xs">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">+91 {authPhone}</span>
              </Link>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* --- Main Middle Content Area (White Background, Best CSS) --- */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        
        {/* Top Header Card: Centered Title, Counter Badge & Action Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-50 to-pink-100 text-rose-600 flex items-center justify-center border border-rose-200 shadow-sm shrink-0">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    My Saved Wishlist
                  </h1>
                  <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-200 shadow-xs">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Your handpicked favorites from the 3D supermarket shelves. Add them directly to your trolley anytime.
                </p>
              </div>
            </div>

            {/* Batch Actions */}
            {items.length > 0 && (
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={clearWishlist}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-all border border-slate-200 cursor-pointer flex items-center gap-1.5"
                  title="Remove all items from your wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>

                <button
                  onClick={handleAddAllToTrolley}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Move All to Trolley</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Perks Bar */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Price Lock & Instant 3D Restock Active</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tap any product to view its high-resolution 3D details</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* --- Wishlist Items Display (Grid Layout) --- */}
        {/* ============================================================== */}
        {items.length === 0 ? (
          /* Empty State: Centered in the middle of page with beautiful CSS */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-16 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-5 shadow-inner">
              <Heart className="w-10 h-10 text-rose-400 stroke-[1.5]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Explore the 3D aisles, walk up to chocolates, snacks, and groceries, or tap the heart icon on any product to save it here for later!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Store className="w-4 h-4 text-white" />
                <span>Explore 3D Supermarket</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <Link
                href="/orders"
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all border border-slate-200"
              >
                View Order History
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((product) => {
              const activePrice = product.price;
              const activeMrp = product.mrp || product.price;
              const hasDiscount = activeMrp > activePrice;
              const savings = activeMrp - activePrice;

              return (
                <div
                  key={product.id}
                  onClick={() => openProductModal(product)}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  {/* Top: Remove Quick Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                      showToast('Removed from Wishlist', `${product.name} removed`, 'info');
                    }}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors border border-slate-200/80 cursor-pointer shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    {/* Product Packaging Image Studio Box */}
                    <div className="w-full h-44 bg-gradient-to-b from-slate-50 to-blue-50/20 rounded-2xl p-3 flex items-center justify-center border border-slate-100 overflow-hidden mb-4 relative shadow-inner">
                      <img
                        src={product.imageUrl || '/products/fallback.svg'}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/fallback.svg';
                        }}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discountPercentage > 0 && (
                        <span className="absolute bottom-2.5 left-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          {product.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Brand & Category Label */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                        {product.brand}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold truncate">
                        {product.category?.name || 'Supermarket Item'}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Weight / Size */}
                    {product.unit && (
                      <p className="text-[11px] font-bold text-slate-500 mt-1">
                        Size: <span className="text-slate-800">{product.unit}</span>
                      </p>
                    )}

                    {/* In Stock Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>In Stock • Ready to Restock</span>
                    </div>
                  </div>

                  {/* Bottom: Price Display & Action Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                          ₹{activePrice.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 font-medium line-through">
                            ₹{activeMrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p className="text-[10px] font-black text-emerald-700">Save ₹{savings}</p>
                      )}
                    </div>

                    {/* Move to Trolley CTA Button */}
                    <button
                      onClick={(e) => handleMoveToTrolley(product, e)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-sm hover:shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                      title="Move this item to your 3D shopping trolley"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-white" />
                      <span>Move to Trolley</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
