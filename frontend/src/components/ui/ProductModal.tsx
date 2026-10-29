'use client';

import React, { useState } from 'react';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { ProductVariant } from '@/types';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  CheckCircle,
  Tag,
  AlertCircle,
} from 'lucide-react';

export const ProductModal: React.FC = () => {
  const isProductModalOpen = useMartStore((state) => state.isProductModalOpen);
  const selectedProduct = useMartStore((state) => state.selectedProduct);
  const closeProductModal = useMartStore((state) => state.closeProductModal);
  const showToast = useMartStore((state) => state.showToast);

  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isProductModalOpen || !selectedProduct) return null;

  const currentVariant = selectedVariant || (selectedProduct.variants && selectedProduct.variants[0]);
  const activePrice = currentVariant?.price || selectedProduct.price;
  const activeMrp = currentVariant?.mrp || selectedProduct.mrp;
  const savings = activeMrp - activePrice;

  const handleAddToCart = () => {
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
      'success'
    );

    closeProductModal();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Luxury White Modal Container with Soft Shadow */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 p-2 rounded-full transition-all duration-200 border border-slate-200 cursor-pointer shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section (Clean Studio Backdrop) */}
        <div className="md:w-1/2 bg-gradient-to-b from-slate-50 to-blue-50/40 p-6 sm:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
          {selectedProduct.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {selectedProduct.discountPercentage}% OFF
            </div>
          )}

          <div className="relative group">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              className="w-52 h-52 object-cover rounded-2xl shadow-lg border border-white group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-amber-500 text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-slate-900 font-extrabold">4.8</span>
            <span className="text-slate-500 font-medium">(1,240 verified reviews)</span>
          </div>
        </div>

        {/* Product Details Section (Pristine White with High-Contrast Black Typography) */}
        <div className="md:w-1/2 p-6 sm:p-7 flex flex-col justify-between bg-white text-slate-900">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-black tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 inline-block mb-1.5">
                {selectedProduct.brand} • {selectedProduct.category?.name || 'Aisle Item'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {selectedProduct.name}
              </h2>
              {selectedProduct.unit && (
                <p className="text-xs font-semibold text-slate-500 mt-1">{selectedProduct.unit}</p>
              )}
            </div>

            {/* Price & Savings Display */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {activeMrp > activePrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ₹{activeMrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300/60">
                  Save ₹{savings}
                </span>
              )}
            </div>

            {/* Clothing Variants (Size / Color) if applicable */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">Select Variant:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentVariant?.id === v.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {v.size || v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In Stock Assurance */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>In Stock • Instant Trolley Delivery</span>
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Bottom Bar: Quantity Stepper & Perfectly Aligned Add to Trolley CTA Button */}
          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-inner">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center font-black text-sm text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Trolley CTA Button with Smooth Hover & Animated Gradient */}
            <button
              onClick={handleAddToCart}
              className="flex-1 relative overflow-hidden py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-white font-extrabold text-sm shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 35%, #059669 70%, #2563eb 100%)',
                backgroundSize: '240% 240%',
                animation: 'gradient-flow 4s ease infinite',
                boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.45)',
              }}
            >
              {/* Sweeping Light Beam Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-70 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                  animation: 'light-sweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                }}
              />
              <ShoppingCart className="w-4 h-4 text-white drop-shadow group-hover:scale-110 transition-transform" />
              <span className="relative z-10 tracking-wide font-black drop-shadow">
                Add to Trolley • ₹{(activePrice * quantity).toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
