'use client';

import React from 'react';
import * as THREE from 'three';
import { Product } from '@/types';

// Pre-allocated shared materials for hover highlight (zero per-frame allocations)
const highlightMaterials = {
  rimLight: new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: new THREE.Color('#38bdf8'),
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.45,
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

/**
 * Pure 3D subtle rim-highlight framing the hovered pack as it lifts.
 * Zero DOM HTML popup overlay at the item place — product details are
 * already cleanly presented in the bottom-right HUD card and shelf price rail.
 */
export const HoverProductHighlightBadge: React.FC<HoverProductHighlightBadgeProps> = React.memo(
  ({ position, rotY, bw, bh, bd, progress }) => {
    if (progress <= 0.01) return null;

    const [x, y, z] = position;
    // Upward lift matching computeHoverMatrix (22mm * progress)
    const liftY = 0.022 * progress;

    return (
      <group position={[x, y + liftY, z]} rotation={[0, rotY, 0]} raycast={() => null}>
        {/* Soft White-Blue Rim Light Framing the Hovered Lifted Pack */}
        <mesh
          geometry={rimBoxGeo}
          scale={[bw * 1.03, bh * 1.03, bd * 1.03]}
          material={highlightMaterials.rimLight}
          raycast={() => null}
        />
      </group>
    );
  }
);
HoverProductHighlightBadge.displayName = 'HoverProductHighlightBadge';
