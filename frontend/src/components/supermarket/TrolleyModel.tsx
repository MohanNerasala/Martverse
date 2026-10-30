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

  // Wheel physics & rotation tracking
  const prevTrolleyPos = useRef(new THREE.Vector3().copy(currentPos.current));
  const prevYaw = useRef(initialYaw);
  const wheelRollRef = useRef(0);
  const casterSwivelRef = useRef(0);
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Group>(null);
  const rearRightWheelRef = useRef<THREE.Group>(null);
  const frontLeftCasterRef = useRef<THREE.Group>(null);
  const frontRightCasterRef = useRef<THREE.Group>(null);

  // Instant snap on reset to original entrance position
  useEffect(() => {
    if (resetTrigger === 0) return;
    currentPos.current.set(0, 0, -19.05);
    prevTrolleyPos.current.set(0, 0, -19.05);
    currentYaw.current = 0;
    prevYaw.current = 0;
    wheelRollRef.current = 0;
    casterSwivelRef.current = 0;
    if (trolleyRef.current) {
      trolleyRef.current.position.set(0, 0, -19.05);
      trolleyRef.current.rotation.set(0, Math.PI, 0);
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
    prevTrolleyPos.current.copy(currentPos.current);
    currentYaw.current = actualYaw;
    prevYaw.current = actualYaw;
    if (trolleyRef.current) {
      trolleyRef.current.position.copy(currentPos.current);
      trolleyRef.current.rotation.set(0, actualYaw + Math.PI, 0);
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

    // Smooth lerp movement with responsive dampening (rate 22 for silky smooth motion)
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, desiredX, 22, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, desiredY - basketBump.current, 18, delta);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, desiredZ, 22, delta);

    // Calculate forward motion direction relative to trolley heading
    const prevP = prevTrolleyPos.current;
    const currP = currentPos.current;
    const dx = currP.x - prevP.x;
    const dz = currP.z - prevP.z;

    // Project displacement onto cart forward vector (-sin(yaw), -cos(yaw))
    const fwdX = -Math.sin(currentYaw.current);
    const fwdZ = -Math.cos(currentYaw.current);
    const forwardStep = dx * fwdX + dz * fwdZ;

    // Wheel radius = 0.07m
    wheelRollRef.current += forwardStep / 0.07;
    prevTrolleyPos.current.copy(currP);

    // Dynamic front caster swivel based on turning angular velocity
    let diffYaw = actualYaw - currentYaw.current;
    while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
    while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

    const turningRate = delta > 0.0001 ? (currentYaw.current - prevYaw.current) / delta : 0;
    prevYaw.current = currentYaw.current;
    const targetSwivel = THREE.MathUtils.clamp(-turningRate * 0.15, -0.55, 0.55);
    casterSwivelRef.current = THREE.MathUtils.damp(casterSwivelRef.current, targetSwivel, 14, delta);

    // Shortest-path circular yaw dampening towards player direction
    currentYaw.current += diffYaw * (1 - Math.exp(-22 * delta));

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

    // Subtle realistic inertial banking on turns
    const rollTilt = THREE.MathUtils.clamp(-turningRate * 0.02, -0.04, 0.04);
    trolleyRef.current.rotation.z = THREE.MathUtils.damp(trolleyRef.current.rotation.z, rollTilt, 12, delta);

    // Update wheel rotations
    if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x = wheelRollRef.current;
    if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x = wheelRollRef.current;
    if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x = wheelRollRef.current;
    if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x = wheelRollRef.current;

    if (frontLeftCasterRef.current) frontLeftCasterRef.current.rotation.y = casterSwivelRef.current;
    if (frontRightCasterRef.current) frontRightCasterRef.current.rotation.y = casterSwivelRef.current;
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
      {/* Soft Under-Cart Luminous Glow & Point Light */}
      <pointLight position={[0, 0.25, 0]} color="#38bdf8" intensity={0.5} distance={1.8} decay={2} />

      {/* Subtle Cyan/Sapphire Ambient Ground Glow Decal */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 1.35]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* --- Trolley Base Chassis (Polished Mirror Chrome) --- */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 0.05, 1.0]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* 4 Realistic Rolling Wheels with Swivel Front Casters */}
      {/* Front Left Caster & Rolling Wheel */}
      <group position={[-0.32, 0.08, -0.4]}>
        <group ref={frontLeftCasterRef}>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.06]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
          <group ref={frontLeftWheelRef}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.054, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Front Right Caster & Rolling Wheel */}
      <group position={[0.32, 0.08, -0.4]}>
        <group ref={frontRightCasterRef}>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.06]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
          <group ref={frontRightWheelRef}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.054, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Rear Left Rolling Wheel */}
      <group position={[-0.32, 0.08, 0.4]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.08, 0.06]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        <group ref={rearLeftWheelRef}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.054, 12]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Rear Right Rolling Wheel */}
      <group position={[0.32, 0.08, 0.4]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.08, 0.06]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        <group ref={rearRightWheelRef}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.054, 12]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>

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
