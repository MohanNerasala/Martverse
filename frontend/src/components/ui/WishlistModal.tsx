'use client';

import React from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { Heart, X, ShoppingCart, ArrowRight, Trash2, Layers, MapPin } from 'lucide-react';
import { Product } from '@/types';

export const WishlistModal: React.FC = () => {
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
    <div className="pointer-events-auto fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="glass-card rounded-3xl max-w-xl w-full p-5 sm:p-6 text-left space-y-4 border border-rose-500/20 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-lg shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">My Saved Wishlist</h3>
                <span className="text-[11px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
                {isLoadingBackend && (
                  <span className="text-[10px] text-slate-400 font-medium animate-pulse">
                    Syncing DB...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Quickly navigate to or purchase your favorite items</p>
            </div>
          </div>
          <button
            onClick={() => toggleWishlist(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {items.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <Heart className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">Your Wishlist is Empty</p>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  Browse the 3D aisles or search items and tap the heart icon to save products here!
                </p>
              </div>
            </div>
          ) : (
            items.map((prod) => {
              const plc = prod.placement;
              return (
                <div
                  key={prod.id}
                  className="bg-[#090D14]/90 p-3 sm:p-3.5 rounded-2xl border border-white/[0.08] hover:border-rose-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/[0.08] overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/fallback.svg';
                          }}
                          className="w-full h-full object-contain p-1 bg-white group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-lg">🛍️</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate leading-tight">
                        {prod.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-emerald-400 font-extrabold text-xs">
                          ₹{prod.price}
                        </span>
                        {prod.mrp > prod.price && (
                          <span className="text-slate-500 line-through text-[10px]">
                            ₹{prod.mrp}
                          </span>
                        )}
                        {plc && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                            <MapPin className="w-2.5 h-2.5" />
                            Floor {plc.floorNumber} • {plc.aisleName || `Aisle ${plc.aisleNumber}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center">
                    {plc && (
                      <button
                        onClick={() => handleGoToItem(prod)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        title="Teleport to product shelf in 3D store"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        <span>Go to Shelf</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      title="Add item to shopping trolley"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(prod.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
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
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={clearWishlist}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors font-semibold"
            >
              Clear All Saved Items
            </button>
            <button
              onClick={() => toggleWishlist(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-bold border border-white/[0.08] cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

