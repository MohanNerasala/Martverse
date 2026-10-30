'use client';

import React, { useState } from 'react';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ProductVariant } from '@/types';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  CheckCircle2,
  Tag,
  AlertCircle,
  Lock,
  ZoomIn,
  Maximize2,
  Heart,
} from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';

export const ProductModal: React.FC = () => {
  const isProductModalOpen = useMartStore((state) => state.isProductModalOpen);
  const selectedProduct = useMartStore((state) => state.selectedProduct);
  const closeProductModal = useMartStore((state) => state.closeProductModal);
  const showToast = useMartStore((state) => state.showToast);

  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlistProduct = useWishlistStore((state) => state.isInWishlist);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBigZoomOpen, setIsBigZoomOpen] = useState<boolean>(false);

  if (!isProductModalOpen || !selectedProduct) return null;

  const isFav = isWishlistProduct(selectedProduct.id);

  const currentVariant = selectedVariant || (selectedProduct.variants && selectedProduct.variants[0]);
  const activePrice = currentVariant?.price || selectedProduct.price;
  const activeMrp = currentVariant?.mrp || selectedProduct.mrp;
  const savings = activeMrp - activePrice;

  const handleAddToCart = () => {
    // Auth Gate: Only logged in users can add items to cart
    if (!isAuthenticated) {
      showToast(
        'Login Required',
        'Please sign in with your mobile number to add items to your shopping trolley.',
        'warning'
      );
      openLoginModal('Please sign in to add items to your shopping trolley.');
      return;
    }

    if (quantity <= 0) {
      setValidationError('Please select at least 1 item.');
      return;
    }

    if (selectedProduct.inStock === false) {
      setValidationError('This product is currently out of stock.');
      return;
    }

    setValidationError(null);

    let startPos: [number, number, number] | undefined = undefined;
    if (selectedProduct.placement) {
      startPos = [
        selectedProduct.placement.worldX,
        selectedProduct.placement.worldY + 0.35,
        selectedProduct.placement.worldZ,
      ];
    }

    addItem(selectedProduct, quantity, currentVariant || undefined, startPos);

    const variantDesc = currentVariant?.size ? ` (${currentVariant.size})` : '';
    showToast(
      'Added to Trolley!',
      `${quantity}x ${selectedProduct.name}${variantDesc} • ₹${(activePrice * quantity).toLocaleString('en-IN')}`,
      'success',
      selectedProduct.imageUrl
    );

    closeProductModal();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Luxury White Modal Box with Black Text */}
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.28)] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200 border border-slate-200/90">
        
        {/* Crisp Circular Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black flex items-center justify-center transition-all duration-200 border border-slate-200 cursor-pointer shadow-sm hover:rotate-90 active:scale-90"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Section (Clean White Studio Framing) */}
        <div className="md:w-5/12 bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/30 p-6 sm:p-7 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
          {selectedProduct.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
              <Tag className="w-3.5 h-3.5 fill-slate-950" />
              <span>{selectedProduct.discountPercentage}% OFF</span>
            </div>
          )}

          {/* Big Product Image with Zoom on Click */}
          <div
            onClick={() => setIsBigZoomOpen(true)}
            className="relative group p-3 bg-white rounded-2xl shadow-sm border border-slate-100 my-2 cursor-zoom-in transition-all hover:shadow-md hover:border-blue-200"
            title="Click to view large image"
          >
            <img
              src={selectedProduct.imageUrl || '/products/fallback.svg'}
              alt={selectedProduct.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/products/fallback.svg';
              }}
              className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3 h-3" />
              <span>Enlarge</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-900">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-black text-black">4.8</span>
            <span className="text-slate-500 font-medium">(1,240 verified reviews)</span>
          </div>
        </div>

        {/* Product Details Section (Pristine White Box with Crisp Black Typography) */}
        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between bg-white text-black">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-black tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/70 inline-block mb-1.5">
                {selectedProduct.brand} • {selectedProduct.category?.name || 'Supermarket Item'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {selectedProduct.name}
              </h2>
              {selectedProduct.unit && (
                <p className="text-xs font-bold text-slate-500 mt-1">{selectedProduct.unit}</p>
              )}
            </div>

            {/* Price & Savings Display Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {activeMrp > activePrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ₹{activeMrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300/80 shadow-sm">
                  Save ₹{savings}
                </span>
              )}
            </div>

            {/* Product Variants (if available) */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-900">Select Variant:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentVariant?.id === v.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {v.size || v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In Stock Badge */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>In Stock • Shelf Placement Active</span>
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Perfectly Aligned Bottom Bar: Quantity Stepper, Wishlist & Add to Trolley CTA */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2.5 w-full">
            {/* Quantity Stepper (Pixel-perfect h-11 alignment) */}
            <div className="h-11 flex items-center bg-slate-100 border border-slate-200 rounded-xl px-1.5 py-0.5 gap-0.5 shadow-inner flex-shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-900 font-extrabold flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 text-slate-800" />
              </button>
              <span className="w-7 text-center font-black text-xs text-slate-900 select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-900 font-extrabold flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 text-slate-800" />
              </button>
            </div>

            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={() => {
                const added = toggleWishlist(selectedProduct);
                showToast(
                  added ? 'Added to Wishlist' : 'Removed from Wishlist',
                  `${selectedProduct.name} ${added ? 'saved to your wishlist' : 'removed'}`,
                  added ? 'success' : 'info'
                );
              }}
              className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 ${
                isFav
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 shadow-md shadow-rose-500/20 scale-105'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-rose-500'
              }`}
              title={isFav ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Add to Trolley CTA Button: Generous room, Left label + Right amount pill, Never truncated */}
            <button
              onClick={handleAddToCart}
              className="h-11 flex-1 relative overflow-hidden rounded-xl flex items-center justify-between px-3.5 sm:px-4 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all duration-300 ease-out hover:scale-[1.01] active:scale-[0.99] hover:shadow-xl hover:shadow-blue-600/35 hover:shadow-[0_0_24px_rgba(56,189,248,0.45)] group cursor-pointer select-none"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)',
              }}
            >
              {/* Smooth Gliding White Sheen on Hover */}
              <div className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                    animation: 'light-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  }}
                />
              </div>

              {/* Action Title on Left */}
              <div className="relative z-10 flex items-center gap-2 min-w-0">
                {!isAuthenticated ? (
                  <Lock className="w-4 h-4 text-white drop-shadow flex-shrink-0" />
                ) : (
                  <ShoppingCart className="w-4 h-4 text-white drop-shadow flex-shrink-0" />
                )}
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight whitespace-nowrap">
                  {!isAuthenticated ? 'Sign In & Add' : 'Add to Trolley'}
                </span>
              </div>
              
              {/* Crisp High-Contrast Amount Pill on Right */}
              <span className="relative z-10 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm text-white font-mono flex-shrink-0 border border-white/25 shadow-sm ml-2">
                ₹{(activePrice * quantity).toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Big Zoom Image Lightbox Overlay */}
      {isBigZoomOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsBigZoomOpen(false)}
        >
          <button
            onClick={() => setIsBigZoomOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="bg-white p-6 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col items-center text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedProduct.imageUrl || '/products/fallback.svg'}
              alt={selectedProduct.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/products/fallback.svg';
              }}
              className="max-h-[60vh] w-auto object-contain rounded-2xl"
            />
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {selectedProduct.brand}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-sm font-bold text-emerald-600 mt-1">
                ₹{activePrice} {selectedProduct.unit ? `• ${selectedProduct.unit}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
