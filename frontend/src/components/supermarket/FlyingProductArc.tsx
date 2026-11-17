'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlyAnimation, useCartStore } from '@/store/useCartStore';
import { martRuntime } from '@/store/useMartStore';
import { getProductPackagingTexture } from '@/lib/productTextureAtlas';

interface FlyingArcsProps {
  trolleyPos?: [number, number, number];
  playerYaw?: number;
}

// EaseOutCubic function for realistic deceleration into trolley basket
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

// Pre-allocated shared geometries for flying projectile meshes (zero GC pauses)
const sharedFlyGeometries = {
  bottleBody: new THREE.CylinderGeometry(0.065, 0.07, 0.20, 12),
  bottleShoulder: new THREE.CylinderGeometry(0.03, 0.065, 0.05, 12),
  bottleCap: new THREE.CylinderGeometry(0.025, 0.025, 0.04, 10),
  bottleLabel: new THREE.CylinderGeometry(0.072, 0.072, 0.12, 12),
  garment: new THREE.BoxGeometry(0.22, 0.07, 0.22),
  collar: new THREE.BoxGeometry(0.16, 0.01, 0.06),
  chocolate: new THREE.BoxGeometry(0.24, 0.11, 0.022),
  chocolateEdge: new THREE.BoxGeometry(0.008, 0.105, 0.004),
  box: new THREE.BoxGeometry(0.2, 0.2, 0.15),
  boxLabel: new THREE.BoxGeometry(0.17, 0.16, 0.005),
};

// Material cache for flying projectiles to eliminate shader compile stutters
const flyMaterialCache = new Map<string, THREE.MeshStandardMaterial>();
function getFlyMaterial(color: string, roughness = 0.25, metalness = 0.1): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}_${metalness}`;
  let mat = flyMaterialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, metalness });
    flyMaterialCache.set(key, mat);
  }
  return mat;
}
const whiteCapMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
const whiteLabelMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

const SingleFlyArc: React.FC<{
  anim: FlyAnimation;
  trolleyPos?: [number, number, number];
  playerYaw?: number;
}> = ({ anim, trolleyPos, playerYaw }) => {
  const groupRef = useRef<THREE.Group>(null);
  const duration = anim.duration || 600;
  const productColor = anim.color || '#3b82f6';

  // Authentic product packaging texture of the exact item the customer selected
  const packTex = useMemo(() => {
    return getProductPackagingTexture(
      anim.product || {
        id: anim.productId || anim.id,
        name: anim.productName,
        price: anim.price || 99,
        imageUrl: anim.productImage,
        brand: anim.brand,
        placement: { color: anim.color || '#3b82f6' } as any,
      } as any
    );
  }, [anim]);

  const packagingMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: packTex,
      roughness: 0.32,
      metalness: 0.08,
    });
  }, [packTex]);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = Date.now() - anim.createdAt;
    const t = Math.min(1, Math.max(0, elapsed / duration));

    const [sx, sy, sz] = anim.startPos;

    const actualYaw = playerYaw !== undefined ? playerYaw : martRuntime.playerYaw;
    const pPos = martRuntime.playerPos;
    const actualTrolleyPos = trolleyPos || [
      pPos[0] + Math.sin(actualYaw) * 0.95,
      pPos[1] - 1.5,
      pPos[2] + Math.cos(actualYaw) * 0.95,
    ];

    // Target basket center inside the shopping trolley
    const basketOffsetX = -Math.sin(actualYaw) * 0.04;
    const basketOffsetZ = -Math.cos(actualYaw) * 0.04;
    const tx = actualTrolleyPos[0] + basketOffsetX;
    const ty = actualTrolleyPos[1] + 0.60;
    const tz = actualTrolleyPos[2] + basketOffsetZ;

    // Smooth horizontal position with easeOutCubic
    const p = easeOutCubic(t);
    const x = sx + (tx - sx) * p;
    const z = sz + (tz - sz) * p;

    // Parabolic vertical trajectory: graceful leap and deceleration into basket slot
    const arcHeight = 1.25;
    const y = sy + (ty - sy) * p + arcHeight * 4 * t * (1 - t);

    groupRef.current.position.set(x, y, z);
    // Scale item proportionally to match the trolley basket dimensions
    groupRef.current.scale.set(0.65, 0.65, 0.65);

    // Natural item tumbling in flight that aligns as it drops into the basket
    if (t < 0.70) {
      groupRef.current.rotation.x = Math.sin(t * Math.PI * 2) * 1.1;
      groupRef.current.rotation.y = t * Math.PI * 2.2;
      groupRef.current.rotation.z = Math.cos(t * Math.PI * 2) * 0.5;
    } else {
      const settleT = (t - 0.70) / 0.30;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, settleT);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, playerYaw || 0, settleT);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, settleT);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Real 3D Product Mesh in Genuine Product Color & Selected Packaging Artwork */}
      {anim.modelType === 'bottle' ? (
        <group position={[0, -0.06, 0]}>
          {/* Main Bottle Body */}
          <mesh position={[0, 0.09, 0]} geometry={sharedFlyGeometries.bottleBody} material={getFlyMaterial(productColor, 0.2, 0.1)} />
          {/* Tapered Shoulder */}
          <mesh position={[0, 0.21, 0]} geometry={sharedFlyGeometries.bottleShoulder} material={getFlyMaterial(productColor, 0.2, 0.1)} />
          {/* Neck & Cap */}
          <mesh position={[0, 0.25, 0]} geometry={sharedFlyGeometries.bottleCap} material={whiteCapMat} />
          {/* Printed Label Band with Genuine Product Artwork */}
          <mesh position={[0, 0.09, 0]} geometry={sharedFlyGeometries.bottleLabel} material={packagingMat} />
        </group>
      ) : anim.modelType === 'shirt' || anim.modelType === 'hanger' ? (
        <group>
          {/* Folded garment */}
          <mesh geometry={sharedFlyGeometries.garment} material={getFlyMaterial(productColor, 0.8, 0)} />
          {/* Contrasting Collar Band */}
          <mesh position={[0, 0.04, 0]} geometry={sharedFlyGeometries.collar} material={whiteCapMat} />
        </group>
      ) : anim.modelType === 'chocolate' || anim.modelType === 'bar' ? (
        <group>
          {/* Chocolate Bar Packet with Genuine Packaging */}
          <mesh geometry={sharedFlyGeometries.chocolate} material={packagingMat} />
          <mesh position={[-0.125, 0, 0]} geometry={sharedFlyGeometries.chocolateEdge} material={getFlyMaterial(productColor, 0.4, 0.2)} />
          <mesh position={[0.125, 0, 0]} geometry={sharedFlyGeometries.chocolateEdge} material={getFlyMaterial(productColor, 0.4, 0.2)} />
        </group>
      ) : (
        /* Box / Package (Atta, Cereals, Biscuits, Chocolates, Staples) */
        <group>
          <mesh geometry={sharedFlyGeometries.box} material={packagingMat} />
          {/* Front Clean Product Label Badge with Authentic Selected Package Texture */}
          <mesh position={[0, 0, 0.078]} geometry={sharedFlyGeometries.boxLabel} material={packagingMat} />
        </group>
      )}
    </group>
  );
};

export const FlyingProductArc: React.FC<FlyingArcsProps> = ({ trolleyPos, playerYaw }) => {
  const flyAnimations = useCartStore((state) => state.flyAnimations);

  return (
    <group>
      {flyAnimations.map((anim) => (
        <SingleFlyArc key={anim.id} anim={anim} trolleyPos={trolleyPos} playerYaw={playerYaw} />
      ))}
    </group>
  );
};
