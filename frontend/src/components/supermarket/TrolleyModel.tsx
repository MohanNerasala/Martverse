'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import { martRuntime, useMartStore } from '@/store/useMartStore';
import { CartItem } from '@/types';

interface TrolleyProps {
  targetPos?: [number, number, number];
  targetYaw?: number;
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
  const isChocolate = item.modelType === 'chocolate' || item.modelType === 'bar' || /dairy\s*milk|chocolate|kitkat/i.test(item.productName);
  const isSnackOrSweet = /biscuit|bhujia|chocolate|silk|rocher|snack/i.test(item.productName);

  const color = item.color || (isBottle
    ? '#38bdf8'
    : isClothing
    ? '#818cf8'
    : isChocolate
    ? '#28074d'
    : isSnackOrSweet
    ? '#fbbf24'
    : '#34d399');

  if (isChocolate) {
    return (
      <group position={[px, py - 0.02, pz]} rotation={[0.04, index * 0.4, -0.02]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.018, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
        </mesh>
        <mesh position={[-0.082, 0, 0]}>
          <boxGeometry args={[0.005, 0.016, 0.076]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0.082, 0, 0]}>
          <boxGeometry args={[0.005, 0.016, 0.076]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  if (isBottle) {
    return (
      <group position={[px, py + 0.04, pz]} rotation={[0.08, index * 0.5, 0.04]}>
        {/* Solid Realistic Product Bottle */}
        <mesh castShadow>
          <cylinderGeometry args={[0.042, 0.048, 0.14, 14]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Tapered Shoulder */}
        <mesh position={[0, 0.085, 0]}>
          <cylinderGeometry args={[0.02, 0.042, 0.03, 14]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
        </mesh>
        {/* White Bottle Cap */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Printed Label */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.043, 0.043, 0.08, 14]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
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
        {/* Crisp Collar Seam */}
        <mesh position={[0, 0.028, 0]}>
          <boxGeometry args={[0.12, 0.006, 0.05]} />
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
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.08} />
      </mesh>
      {/* Front Faceplate */}
      <mesh position={[0, 0, 0.048]}>
        <boxGeometry args={[0.11, 0.09, 0.004]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export const TrolleyModel: React.FC<TrolleyProps> = ({ targetPos, targetYaw }) => {
  const trolleyRef = useRef<THREE.Group>(null);
  const items = useCartStore((state) => state.items);
  const flyAnimations = useCartStore((state) => state.flyAnimations);
  const resetTrigger = useMartStore((state) => state.resetTrigger);
  const teleportTrigger = useMartStore((state) => state.teleportTrigger);

  const initialPos = targetPos || martRuntime.playerPos;
  const initialYaw = targetYaw !== undefined ? targetYaw : martRuntime.playerYaw;

  const currentPos = useRef(
    new THREE.Vector3(
      initialPos[0] + Math.sin(initialYaw) * 0.95,
      initialPos[1] - 1.5,
      initialPos[2] + Math.cos(initialYaw) * 0.95
    )
  );
  const currentYaw = useRef(initialYaw);
  const basketBump = useRef(0);

  // Instant snap on reset to original entrance position
  useEffect(() => {
    if (resetTrigger === 0) return;
    currentPos.current.set(0, 0, -19.05);
    currentYaw.current = 0;
    if (trolleyRef.current) {
      trolleyRef.current.position.set(0, 0, -19.05);
      trolleyRef.current.rotation.y = Math.PI;
    }
  }, [resetTrigger]);

  // Instant snap on teleport / auto-navigation to product shelf
  useEffect(() => {
    if (teleportTrigger === 0) return;
    const actualPos = martRuntime.playerPos;
    const actualYaw = martRuntime.playerYaw ?? 0;
    const offsetX = Math.sin(actualYaw) * 0.95;
    const offsetZ = Math.cos(actualYaw) * 0.95;
    currentPos.current.set(actualPos[0] + offsetX, actualPos[1] - 1.5, actualPos[2] + offsetZ);
    currentYaw.current = actualYaw;
    if (trolleyRef.current) {
      trolleyRef.current.position.copy(currentPos.current);
      trolleyRef.current.rotation.y = actualYaw + Math.PI;
    }
  }, [teleportTrigger]);

  useFrame((_, delta) => {
    if (!trolleyRef.current) return;

    const actualPos = targetPos || martRuntime.playerPos;
    let actualYaw = targetYaw !== undefined ? targetYaw : martRuntime.playerYaw;

    // Follow smoothly in front of the player at the exact same position with larger realistic 1.18x scale
    const offsetX = Math.sin(actualYaw) * 0.95;
    const offsetZ = Math.cos(actualYaw) * 0.95;
    let desiredX = actualPos[0] + offsetX;
    const desiredY = actualPos[1] - 1.5;
    let desiredZ = actualPos[2] + offsetZ;

    // Strict Shelf & Obstacle Clamping: Trolley mesh NEVER enters inside shelf racks, edges, or balustrades
    const currentFloor = actualPos[1] > 4.5 ? 2 : 1;
    const cartHalfW = 0.46;
    const cartHalfD = 0.58;

    // 1. Store Outer Perimeter Walls Clamping
    desiredX = THREE.MathUtils.clamp(desiredX, -17.0 + cartHalfW, 17.0 - cartHalfW);
    desiredZ = THREE.MathUtils.clamp(desiredZ, -24.4 + cartHalfD, 24.4 - cartHalfD);

    // 2. Strict Escalator lateral & side containment:
    // Escalator centerline is at x = 14.70.
    const isOnEscalatorRamp =
      actualPos[2] >= -7.4 &&
      actualPos[2] <= 5.4 &&
      Math.abs(actualPos[0] - 14.7) < 1.2;

    if (isOnEscalatorRamp) {
      // Trolley is locked strictly to escalator center line x = 14.70 while on the moving ramp
      desiredX = 14.70;
      const isAscending = Math.cos(actualYaw) >= -0.2;
      actualYaw = isAscending ? 0 : Math.PI;
    } else {
      // Escalator side structure on Floor 1: impenetrable barrier from aisle 5 side (x < 13.5)
      if (currentFloor === 1 && desiredZ >= -7.4 && desiredZ <= 5.4) {
        if (actualPos[0] < 13.8) {
          desiredX = Math.min(desiredX, 13.2 - cartHalfW);
        }
      }

      // Floor 2 Atrium Opening Guardrails
      if (currentFloor === 2) {
        // Left side glass guardrail (x = 13.2, z between -6.6 and 5.4)
        if (desiredZ >= -6.6 - cartHalfD && desiredZ <= 5.4 + cartHalfD && actualPos[0] < 13.5) {
          desiredX = Math.min(desiredX, 13.2 - cartHalfW);
        }
        // South back glass guardrail (z = -6.5, x between 13.2 and 16.5)
        if (desiredX >= 13.2 - cartHalfW && desiredX <= 16.5 + cartHalfW && actualPos[2] < -6.3) {
          desiredZ = Math.min(desiredZ, -6.6 - cartHalfD);
        }
      }

      // 3. Physical Shelf Rows Obstacle Clamping
      const aisleXs =
        currentFloor === 1
          ? [-10, -5, 0, 5, 10]
          : [-11.0, -6.5, -2.0, 2.5, 7.0, 11.5];

      for (const ax of aisleXs) {
        const boxMinX = ax - 0.95 - cartHalfW;
        const boxMaxX = ax + 0.95 + cartHalfW;
        const boxMinZ = -12.4 - cartHalfD;
        const boxMaxZ = 12.4 + cartHalfD;

        if (desiredX > boxMinX && desiredX < boxMaxX && desiredZ > boxMinZ && desiredZ < boxMaxZ) {
          const dLeft = desiredX - boxMinX;
          const dRight = boxMaxX - desiredX;
          const dBack = desiredZ - boxMinZ;
          const dFront = boxMaxZ - desiredZ;
          const minD = Math.min(dLeft, dRight, dBack, dFront);

          if (minD === dBack) desiredZ = boxMinZ;
          else if (minD === dFront) desiredZ = boxMaxZ;
          else if (minD === dLeft) desiredX = boxMinX;
          else desiredX = boxMaxX;
        }
      }

      // 4. Floor 1 Billing Counters Zone (Spacious 3.8m spacing between desks)
      if (currentFloor === 1) {
        for (const cx of [-3.8, 0, 3.8]) {
          const deskMinX = cx - 0.68 - cartHalfW;
          const deskMaxX = cx + 0.68 + cartHalfW;
          const deskMinZ = 16.4 - cartHalfD;
          const deskMaxZ = 19.6 + cartHalfD;

          if (desiredX > deskMinX && desiredX < deskMaxX && desiredZ > deskMinZ && desiredZ < deskMaxZ) {
            const dLeft = desiredX - deskMinX;
            const dRight = deskMaxX - desiredX;
            const dBack = desiredZ - deskMinZ;
            const dFront = deskMaxZ - desiredZ;
            const minD = Math.min(dLeft, dRight, dBack, dFront);

            if (minD === dBack) desiredZ = deskMinZ;
            else if (minD === dFront) desiredZ = deskMaxZ;
            else if (minD === dLeft) desiredX = deskMinX;
            else desiredX = deskMaxX;
          }
        }
      }
    }

    // Fast teleport recovery (e.g. floor change or reset)
    const distToTarget = currentPos.current.distanceTo(new THREE.Vector3(desiredX, desiredY, desiredZ));
    if (distToTarget > 3.5) {
      currentPos.current.set(desiredX, desiredY, desiredZ);
      currentYaw.current = actualYaw;
    }

    // Check if an incoming 3D item is landing to trigger physical suspension compression bump!
    const isLanding = flyAnimations.some((a) => {
      const elapsed = Date.now() - a.createdAt;
      const d = a.duration || 1100;
      return elapsed > d * 0.75 && elapsed < d * 0.98;
    });

    if (isLanding) {
      basketBump.current = 0.04;
    }
    basketBump.current = THREE.MathUtils.damp(basketBump.current, 0, 10, delta);

    // Smooth lerp movement with responsive dampening (rate 12/14 for silky smooth motion)
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, desiredX, 12, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, desiredY - basketBump.current, 14, delta);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, desiredZ, 12, delta);

    // Smooth yaw rotation towards player direction
    currentYaw.current = THREE.MathUtils.damp(currentYaw.current, actualYaw, 14, delta);

    // Strict final containment pass on currentPos so the cart NEVER clips even mid-lerp
    if (isOnEscalatorRamp) {
      currentPos.current.x = 14.70;
    } else {
      currentPos.current.x = THREE.MathUtils.clamp(currentPos.current.x, -16.8 + cartHalfW, 16.8 - cartHalfW);
      currentPos.current.z = THREE.MathUtils.clamp(currentPos.current.z, -24.2 + cartHalfD, 24.2 - cartHalfD);
      if (currentFloor === 1 && currentPos.current.z >= -7.4 && currentPos.current.z <= 5.4) {
        if (currentPos.current.x < 13.8) {
          currentPos.current.x = Math.min(currentPos.current.x, 13.2 - cartHalfW);
        }
      }
    }

    trolleyRef.current.position.copy(currentPos.current);
    trolleyRef.current.rotation.y = currentYaw.current + Math.PI;
  });

  // Calculate items to display inside the basket (capped at 16 for performance)
  // During 3D billing scanning, items smoothly leave the basket as they float to the conveyor bench
  const billingPhase = useBillingStore((state) => state.phase);
  const billingCurrentIndex = useBillingStore((state) => state.currentIndex);

  const displayItems = items.flatMap((it) => Array(Math.min(it.quantity, 3)).fill(it)).slice(0, 16);
  const itemsInBasket = billingPhase === 'scanning'
    ? displayItems.slice(Math.min(displayItems.length, billingCurrentIndex))
    : (['review', 'checkout_details', 'processing', 'success_popup'].includes(billingPhase)
      ? []
      : displayItems);

  return (
    <group ref={trolleyRef} scale={[1.18, 1.18, 1.18]}>
      {/* Soft Under-Cart Icy Blue Ambient Light */}
      <pointLight position={[0, 0.3, 0]} color="#38bdf8" intensity={0.35} distance={1.4} decay={2} />

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
        {itemsInBasket.map((item, idx) => (
          <TrolleyProductItem key={`trolley-item-${item.id}-${idx}`} item={item} index={idx} />
        ))}
      </group>
    </group>
  );
};
