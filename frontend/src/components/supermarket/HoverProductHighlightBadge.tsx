'use client';

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Product } from '@/types';

// Pre-allocated shared materials for hover highlight (zero per-frame allocations)
const highlightMaterials = {
  rimLight: new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: new THREE.Color('#38bdf8'),
    emissiveIntensity: 0.95,
    transparent: true,
    opacity: 0.65,
    wireframe: true,
  }),
};

const rimBoxGeo = new THREE.BoxGeometry(1, 1, 1);

interface HoverProductHighlightBadgeProps {
  product: Product;
  position: [number, number, number];
  rotY: number;
  bw: number;
  bh: number;
  bd: number;
  progress: number;
}

export const HoverProductHighlightBadge: React.FC<HoverProductHighlightBadgeProps> = React.memo(
  ({ product, position, rotY, bw, bh, bd, progress }) => {
    if (progress <= 0.05) return null;

    const [x, y, z] = position;
    const cleanName = product.name || 'Commercial Product';
    const mrp = product.mrp && product.mrp > product.price ? product.mrp : Math.round(product.price * 1.25);
    const stock = product.stock || product.stockQuantity || 24;
    const rating = product.rating || 4.5;

    return (
      <group position={[x, y, z]} rotation={[0, rotY, 0]}>
        {/* 1. Soft White-Blue Rim Light Framing the Hovered Pack */}
        <mesh
          geometry={rimBoxGeo}
          scale={[bw * 1.05, bh * 1.05, bd * 1.05]}
          material={highlightMaterials.rimLight}
          raycast={() => null}
        />

        {/* 2. Pin-Sharp HTML Overlay Tooltip Card via Drei Html (Sharp at any distance) */}
        <Html
          position={[0, bh / 2 + 0.16, 0]}
          center
          distanceFactor={6}
          zIndexRange={[100, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
            opacity: Math.min(1, progress * 1.5),
            transform: `scale(${0.85 + progress * 0.15})`,
          }}
        >
          <div className="w-56 bg-slate-900/95 backdrop-blur-xl border border-sky-400/60 rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_20px_rgba(56,189,248,0.25)] text-left select-none pointer-events-none">
            {/* Header: Brand & Rating */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-500/30">
                {product.brand || 'MARTVERSE'}
              </span>
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                ★ {rating}
              </span>
            </div>

            {/* Product Name */}
            <h4 className="text-xs font-black text-white leading-snug line-clamp-2">
              {cleanName}
            </h4>

            {/* Weight / Pack Size */}
            <p className="text-[10px] font-medium text-slate-300 mt-0.5">
              {product.weight || product.unit || 'Standard Pack'}
            </p>

            {/* Price & Stock Row */}
            <div className="flex items-baseline justify-between mt-2 pt-1.5 border-t border-slate-700/80">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-rose-400 leading-none">
                  ₹{product.price}
                </span>
                {mrp > product.price && (
                  <span className="text-[10px] font-semibold text-slate-400 line-through">
                    ₹{mrp}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] font-bold text-emerald-400">
                In Stock ({stock})
              </span>
            </div>
          </div>
        </Html>
      </group>
    );
  }
);
HoverProductHighlightBadge.displayName = 'HoverProductHighlightBadge';
