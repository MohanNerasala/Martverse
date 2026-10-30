'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { Heart, X, ShoppingCart, ArrowRight, Trash2, MapPin, ExternalLink } from 'lucide-react';
import { Product } from '@/types';

export const WishlistModal: React.FC = () => {
  const router = useRouter();
  const isWishlistOpen = useWishlistStore((state) => state.isWishlistOpen);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const navigateToProduct = useMartStore((state) => state.navigateToProduct);
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useMartStore((state) => state.showToast);
  const syncWithBackend = useWishlistStore((state) => state.syncWithBackend);
  const isLoadingBackend = useWishlistStore((state) => state.isLoadingBackend);

  React.useEffect(() => {
    if (isWishlistOpen) {
      syncWithBackend();
    }
  }, [isWishlistOpen, syncWithBackend]);

  if (!isWishlistOpen) return null;

  const handleGoToItem = (product: Product) => {
    toggleWishlist(false);
    navigateToProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    showToast('Added to Trolley', `${product.name} placed into your shopping cart`, 'success');
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-left space-y-4 border border-slate-200/90 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-sm">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">My Saved Wishlist</h3>
                <span className="text-xs bg-rose-100 text-rose-800 font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
                {isLoadingBackend && (
                  <span className="text-[10px] text-slate-400 font-medium animate-pulse">
                    Syncing...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Quickly navigate to or purchase your favorite items</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/wishlist"
              onClick={() => toggleWishlist(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
              title="Open full page"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            </Link>
            <button
              onClick={() => toggleWishlist(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              title="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {items.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-200">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-900 text-sm">Your Wishlist is Empty</p>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  Browse the 3D aisles or search items and tap the heart icon to save products here!
                </p>
              </div>
              <Link
                href="/wishlist"
                onClick={() => toggleWishlist(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span>Go to Wishlist Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            items.map((prod) => {
              const plc = prod.placement;
              return (
                <div
                  key={prod.id}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-sm">
                      <img
                        src={prod.imageUrl || '/products/fallback.svg'}
                        alt={prod.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/fallback.svg';
                        }}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate leading-tight">
                        {prod.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-emerald-700 font-black text-xs">
                          ₹{prod.price}
                        </span>
                        {prod.mrp > prod.price && (
                          <span className="text-slate-400 line-through text-[10px]">
                            ₹{prod.mrp}
                          </span>
                        )}
                        {plc && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
                            <MapPin className="w-2.5 h-2.5" />
                            Floor {plc.floorNumber} • {plc.aisleName || `Aisle ${plc.aisleNumber}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {plc && (
                      <button
                        onClick={() => handleGoToItem(prod)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Teleport to product shelf in 3D store"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Go</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1 text-xs font-extrabold shadow-sm cursor-pointer"
                      title="Add item to shopping trolley"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-white" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(prod.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={clearWishlist}
              className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors font-bold cursor-pointer"
            >
              Clear All Saved Items
            </button>
            <div className="flex items-center gap-2">
              <Link
                href="/wishlist"
                onClick={() => toggleWishlist(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer"
              >
                View Full Page
              </Link>
              <button
                onClick={() => toggleWishlist(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

