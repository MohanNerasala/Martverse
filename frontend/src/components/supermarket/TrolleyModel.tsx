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

  const isBottle = /oil|shampoo|liquid|wash|dishwash/i.test(item.productName);
  const isClothing = /shirt|polo|kurta|saree|dress|jeans|apparel/i.test(item.productName) || !!item.size;
  const isSnackOrSweet = /biscuit|bhujia|chocolate|silk|rocher|snack/i.test(item.productName);

  const color = isBottle
    ? '#06b6d4'
    : isClothing
    ? '#ec4899'
    : isSnackOrSweet
    ? '#f59e0b'
    : '#10b981';

  if (isBottle) {
    return (
      <group position={[px, py + 0.04, pz]} rotation={[0.08, index * 0.5, 0.04]}>
        {/* Bottle Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.16, 12]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Bottle Cap */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
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
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        {/* Label/Stripe */}
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[0.13, 0.005, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // Grocery Box / Carton (Atta, Biscuits, Cereal, Chocolate, etc.)
  return (
    <group position={[px, py + 0.02, pz]} rotation={[0, index * 0.4, index % 2 === 0 ? 0.05 : -0.05]}>
      <mesh castShadow>
        <boxGeometry args={[0.13, 0.12, 0.09]} />
        <meshStandardMaterial color={color} roughness={0.4} />
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
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1] - 1.5, targetPos[2] - 1.8));
  const currentYaw = useRef(targetYaw);

  useFrame((_, delta) => {
    if (!trolleyRef.current) return;

    // Follow smoothly behind the player at an offset based on player yaw
    const offsetX = -Math.sin(targetYaw) * 1.5;
    const offsetZ = -Math.cos(targetYaw) * 1.5;
    const desiredX = targetPos[0] + offsetX;
    const desiredY = targetPos[1] - 1.5; // floor level (0 on Floor 1, 5.0 on Floor 2)
    const desiredZ = targetPos[2] + offsetZ;

    // Smooth lerp movement
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, desiredX, 7, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, desiredY, 10, delta);
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
      {/* --- Trolley Base Chassis --- */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 0.05, 1.0]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 4 Wheels with metal brackets */}
      {[
        [-0.32, 0.08, -0.4],
        [0.32, 0.08, -0.4],
        [-0.32, 0.08, 0.4],
        [0.32, 0.08, 0.4],
      ].map(([x, y, z], idx) => (
        <group key={`wheel-${idx}`} position={[x, y, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Upright Support Struts */}
      <mesh position={[-0.3, 0.55, 0.45]} rotation={[0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.85, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 0.55, 0.45]} rotation={[0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.85, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* --- Wire Mesh Basket Walls --- */}
      {/* Bottom of basket */}
      <mesh position={[0, 0.5, 0.05]} castShadow>
        <boxGeometry args={[0.66, 0.02, 0.88]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} wireframe />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-0.33, 0.72, 0.05]} castShadow>
        <boxGeometry args={[0.02, 0.44, 0.88]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} wireframe />
      </mesh>
      {/* Right Wall */}
      <mesh position={[0.33, 0.72, 0.05]} castShadow>
        <boxGeometry args={[0.02, 0.44, 0.88]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} wireframe />
      </mesh>
      {/* Front Wall */}
      <mesh position={[0, 0.72, -0.39]} castShadow>
        <boxGeometry args={[0.66, 0.44, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} wireframe />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 0.72, 0.49]} castShadow>
        <boxGeometry args={[0.66, 0.44, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} wireframe />
      </mesh>

      {/* --- Red Plastic Handlebar (DMart Style) --- */}
      <group position={[0, 0.98, 0.55]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.72, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        {/* Handle brackets */}
        <mesh position={[-0.32, -0.06, -0.03]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0.32, -0.06, -0.03]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
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
