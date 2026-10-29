'use client';

import React from 'react';
import { useMartStore } from '@/store/useMartStore';

export const ProductHoverCard: React.FC = () => {
  const hoveredProduct = useMartStore((state) => state.hoveredProduct);
  const openProductModal = useMartStore((state) => state.openProductModal);

  if (!hoveredProduct) return null;

  const activePrice = hoveredProduct.price;
  const activeMrp = hoveredProduct.mrp || hoveredProduct.price;
  const hasDiscount = activeMrp > activePrice;

  return (
    <div
      onClick={() => openProductModal(hoveredProduct)}
      className="fixed bottom-6 right-6 z-40 w-72 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_14px_35px_rgba(0,0,0,0.12)] p-3 text-slate-900 transition-all duration-200 cursor-pointer hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2 select-none"
      role="tooltip"
      aria-label={`Product preview: ${hoveredProduct.name}`}
    >
      <div className="flex items-center gap-3">
        {/* Product Image */}
        <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-xl p-1 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
          <img
            src={hoveredProduct.imageUrl || '/products/fallback.svg'}
            alt={hoveredProduct.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/products/fallback.svg';
            }}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Name & Amount */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
            {hoveredProduct.name}
          </h4>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-sm font-black text-emerald-700">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 font-medium line-through">
                ₹{activeMrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
