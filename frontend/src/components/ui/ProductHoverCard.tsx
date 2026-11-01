'use client';

import React, { useState, useEffect } from 'react';
import { useMartStore } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Product } from '@/types';
import { ShoppingCart, Eye } from 'lucide-react';

export const ProductHoverCard: React.FC = () => {
  const hoveredProduct = useMartStore((state) => state.hoveredProduct);
  const activeFloor = useMartStore((state) => state.activeFloor);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const showToast = useMartStore((state) => state.showToast);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);

  // Keep last known product for smooth hardware-accelerated CSS fade transition
  const [activeProd, setActiveProd] = useState<Product | null>(null);

  useEffect(() => {
    if (hoveredProduct) {
      setActiveProd(hoveredProduct);
    }
  }, [hoveredProduct]);

  // Floor guard: strictly filter by active floor to prevent cross-floor product display
  const isFloorMatching =
    hoveredProduct?.placement?.floorNumber == null ||
    (hoveredProduct?.placement?.floorNumber ??
      (hoveredProduct?.placement?.aisleNumber ? (hoveredProduct.placement.aisleNumber <= 5 ? 1 : 2) : 1)) ===
      activeFloor;

  const isVisible = Boolean(hoveredProduct && isFloorMatching);
  const displayProd = hoveredProduct || activeProd;

  if (!displayProd) return null;

  const activePrice = displayProd.price;
  const activeMrp = displayProd.mrp || displayProd.price;
  const hasDiscount = activeMrp > activePrice;
  const packageSize = displayProd.unit || 'Standard Pack';
  const categoryName = displayProd.category?.name || 'Sweets & Confectionery';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast(
        'Login Required',
        'Please sign in to add items to your shopping trolley.',
        'warning'
      );
      openLoginModal('Please sign in to add items to your shopping trolley.');
      return;
    }

    let startPos: [number, number, number] | undefined = undefined;
    if (displayProd.placement) {
      startPos = [
        displayProd.placement.worldX,
        displayProd.placement.worldY + 0.25,
        displayProd.placement.worldZ,
      ];
    }

    addItem(displayProd, 1, undefined, startPos);
  };

  return (
    <div
      onClick={() => openProductModal(displayProd)}
      className={`fixed bottom-6 right-6 z-40 w-84 bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-4 text-slate-900 transition-all duration-200 ease-out cursor-pointer hover:border-blue-400 hover:shadow-2xl select-none group will-change-[transform,opacity] ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
      }`}
      role="tooltip"
      aria-label={`Product preview: ${displayProd.name}`}
    >
      <div className="flex gap-3.5 items-start">
        {/* Product Image */}
        <div className="w-22 h-22 shrink-0 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
          <img
            src={displayProd.imageUrl || '/products/fallback.svg'}
            alt={displayProd.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/products/fallback.svg';
            }}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
              {displayProd.brand}
            </span>
            <span className="text-[10px] font-medium text-slate-500 truncate">
              {categoryName}
            </span>
          </div>

          <h4 className="text-xs font-black text-slate-900 line-clamp-1 leading-snug">
            {displayProd.name}
          </h4>

          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Size: <span className="font-semibold text-slate-700">{packageSize}</span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-slate-900">
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

      {/* Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openProductModal(displayProd);
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-2 rounded-xl transition-all cursor-pointer"
          title="View product details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
