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
  Package,
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

    addItem(selectedProduct, quantity, currentVariant || undefined);

    const variantDesc = currentVariant?.size ? ` (${currentVariant.size})` : '';
    showToast(
      'Added to Trolley!',
      `${quantity}x ${selectedProduct.name}${variantDesc} • ₹${(activePrice * quantity).toLocaleString('en-IN')}`,
      'success'
    );

    closeProductModal();
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200 border border-white/[0.08]">
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-10 bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white p-2 rounded-full transition-all border border-white/[0.08]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 bg-[#080B11] p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/[0.06]">
          {selectedProduct.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-amber-500/15 text-amber-300 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {selectedProduct.discountPercentage}% OFF
            </div>
          )}

          <img
            src={selectedProduct.imageUrl}
            alt={selectedProduct.name}
            className="w-48 h-48 object-cover rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300"
          />

          <div className="mt-4 flex items-center gap-1.5 text-amber-400 text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.8</span>
            <span className="text-slate-400 font-normal">(1,240 verified reviews)</span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-blue-400 text-xs font-bold tracking-wider uppercase">
                {selectedProduct.brand} • {selectedProduct.category?.name || 'Aisle Item'}
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight mt-1">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.unit}</p>
            </div>

            {/* Price Badge */}
            <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-white">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 line-through ml-2">
                  ₹{activeMrp.toLocaleString('en-IN')}
                </span>
              </div>
              {savings > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/25">
                  Save ₹{savings}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {selectedProduct.description}
            </p>

            {/* Clothing Variants (Size / Color) */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-300">Select Size:</span>
                <div className="flex gap-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentVariant?.id === v.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.06]'
                      }`}
                    >
                      {v.size || v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In Stock Notice */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
              <CheckCircle className="w-4 h-4" />
              <span>In Stock • Shelf Placement Active</span>
            </div>

            {validationError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Quantity Stepper & Add to Trolley CTA */}
          <div className="pt-4 mt-2 border-t border-white/[0.06] flex items-center gap-3">
            <div className="flex items-center bg-white/[0.05] border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 flex items-center justify-center transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 flex items-center justify-center transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all text-sm btn-shine border border-blue-400/30"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Trolley • ₹{(activePrice * quantity).toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
