'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@/types';

interface TrolleyProps {
  targetPos: [number, number, number];
  targetYaw: number;
}

const TrolleyProductItem: React.FC<{ item: CartItem; index: number }> = ({ item, index }) => {
  const col = index % 3;
  const row = Math.floor(index / 3) % 4;
  const layer = Math.floor(index / 12);
  const px = (col - 1) * 0.18 + Math.sin(index * 1.5) * 0.02;
  const pz = (row - 1.5) * 0.18 + Math.cos(index * 1.5) * 0.02;
  const py = 0.06 + layer * 0.1;

  const isBottle = item.modelType === 'bottle' || /oil|shampoo|liquid|wash|dishwash/i.test(item.productName);
  const isClothing = item.modelType === 'shirt' || item.modelType === 'hanger' || /shirt|polo|kurta|saree|dress|jeans|apparel/i.test(item.productName) || !!item.size;
  const isSnackOrSweet = /biscuit|bhujia|chocolate|silk|rocher|snack/i.test(item.productName);

  const color = item.color || (isBottle
    ? '#38bdf8'
    : isClothing
    ? '#818cf8'
    : isSnackOrSweet
    ? '#fbbf24'
    : '#34d399');

  if (isBottle) {
    return (
      <group position={[px, py + 0.04, pz]} rotation={[0.08, index * 0.5, 0.04]}>
        {/* Solid Realistic Product Bottle */}
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.16, 12]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
        </mesh>
        {/* White Bottle Cap */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (isClothing) {
    return (
      <group position={[px, py, pz]} rotation={[0, index * 0.3, 0]}>
        {/* Folded garment */}
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.05, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* White Stripe */}
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[0.13, 0.005, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  // Grocery Box / Carton (Atta, Biscuits, Cereal, Chocolate, etc.)
  return (
    <group position={[px, py + 0.02, pz]} rotation={[0, index * 0.4, index % 2 === 0 ? 0.05 : -0.05]}>
      <mesh castShadow>
        <boxGeometry args={[0.13, 0.12, 0.09]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.046]}>
        <planeGeometry args={[0.11, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export const TrolleyModel: React.FC<TrolleyProps> = ({ targetPos, targetYaw }) => {
  const trolleyRef = useRef<THREE.Group>(null);
  const items = useCartStore((state) => state.items);
  const flyAnimations = useCartStore((state) => state.flyAnimations);
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1] - 1.5, targetPos[2] - 1.8));
  const currentYaw = useRef(targetYaw);
  const basketBump = useRef(0);

  useFrame((_, delta) => {
    if (!trolleyRef.current) return;

    // Follow smoothly behind the player at an offset based on player yaw
    const offsetX = -Math.sin(targetYaw) * 1.5;
    const offsetZ = -Math.cos(targetYaw) * 1.5;
    const desiredX = targetPos[0] + offsetX;
    const desiredY = targetPos[1] - 1.5;
    const desiredZ = targetPos[2] + offsetZ;

    // Check if an incoming 3D item is landing to trigger physical suspension compression bump!
    const isLanding = flyAnimations.some((a) => {
      const elapsed = Date.now() - a.createdAt;
      const d = a.duration || 1100;
      return elapsed > d * 0.75 && elapsed < d * 0.98;
    });

    if (isLanding) {
      basketBump.current = 0.05;
    }
    basketBump.current = THREE.MathUtils.damp(basketBump.current, 0, 8, delta);

    // Smooth lerp movement with responsive dampening
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, desiredX, 7, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, desiredY - basketBump.current, 10, delta);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, desiredZ, 7, delta);

    // Smooth yaw rotation towards player direction
    currentYaw.current = THREE.MathUtils.damp(currentYaw.current, targetYaw, 8, delta);

    trolleyRef.current.position.copy(currentPos.current);
    trolleyRef.current.rotation.y = currentYaw.current;
  });

  // Calculate items to display inside the basket (capped at 16 for performance)
  const displayItems = items.flatMap((it) => Array(Math.min(it.quantity, 3)).fill(it)).slice(0, 16);

  return (
    <group ref={trolleyRef}>
      {/* Soft Under-Cart Icy Blue Ambient Light */}
      <pointLight position={[0, 0.3, 0]} color="#38bdf8" intensity={0.4} distance={1.8} decay={2} />

      {/* --- Trolley Base Chassis (Polished Mirror Chrome) --- */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 0.05, 1.0]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* 4 Wheels with Chrome Brackets */}
      {[
        [-0.32, 0.08, -0.4],
        [0.32, 0.08, -0.4],
        [-0.32, 0.08, 0.4],
        [0.32, 0.08, 0.4],
      ].map(([x, y, z], idx) => (
        <group key={`wheel-${idx}`} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.06]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Upright Support Struts (Mirror Chrome) */}
      <mesh position={[-0.3, 0.55, 0.45]} rotation={[0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.85, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.3, 0.55, 0.45]} rotation={[0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.85, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* --- White & Icy Blue Glassy Basket --- */}
      {/* Bottom of basket (Wire Mesh Chrome) */}
      <mesh position={[0, 0.5, 0.05]} castShadow>
        <boxGeometry args={[0.66, 0.02, 0.88]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} wireframe />
      </mesh>

      {/* Left Wall - Icy Blue Frosted Glass Panel with Chrome Top Rim */}
      <group position={[-0.33, 0.72, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.02, 0.44, 0.88]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.4}
            roughness={0.08}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.88, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Right Wall - Icy Blue Frosted Glass Panel with Chrome Top Rim */}
      <group position={[0.33, 0.72, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.02, 0.44, 0.88]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.4}
            roughness={0.08}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.88, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Front Wall - Frosted Glass Panel */}
      <group position={[0, 0.72, -0.39]}>
        <mesh castShadow>
          <boxGeometry args={[0.66, 0.44, 0.02]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.4}
            roughness={0.08}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.66, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Back Wall - Frosted Glass Panel */}
      <group position={[0, 0.72, 0.49]}>
        <mesh castShadow>
          <boxGeometry args={[0.66, 0.44, 0.02]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.4}
            roughness={0.08}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.66, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* --- Ergonomic Electric Sapphire Blue Handlebar --- */}
      <group position={[0, 0.98, 0.55]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.72, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* White Grips on Left & Right */}
        <mesh position={[-0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.12, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.12, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Handle Chrome Brackets */}
        <mesh position={[-0.32, -0.06, -0.03]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0.32, -0.06, -0.03]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* --- Live Products inside Trolley Basket --- */}
      <group position={[0, 0.55, 0.05]}>
        {displayItems.map((item, idx) => (
          <TrolleyProductItem key={`trolley-item-${item.id}-${idx}`} item={item} index={idx} />
        ))}
      </group>
    </group>
  );
};
