'use client';

import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { Product } from '@/types';

// Pre-allocated shared materials for hover highlight (zero per-frame allocations)
const highlightMaterials = {
  rimLight: new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: new THREE.Color('#38bdf8'),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.55,
    wireframe: true,
  }),
  badgeBg: new THREE.MeshBasicMaterial({
    color: '#0f172a',
    transparent: true,
    opacity: 0.92,
  }),
  badgeBorder: new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.8,
  }),
};

const badgePlaneGeo = new THREE.PlaneGeometry(1, 1);
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
    const badgeY = y + bh / 2 + 0.07;
    const cleanName = product.name?.length > 22 ? product.name.substring(0, 20) + '...' : (product.name || 'Product');

    return (
      <group position={[x, y, z]} rotation={[0, rotY, 0]}>
        {/* 1. Soft White-Blue Rim Light Framing the Hovered Pack */}
        <mesh
          geometry={rimBoxGeo}
          scale={[bw * 1.04, bh * 1.04, bd * 1.04]}
          material={highlightMaterials.rimLight}
          raycast={() => null}
        />

        {/* 2. Floating Compact Price & Name Badge Above the Pack */}
        <group position={[0, bh / 2 + 0.07, bd / 2 + 0.01]} raycast={() => null}>
          {/* Badge Background Pill */}
          <mesh geometry={badgePlaneGeo} scale={[0.34, 0.09, 1]} material={highlightMaterials.badgeBg} />
          {/* Subtle Cyan Outline */}
          <mesh position={[0, 0, -0.001]} geometry={badgePlaneGeo} scale={[0.35, 0.10, 1]} material={highlightMaterials.badgeBorder} />

          {/* Product Name */}
          <Text
            position={[0, 0.016, 0.005]}
            fontSize={0.030}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {cleanName}
          </Text>

          {/* Price Tag */}
          <Text
            position={[0, -0.020, 0.005]}
            fontSize={0.034}
            color="#facc15"
            anchorX="center"
            anchorY="middle"
            fontWeight="black"
          >
            {`₹${product.price}`}
          </Text>
        </group>
      </group>
    );
  }
);
HoverProductHighlightBadge.displayName = 'HoverProductHighlightBadge';

