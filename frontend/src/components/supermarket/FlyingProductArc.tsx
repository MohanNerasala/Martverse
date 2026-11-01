'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlyAnimation, useCartStore } from '@/store/useCartStore';
import { martRuntime } from '@/store/useMartStore';

interface FlyingArcsProps {
  trolleyPos?: [number, number, number];
  playerYaw?: number;
}

// EaseInOutCubic function for buttery smooth translation
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
  const duration = anim.duration || 480;
  const productColor = anim.color || '#3b82f6';

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

    // Target basket center inside the 1.18x shopping trolley
    const basketOffsetX = -Math.sin(actualYaw) * 0.04;
    const basketOffsetZ = -Math.cos(actualYaw) * 0.04;
    const tx = actualTrolleyPos[0] + basketOffsetX;
    const ty = actualTrolleyPos[1] + 0.65;
    const tz = actualTrolleyPos[2] + basketOffsetZ;

    // Smooth horizontal position with cubic easing
    const p = easeInOutCubic(t);
    const x = sx + (tx - sx) * p;
    const z = sz + (tz - sz) * p;

    // Realistic multi-stage vertical physics:
    // 1. Smooth lift off shelf (0.0 -> 0.30)
    // 2. High aerial glide towards trolley (0.30 -> 0.68)
    // 3. Gravitational basket drop (0.68 -> 0.92)
    // 4. Soft elastic landing settle (0.92 -> 1.0)
    let y: number;
    let scaleY = 1.0;
    let scaleXZ = 1.0;
    const highY = Math.max(sy, ty) + 1.5;

    if (t < 0.30) {
      const liftT = t / 0.30;
      const smoothLift = Math.sin(liftT * Math.PI * 0.5);
      y = sy + (highY - sy) * smoothLift;
    } else if (t < 0.68) {
      const glideT = (t - 0.30) / 0.38;
      y = highY + Math.sin(glideT * Math.PI) * 0.22;
    } else if (t < 0.92) {
      const dropT = (t - 0.68) / 0.24;
      // Accelerated gravitational drop curve
      const fallCurve = Math.pow(dropT, 2.0);
      y = highY - (highY - ty) * fallCurve;
      scaleY = 1.0 + Math.sin(dropT * Math.PI) * 0.12;
      scaleXZ = 1.0 - Math.sin(dropT * Math.PI) * 0.06;
    } else {
      // Gentle elastic settle upon resting in basket
      const bounceT = (t - 0.92) / 0.08;
      const bounceHeight = Math.sin(bounceT * Math.PI) * 0.05;
      y = ty + bounceHeight;
      scaleY = 1.0 - Math.sin(bounceT * Math.PI) * 0.08;
      scaleXZ = 1.0 + Math.sin(bounceT * Math.PI) * 0.05;
    }

    groupRef.current.position.set(x, y, z);
    // Scale item proportionally to match the 0.6x trolley basket dimensions
    groupRef.current.scale.set(scaleXZ * 0.65, scaleY * 0.65, scaleXZ * 0.65);

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
      {/* Real 3D Product Mesh in Genuine Product Color */}
      {anim.modelType === 'bottle' ? (
        <group position={[0, -0.06, 0]}>
          {/* Main Bottle Body */}
          <mesh position={[0, 0.09, 0]} geometry={sharedFlyGeometries.bottleBody} material={getFlyMaterial(productColor, 0.2, 0.1)} />
          {/* Tapered Shoulder */}
          <mesh position={[0, 0.21, 0]} geometry={sharedFlyGeometries.bottleShoulder} material={getFlyMaterial(productColor, 0.2, 0.1)} />
          {/* Neck & Cap */}
          <mesh position={[0, 0.25, 0]} geometry={sharedFlyGeometries.bottleCap} material={whiteCapMat} />
          {/* Printed Label Band */}
          <mesh position={[0, 0.09, 0]} geometry={sharedFlyGeometries.bottleLabel} material={whiteCapMat} />
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
          {/* Chocolate Bar Packet */}
          <mesh geometry={sharedFlyGeometries.chocolate} material={getFlyMaterial(productColor, 0.25, 0.15)} />
          <mesh position={[-0.125, 0, 0]} geometry={sharedFlyGeometries.chocolateEdge} material={getFlyMaterial(productColor, 0.4, 0.2)} />
          <mesh position={[0.125, 0, 0]} geometry={sharedFlyGeometries.chocolateEdge} material={getFlyMaterial(productColor, 0.4, 0.2)} />
        </group>
      ) : (
        /* Box / Package (Atta, Cereals, Biscuits, Chocolates, Staples) */
        <group>
          <mesh geometry={sharedFlyGeometries.box} material={getFlyMaterial(productColor, 0.3, 0.05)} />
          {/* Front Clean Product Label Badge */}
          <mesh position={[0, 0, 0.078]} geometry={sharedFlyGeometries.boxLabel} material={whiteLabelMat} />
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
