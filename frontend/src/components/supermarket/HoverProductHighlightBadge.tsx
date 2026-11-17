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
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.5,
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
    if (progress <= 0.01) return null;

    const [x, y, z] = position;
    const cleanName = product.name || 'Commercial Product';

    return (
      <group position={[x, y, z]} rotation={[0, rotY, 0]}>
        {/* 1. Soft White-Blue Rim Light Framing the Hovered Pack */}
        <mesh
          geometry={rimBoxGeo}
          scale={[bw * 1.04, bh * 1.04, bd * 1.04]}
          material={highlightMaterials.rimLight}
          raycast={() => null}
        />

        {/* 2. Small, Clean Pop-up Badge right above the pack (No dark lightbox overlay) */}
        <Html
          position={[0, bh / 2 + 0.05, 0]}
          center
          zIndexRange={[100, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
            opacity: 1,
            transform: 'scale(1)',
          }}
        >
          <div className="bg-white/95 border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.14)] rounded-lg px-2.5 py-1 text-left select-none pointer-events-none min-w-[105px] max-w-[145px] whitespace-nowrap">
            {/* Product Name */}
            <div className="text-[11px] font-black text-slate-900 leading-tight truncate max-w-[135px]">
              {cleanName}
            </div>

            {/* Price & Pack Size */}
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-xs font-black text-blue-600 leading-none">
                ₹{product.price}
              </span>
              {(product.weight || product.unit) && (
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {product.weight || product.unit}
                </span>
              )}
            </div>
          </div>
        </Html>
      </group>
    );
  }
);
HoverProductHighlightBadge.displayName = 'HoverProductHighlightBadge';
