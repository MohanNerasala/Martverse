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
  CheckCircle2,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Luxury White Modal Box with Black Text */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.28)] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200 border border-slate-200/90">
        
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
            <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 fill-slate-950" />
              <span>{selectedProduct.discountPercentage}% OFF</span>
            </div>
          )}

          <div className="relative group p-2 bg-white rounded-2xl shadow-sm border border-slate-100 my-2">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.name}
              className="w-48 h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
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

          {/* Perfectly Aligned Bottom Bar: Quantity Stepper & Add to Trolley CTA Button */}
          <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3 w-full">
            {/* Quantity Stepper (Pixel-perfect h-12 alignment with CTA button) */}
            <div className="h-12 flex items-center bg-slate-100 border border-slate-200 rounded-2xl px-1.5 py-1 gap-1 shadow-inner flex-shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-extrabold flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 text-slate-800" />
              </button>
              <span className="w-8 text-center font-black text-sm text-slate-900 select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-extrabold flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer border border-slate-200"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 text-slate-800" />
              </button>
            </div>

            {/* Add to Trolley CTA Button: Smooth Hover, Shimmer Beam, Perfectly Aligned */}
            <button
              onClick={handleAddToCart}
              className="h-12 flex-1 relative overflow-hidden rounded-2xl flex items-center justify-center gap-2.5 px-5 text-white font-extrabold text-sm shadow-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-blue-600/35 group cursor-pointer select-none"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)',
              }}
            >
              {/* Smooth Gliding White Sheen on Hover */}
              <div className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: 'light-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  }}
                />
              </div>

              {/* Shopping Cart Icon with subtle tilt & scale on hover */}
              <ShoppingCart className="w-4 h-4 text-white drop-shadow group-hover:scale-115 group-hover:-rotate-6 transition-transform duration-300 flex-shrink-0" />
              
              {/* Button text showing Item action and Total Amount */}
              <span className="relative z-10 tracking-wide font-black text-white text-sm drop-shadow whitespace-nowrap">
                Add to Trolley • ₹{(activePrice * quantity).toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
