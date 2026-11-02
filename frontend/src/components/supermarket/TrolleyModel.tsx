'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import { martRuntime, useMartStore } from '@/store/useMartStore';
import { CartItem } from '@/types';

interface TrolleyProps {
  targetPos?: [number, number, number];
  targetYaw?: number;
}

// Pre-allocated shared geometries for all trolley basket items (eliminates 1,000+ GC geometry allocations per add)
const sharedTrolleyGeometries = {
  boxChocolate: new THREE.BoxGeometry(0.16, 0.018, 0.08),
  boxChocolateEdge: new THREE.BoxGeometry(0.005, 0.016, 0.076),
  cylBottleBody: new THREE.CylinderGeometry(0.042, 0.048, 0.14, 12),
  cylBottleShoulder: new THREE.CylinderGeometry(0.02, 0.042, 0.03, 12),
  cylBottleCap: new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10),
  cylBottleLabel: new THREE.CylinderGeometry(0.043, 0.043, 0.08, 12),
  boxGarment: new THREE.BoxGeometry(0.16, 0.05, 0.16),
  boxCollar: new THREE.BoxGeometry(0.12, 0.006, 0.05),
  boxCarton: new THREE.BoxGeometry(0.13, 0.12, 0.09),
  boxFaceplate: new THREE.BoxGeometry(0.11, 0.09, 0.004),
};

// Global material cache to completely eliminate WebGL shader compilations and GC pauses
const trolleyMaterialCache = new Map<string, THREE.MeshStandardMaterial>();
function getTrolleyMaterial(color: string, roughness = 0.3, metalness = 0.1): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}_${metalness}`;
  let mat = trolleyMaterialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness,
    });
    trolleyMaterialCache.set(key, mat);
  }
  return mat;
}
const sharedWhiteCapMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
const sharedWhiteLabelMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

// Maximum visible 3D items displayed inside the basket (Neat, clean 3x4 layout that never overflows or lags)
const MAX_BASKET_DISPLAY_ITEMS = 12;

// Strict Physical Shelf Obstacle Bounds for 10 Hypermarket Aisles & Right Wall Refrigerators
const SHELF_OBSTACLES_FLOOR1 = [
  { minX: -25.35, maxX: -23.25, minZ: -16.6, maxZ: 16.6 }, // Aisle 1
  { minX: -19.95, maxX: -17.85, minZ: -16.6, maxZ: 16.6 }, // Aisle 2
  { minX: -14.55, maxX: -12.45, minZ: -16.6, maxZ: 16.6 }, // Aisle 3
  { minX: -9.15, maxX: -7.05, minZ: -16.6, maxZ: 16.6 },   // Aisle 4
  { minX: -3.75, maxX: -1.65, minZ: -16.6, maxZ: 16.6 },   // Aisle 5
  { minX: 1.65, maxX: 3.75, minZ: -16.6, maxZ: 16.6 },     // Aisle 6
  { minX: 7.05, maxX: 9.15, minZ: -16.6, maxZ: 16.6 },     // Aisle 7
  { minX: 12.45, maxX: 14.55, minZ: -16.6, maxZ: 16.6 },   // Aisle 8
  { minX: 17.85, maxX: 19.95, minZ: -16.6, maxZ: 16.6 },   // Aisle 9
  { minX: 23.25, maxX: 25.35, minZ: -16.6, maxZ: 16.6 },   // Aisle 10
  // Commercial Refrigerator Reach-in Sections on Right Wall
  { minX: 33.20, maxX: 35.80, minZ: -14.20, maxZ: 14.20 },
];

const SHELF_OBSTACLES_FLOOR2 = [
  { minX: -11.96, maxX: -10.04, minZ: -12.1, maxZ: 12.1 }, // Aisle 6
  { minX: -7.46, maxX: -5.54, minZ: -12.1, maxZ: 12.1 },  // Aisle 7
  { minX: -2.96, maxX: -1.04, minZ: -12.1, maxZ: 12.1 },  // Aisle 8
  { minX: 1.54, maxX: 3.46, minZ: -12.1, maxZ: 12.1 },    // Aisle 9
  { minX: 6.04, maxX: 7.96, minZ: -12.1, maxZ: 12.1 },    // Aisle 10
  { minX: 10.54, maxX: 12.46, minZ: -12.1, maxZ: 12.1 },  // Aisle 11
];

const TrolleyProductItem = React.memo<{ item: CartItem; index: number }>(({ item, index }) => {
  // Clean 3x4 grid inside the shopping cart: 3 columns across X, 4 rows across Z
  const col = index % 3;
  const row = Math.floor(index / 3);
  const px = (col - 1) * 0.19;
  const pz = (row - 1.5) * 0.19;
  const py = 0.05;

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

  const mainMat = getTrolleyMaterial(color);

  if (isChocolate) {
    return (
      <group position={[px, py - 0.02, pz]} rotation={[0.04, (index * 0.35) % 0.6 - 0.3, -0.02]}>
        <mesh geometry={sharedTrolleyGeometries.boxChocolate} material={mainMat} />
        <mesh position={[-0.082, 0, 0]} geometry={sharedTrolleyGeometries.boxChocolateEdge} material={getTrolleyMaterial(color, 0.4, 0.2)} />
        <mesh position={[0.082, 0, 0]} geometry={sharedTrolleyGeometries.boxChocolateEdge} material={getTrolleyMaterial(color, 0.4, 0.2)} />
      </group>
    );
  }

  if (isBottle) {
    return (
      <group position={[px, py + 0.04, pz]} rotation={[0.06, (index * 0.4) % 0.8 - 0.4, 0.04]}>
        {/* Solid Realistic Product Bottle */}
        <mesh geometry={sharedTrolleyGeometries.cylBottleBody} material={mainMat} />
        {/* Tapered Shoulder */}
        <mesh position={[0, 0.085, 0]} geometry={sharedTrolleyGeometries.cylBottleShoulder} material={mainMat} />
        {/* White Bottle Cap */}
        <mesh position={[0, 0.11, 0]} geometry={sharedTrolleyGeometries.cylBottleCap} material={sharedWhiteCapMat} />
        {/* Printed Label */}
        <mesh position={[0, 0.01, 0]} geometry={sharedTrolleyGeometries.cylBottleLabel} material={sharedWhiteCapMat} />
      </group>
    );
  }

  if (isClothing) {
    return (
      <group position={[px, py, pz]} rotation={[0, (index * 0.3) % 0.6 - 0.3, 0]}>
        {/* Folded garment */}
        <mesh geometry={sharedTrolleyGeometries.boxGarment} material={getTrolleyMaterial(color, 0.8, 0)} />
        {/* Crisp Collar Seam */}
        <mesh position={[0, 0.028, 0]} geometry={sharedTrolleyGeometries.boxCollar} material={sharedWhiteCapMat} />
      </group>
    );
  }

  // Grocery Box / Carton (Atta, Biscuits, Cereal, Chocolate, etc.)
  return (
    <group position={[px, py + 0.02, pz]} rotation={[0, (index * 0.3) % 0.5 - 0.25, index % 2 === 0 ? 0.04 : -0.04]}>
      <mesh geometry={sharedTrolleyGeometries.boxCarton} material={mainMat} />
      {/* Front Faceplate */}
      <mesh position={[0, 0, 0.048]} geometry={sharedTrolleyGeometries.boxFaceplate} material={sharedWhiteLabelMat} />
    </group>
  );
});
TrolleyProductItem.displayName = 'TrolleyProductItem';

const staticTargetPos = new THREE.Vector3();

const TrolleyModelComponent: React.FC<TrolleyProps> = ({ targetPos, targetYaw }) => {
  const trolleyRef = useRef<THREE.Group>(null);
  const items = useCartStore((state) => state.items);
  const resetTrigger = useMartStore((state) => state.resetTrigger);
  const teleportTrigger = useMartStore((state) => state.teleportTrigger);
  const hasEnteredStore = useMartStore((state) => state.hasEnteredStore);

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

  // Snap to entrance position on store entry or intro reset
  useEffect(() => {
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
  }, [hasEnteredStore]);

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

    // Keep trolley completely stationary at the entrance while cinematic intro is active
    if (!useMartStore.getState().hasEnteredStore) {
      currentPos.current.set(0, 0, -19.05);
      prevTrolleyPos.current.set(0, 0, -19.05);
      currentYaw.current = 0;
      prevYaw.current = 0;
      wheelRollRef.current = 0;
      casterSwivelRef.current = 0;
      trolleyRef.current.position.set(0, 0, -19.05);
      trolleyRef.current.rotation.set(0, Math.PI, 0);
      return;
    }

    const actualPos = targetPos || martRuntime.playerPos;
    let actualYaw = targetYaw !== undefined ? targetYaw : martRuntime.playerYaw;

    // Follow smoothly in front of the player at the exact same position
    const offsetX = Math.sin(actualYaw) * 0.95;
    const offsetZ = Math.cos(actualYaw) * 0.95;
    let desiredX = actualPos[0] + offsetX;
    const desiredY = actualPos[1] - 1.5;
    let desiredZ = actualPos[2] + offsetZ;

    // Harmonize with 72m x 72m hypermarket bounds (PlayerController governs physical shelf collisions)
    desiredX = THREE.MathUtils.clamp(desiredX, -34.8, 34.8);
    desiredZ = THREE.MathUtils.clamp(desiredZ, -34.8, 34.8);

    // Strict Escalator lateral & side containment:
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
    staticTargetPos.set(desiredX, desiredY, desiredZ);
    const distToTarget = currentPos.current.distanceTo(staticTargetPos);
    if (distToTarget > 3.5) {
      currentPos.current.set(desiredX, desiredY, desiredZ);
      currentYaw.current = actualYaw;
    }

    // Responsive suspension bump when items are added to basket (Zero GC / zero slow searches)
    if (useCartStore.getState().flyAnimations.length > 0) {
      basketBump.current = 0.035;
    }
    basketBump.current = THREE.MathUtils.damp(basketBump.current, 0, 12, delta);

    // Instant zero-lag follow: Cart firmly locked to player hands at all times
    currentPos.current.set(desiredX, desiredY - basketBump.current, desiredZ);

    // Calculate forward motion direction relative to trolley heading
    const prevP = prevTrolleyPos.current;
    const currP = currentPos.current;
    const dx = currP.x - prevP.x;
    const dz = currP.z - prevP.z;

    // Project displacement onto cart forward vector (-sin(yaw), -cos(yaw))
    const fwdX = -Math.sin(actualYaw);
    const fwdZ = -Math.cos(actualYaw);
    const forwardStep = dx * fwdX + dz * fwdZ;

    // Wheel radius = 0.07m
    wheelRollRef.current += forwardStep / 0.07;
    prevTrolleyPos.current.copy(currP);

    // Dynamic front caster swivel based on turning angular velocity
    let diffYaw = actualYaw - prevYaw.current;
    while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
    while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

    const turningRate = delta > 0.0001 ? diffYaw / delta : 0;
    prevYaw.current = actualYaw;
    const targetSwivel = THREE.MathUtils.clamp(-turningRate * 0.15, -0.55, 0.55);
    casterSwivelRef.current = THREE.MathUtils.damp(casterSwivelRef.current, targetSwivel, 20, delta);

    currentYaw.current = actualYaw;

    trolleyRef.current.position.copy(currentPos.current);
    trolleyRef.current.rotation.y = actualYaw + Math.PI;

    // Keep trolley completely level and stable on the floor (no tilt/dimension distortions)
    trolleyRef.current.rotation.z = 0;

    // Update wheel rotations
    if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x = wheelRollRef.current;
    if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x = wheelRollRef.current;
    if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x = wheelRollRef.current;
    if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x = wheelRollRef.current;

    if (frontLeftCasterRef.current) frontLeftCasterRef.current.rotation.y = casterSwivelRef.current;
    if (frontRightCasterRef.current) frontRightCasterRef.current.rotation.y = casterSwivelRef.current;
  });

  // Calculate items to display inside the basket
  // During 3D billing scanning, each item leaves the basket the exact instant it lifts towards the conveyor bench
  const billingPhase = useBillingStore((state) => state.phase);
  const transferredToBenchCount = useBillingStore((state) => state.transferredToBenchCount);

  // Memoize displayed items up to 12 max to prevent performance degradation with large carts
  const displayItems = React.useMemo(() => {
    const list: CartItem[] = [];
    for (const it of items) {
      const q = it.quantity || 1;
      for (let i = 0; i < q; i++) {
        list.push(it);
        if (list.length >= MAX_BASKET_DISPLAY_ITEMS) break;
      }
      if (list.length >= MAX_BASKET_DISPLAY_ITEMS) break;
    }
    return list;
  }, [items]);

  const itemsInBasket = billingPhase === 'scanning'
    ? displayItems.slice(Math.min(displayItems.length, transferredToBenchCount))
    : (['review', 'checkout_details', 'processing', 'success_popup'].includes(billingPhase)
      ? []
      : displayItems);

  return (
    <group ref={trolleyRef} scale={[1.18, 1.18, 1.18]} raycast={() => null}>
      {/* ==============================================================
          AUTHENTIC COMMERCIAL SUPERMARKET SHOPPING TROLLEY (CHROME & STEEL)
          ============================================================== */}

      {/* --- 1. Lower Tubular Steel Chassis Frame --- */}
      {/* Left Longitudinal Chassis Rail */}
      <mesh position={[-0.28, 0.12, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.88, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
      </mesh>
      {/* Right Longitudinal Chassis Rail */}
      <mesh position={[0.28, 0.12, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.88, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
      </mesh>
      {/* Front Cross Tube */}
      <mesh position={[0, 0.12, -0.42]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.56, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
      </mesh>
      {/* Rear Cross Tube */}
      <mesh position={[0, 0.12, 0.42]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.58, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
      </mesh>
      {/* Lower Steel Wire Storage Tray for Bulk Items */}
      <mesh position={[0, 0.14, 0.02]}>
        <boxGeometry args={[0.52, 0.012, 0.74]} />
        <meshStandardMaterial color="#94a3b8" wireframe />
      </mesh>

      {/* --- 2. 4 Heavy-Duty Industrial Swivel Caster Wheels --- */}
      {/* Front Left Swivel Caster */}
      <group position={[-0.28, 0.07, -0.38]}>
        <group ref={frontLeftCasterRef}>
          {/* Chrome Swivel Fork Housing */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.022, 0.026, 0.04, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
          <mesh position={[0, 0.02, 0.01]}>
            <boxGeometry args={[0.042, 0.05, 0.03]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.18} />
          </mesh>
          {/* Rolling Wheel Assembly */}
          <group ref={frontLeftWheelRef}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.065, 0.034, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Chrome Wheel Center Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.032, 0.032, 0.038, 14]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Front Right Swivel Caster */}
      <group position={[0.28, 0.07, -0.38]}>
        <group ref={frontRightCasterRef}>
          {/* Chrome Swivel Fork Housing */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.022, 0.026, 0.04, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
          <mesh position={[0, 0.02, 0.01]}>
            <boxGeometry args={[0.042, 0.05, 0.03]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.18} />
          </mesh>
          {/* Rolling Wheel Assembly */}
          <group ref={frontRightWheelRef}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.065, 0.034, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Chrome Wheel Center Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.032, 0.032, 0.038, 14]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Rear Left Wheel */}
      <group position={[-0.29, 0.07, 0.38]}>
        {/* Fixed Chrome Wheel Bracket */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.042, 0.07, 0.035]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
        <group ref={rearLeftWheelRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.034, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.038, 14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        </group>
      </group>

      {/* Rear Right Wheel */}
      <group position={[0.29, 0.07, 0.38]}>
        {/* Fixed Chrome Wheel Bracket */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.042, 0.07, 0.035]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
        <group ref={rearRightWheelRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.034, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.038, 14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        </group>
      </group>

      {/* --- 3. Sturdy Diagonal Upright Tubular Support Struts --- */}
      {/* Left Main Upright */}
      <mesh position={[-0.29, 0.52, 0.40]} rotation={[0.16, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.82, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Right Main Upright */}
      <mesh position={[0.29, 0.52, 0.40]} rotation={[0.16, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.82, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Front Struts connecting chassis to basket front */}
      <mesh position={[-0.25, 0.32, -0.25]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.44, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
      </mesh>
      <mesh position={[0.25, 0.32, -0.25]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.44, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.14} />
      </mesh>

      {/* --- 4. Welded Chrome Steel Wire Mesh Basket --- */}
      {/* Wire Mesh Basket Floor Grid */}
      <mesh position={[0, 0.50, 0.04]}>
        <boxGeometry args={[0.58, 0.012, 0.84]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} wireframe />
      </mesh>
      {/* Solid Chrome Perimeter Floor Rim */}
      <mesh position={[0, 0.495, 0.04]}>
        <boxGeometry args={[0.59, 0.008, 0.85]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Top Perimeter Welded Steel Tube Rim (Angled Cart Taper) */}
      {/* Front Top Rim */}
      <mesh position={[0, 0.86, -0.38]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.56, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Rear Top Rim */}
      <mesh position={[0, 0.94, 0.46]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.62, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Left Top Rim */}
      <mesh position={[-0.295, 0.90, 0.04]} rotation={[-0.095, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.86, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Right Top Rim */}
      <mesh position={[0.295, 0.90, 0.04]} rotation={[-0.095, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.86, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* Wire Mesh Walls (Real Steel Wire Grids) */}
      {/* Left Wire Mesh Wall */}
      <mesh position={[-0.29, 0.70, 0.04]} rotation={[-0.095, 0, 0]}>
        <boxGeometry args={[0.008, 0.38, 0.84]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.16} wireframe />
      </mesh>
      {/* Right Wire Mesh Wall */}
      <mesh position={[0.29, 0.70, 0.04]} rotation={[-0.095, 0, 0]}>
        <boxGeometry args={[0.008, 0.38, 0.84]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.16} wireframe />
      </mesh>
      {/* Front Wire Mesh Wall */}
      <mesh position={[0, 0.68, -0.38]}>
        <boxGeometry args={[0.56, 0.36, 0.008]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.16} wireframe />
      </mesh>
      {/* Rear Wire Mesh Gate */}
      <mesh position={[0, 0.72, 0.46]}>
        <boxGeometry args={[0.58, 0.40, 0.008]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.16} wireframe />
      </mesh>

      {/* Fold-Out Rear Child Seat Flap (Indian Supermarket Red Plastic Accent) */}
      <group position={[0, 0.68, 0.38]}>
        {/* Child Seat Plastic Backrest */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.32, 0.22, 0.012]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.05} />
        </mesh>
        {/* Child Seat Bottom Flap */}
        <mesh position={[0, 0.01, -0.09]}>
          <boxGeometry args={[0.32, 0.012, 0.18]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.35} metalness={0.05} />
        </mesh>
      </group>

      {/* --- 5. Signature Commercial Red Supermarket Ergonomic Handle --- */}
      <group position={[0, 0.98, 0.52]}>
        {/* Main Commercial Red Plastic Handlebar Tube */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.024, 0.024, 0.66, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.05} />
        </mesh>
        {/* Printed White Center Brand Logo Plate */}
        <mesh position={[0, 0.016, 0]}>
          <boxGeometry args={[0.16, 0.010, 0.038]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
        </mesh>
        <Text
          position={[0, 0.022, 0]}
          fontSize={0.016}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          fontWeight="extrabold"
          letterSpacing={0.04}
        >
          MARTVERSE
        </Text>

        {/* Sturdy Chrome Diagonal Handle Mount Brackets */}
        <mesh position={[-0.30, -0.06, -0.03]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[0.028, 0.12, 0.032]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
        </mesh>
        <mesh position={[0.30, -0.06, -0.03]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[0.028, 0.12, 0.032]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
        </mesh>
      </group>

      {/* --- 6. Live Products inside Trolley Basket --- */}
      <group position={[0, 0.53, 0.04]}>
        {itemsInBasket.map((item, idx) => (
          <TrolleyProductItem key={`trolley-item-${item.id}-${idx}`} item={item} index={idx} />
        ))}
      </group>
    </group>
  );
};

export const TrolleyModel = React.memo(TrolleyModelComponent);
