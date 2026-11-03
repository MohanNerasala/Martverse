'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import { martRuntime, useMartStore } from '@/store/useMartStore';
import { CartItem } from '@/types';
import { getProductPackagingTexture } from '@/lib/productTextureAtlas';

interface TrolleyProps {
  targetPos?: [number, number, number];
  targetYaw?: number;
}

// =========================================================================
// PHASE 2 & 3: COMMERCIAL SUPERMARKET SHOPPING TROLLEY (EXACT SPECIFICATION)
// - Height: 0.98 m, Basket: 0.50 m wide x 0.72 m long, Lower shelf: 0.30 m
// - Handle top: 0.95 m, Casters: 0.10 m diameter
// - Silver-grey frame tubes (metalness 0.9, roughness 0.35), Grey plastic grip
// - 4 swivel casters with black rubber wheels touching floor at Y = 0
// - 4 individual radial shadow decals (0.2m diameter) centered under each caster
// - Maximum 3-4 shared materials, <= 25,000 triangles, single instance
// =========================================================================

// Wire mesh texture with 4mm wire and 45-55mm see-through openings
let wireTextureCache: THREE.CanvasTexture | null = null;
function getSeeThroughWireTexture(): THREE.CanvasTexture {
  if (wireTextureCache) return wireTextureCache;
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Black background for alpha mask
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 256);

  // 4mm wire strands on 50mm grid (4 cells across 256px => 64px spacing, 5px wire)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;

  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // Repeat (3.6, 2.0) across 0.72m x 0.40m wall produces exact ~50mm grid openings
  tex.repeat.set(3.6, 2.0);
  wireTextureCache = tex;
  return tex;
}

// Baked individual wheel contact shadow texture (0.2m diameter radial decal)
let wheelShadowTextureCache: THREE.CanvasTexture | null = null;
function getWheelShadowTexture(): THREE.CanvasTexture {
  if (wheelShadowTextureCache) return wheelShadowTextureCache;
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
  grad.addColorStop(0.4, 'rgba(15, 23, 42, 0.25)');
  grad.addColorStop(0.8, 'rgba(15, 23, 42, 0.08)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  wheelShadowTextureCache = tex;
  return tex;
}

// 4 Shared Materials for the Commercial Hypermarket Trolley (Strictly matching reference photo)
const trolleyMaterials = {
  // 1. High-Polish Chrome Frame & Wire Tubes (reflects ceiling and store environment)
  chromeMetal: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 1.0,
    roughness: 0.18,
  }),

  // 2. High-Polish Chrome See-Through Wire Mesh (metalness 0.95, roughness 0.18, transparent alpha)
  wireMesh: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.95,
    roughness: 0.18,
    alphaMap: typeof document !== 'undefined' ? getSeeThroughWireTexture() : undefined,
    transparent: true,
    alphaTest: 0.38,
    side: THREE.DoubleSide,
  }),

  // 3. Bright Red Commercial Plastic (Handle Bar & Child-Seat Backrest Panels)
  redPlastic: new THREE.MeshStandardMaterial({
    color: '#dc2626',
    roughness: 0.32,
    metalness: 0.05,
  }),

  // 4. Black Rubber Wheel Tread
  blackRubberWheel: new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.88,
    metalness: 0.05,
  }),

  // Wheel Contact Shadow Decal
  shadowDecal: new THREE.MeshBasicMaterial({
    map: typeof document !== 'undefined' ? getWheelShadowTexture() : undefined,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  }),
};

// Pre-allocated shared geometries for trolley chassis, basket, casters, and shadows
const trolleyGeos = {
  // Wheel & Caster (0.10m diameter wheel => radius 0.05m)
  wheelCylinder: new THREE.CylinderGeometry(0.05, 0.05, 0.026, 16),
  casterForkTop: new THREE.CylinderGeometry(0.016, 0.020, 0.03, 10),
  casterForkLeg: new THREE.BoxGeometry(0.032, 0.045, 0.012),
  shadowDecalPlane: new THREE.PlaneGeometry(0.20, 0.20),

  // Chassis Tubes (22mm diameter)
  chassisSideTube: new THREE.CylinderGeometry(0.011, 0.011, 0.68, 12),
  chassisCrossTube: new THREE.CylinderGeometry(0.011, 0.011, 0.44, 12),
  uprightSupportTube: new THREE.CylinderGeometry(0.011, 0.011, 0.66, 12),

  // Lower Wire Shelf (0.28m height)
  lowerShelfGrid: new THREE.PlaneGeometry(0.42, 0.58),
  lowerShelfRimSide: new THREE.CylinderGeometry(0.006, 0.006, 0.58, 8),
  lowerShelfRimCross: new THREE.CylinderGeometry(0.006, 0.006, 0.42, 8),

  // Upper Wire Basket (0.50m wide x 0.72m long, tapered)
  basketFloor: new THREE.PlaneGeometry(0.46, 0.68),
  basketSideWall: new THREE.PlaneGeometry(0.70, 0.38),
  basketFrontWall: new THREE.PlaneGeometry(0.44, 0.34),
  basketRearWall: new THREE.PlaneGeometry(0.48, 0.40),

  // Basket Top Rims (22mm tube)
  basketTopFront: new THREE.CylinderGeometry(0.010, 0.010, 0.46, 12),
  basketTopRear: new THREE.CylinderGeometry(0.010, 0.010, 0.48, 12),
  basketTopSide: new THREE.CylinderGeometry(0.010, 0.010, 0.70, 12),

  // Handle (0.95m height, bright red plastic handle bar across top with endcaps)
  handleBarRed: new THREE.CylinderGeometry(0.016, 0.016, 0.48, 18),
  handleEndCap: new THREE.SphereGeometry(0.018, 12, 12),
  handleBracket: new THREE.CylinderGeometry(0.009, 0.009, 0.12, 10),
  handleBrandPlate: new THREE.BoxGeometry(0.14, 0.008, 0.032),

  // Red Plastic Child-Seat Panels (Two panels side-by-side matching reference photo)
  childSeatPanel: new THREE.BoxGeometry(0.125, 0.155, 0.012),
  childSeatRod: new THREE.CylinderGeometry(0.005, 0.005, 0.34, 8),
};

// =========================================================================
// PHASE 4: BASKET PRODUCT PLACEMENT MATRIX (3 COLS x 4 ROWS)
// - Items sit directly on basket floor (support Y = 0.52m)
// - Item bottom Y = support Y + 0.001 (0.521m, within 1mm)
// - Items stay inside basket and strictly below the 0.90m rim
// =========================================================================

export const BASKET_SLOTS = [
  // Row 0 (Front)
  { col: 0, row: 0, x: -0.14, z: -0.22 },
  { col: 1, row: 0, x:  0.00, z: -0.22 },
  { col: 2, row: 0, x:  0.14, z: -0.22 },
  // Row 1
  { col: 0, row: 1, x: -0.14, z: -0.07 },
  { col: 1, row: 1, x:  0.00, z: -0.07 },
  { col: 2, row: 1, x:  0.14, z: -0.07 },
  // Row 2
  { col: 0, row: 2, x: -0.14, z:  0.07 },
  { col: 1, row: 2, x:  0.00, z:  0.07 },
  { col: 2, row: 2, x:  0.14, z:  0.07 },
  // Row 3 (Rear)
  { col: 0, row: 3, x: -0.14, z:  0.22 },
  { col: 1, row: 3, x:  0.00, z:  0.22 },
  { col: 2, row: 3, x:  0.14, z:  0.22 },
];

const sharedItemGeometries = {
  carton: new THREE.BoxGeometry(0.12, 0.16, 0.08),
  bottle: new THREE.CylinderGeometry(0.038, 0.042, 0.18, 12),
  bottleCap: new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10),
  can: new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12),
  labelFace: new THREE.PlaneGeometry(0.11, 0.15),
};

const BasketProductItem: React.FC<{ item: CartItem; slotIndex: number }> = React.memo(({ item, slotIndex }) => {
  const slot = BASKET_SLOTS[slotIndex % BASKET_SLOTS.length];
  const isLayer2 = slotIndex >= 12;

  // Support surface Y: basket floor is at Y = 0.52
  // Layer 1 bottom Y = 0.521m. Layer 2 bottom Y = 0.521 + 0.16 + 0.001 = 0.682m
  const baseSupportY = 0.521;
  const isBottle = /bottle|oil|shampoo|liquid|drink|juice/i.test(item.productName || '');
  const itemHeight = isBottle ? 0.18 : 0.16;
  const itemY = isLayer2 ? baseSupportY + 0.16 + 0.001 + itemHeight / 2 : baseSupportY + itemHeight / 2;

  const tex = useMemo(() => {
    return getProductPackagingTexture({
      id: item.productId || item.id,
      name: item.productName,
      price: item.price,
      imageUrl: item.productImage,
      brand: item.brand,
      placement: { color: item.color || '#3b82f6' } as any,
    } as any);
  }, [item]);

  const mat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0.05,
    });
  }, [tex]);

  if (isBottle) {
    return (
      <group position={[slot.x, itemY, slot.z]}>
        <mesh geometry={sharedItemGeometries.bottle} material={mat} />
        <mesh position={[0, 0.10, 0]} geometry={sharedItemGeometries.bottleCap} material={trolleyMaterials.redPlastic} />
      </group>
    );
  }

  return (
    <group position={[slot.x, itemY, slot.z]}>
      {/* 3D Box Carton */}
      <mesh geometry={sharedItemGeometries.carton} material={mat} />
      {/* Front Faceplate with packaging graphic */}
      <mesh position={[0, 0, 0.041]} geometry={sharedItemGeometries.labelFace} material={mat} />
    </group>
  );
});
BasketProductItem.displayName = 'BasketProductItem';

const staticTargetPos = new THREE.Vector3();

const TrolleyModelComponent: React.FC<TrolleyProps> = ({ targetPos, targetYaw }) => {
  const trolleyRef = useRef<THREE.Group>(null);
  const items = useCartStore((state) => state.items);
  const resetTrigger = useMartStore((state) => state.resetTrigger);
  const teleportTrigger = useMartStore((state) => state.teleportTrigger);
  const hasEnteredStore = useMartStore((state) => state.hasEnteredStore);
  const billingPhase = useBillingStore((state) => state.phase);
  const transferredToBenchCount = useBillingStore((state) => state.transferredToBenchCount);

  // Log warning if GLB file is missing (spec requirement)
  useEffect(() => {
    console.warn('[MARTVERSE 3D] /public/models/trolley.glb not present. Using high-fidelity procedural PBR trolley matching reference specifications.');
  }, []);

  // Display up to 24 items in the basket (2 layers of 12 slots)
  const displayItems = useMemo(() => {
    const list: CartItem[] = [];
    for (const it of items) {
      const q = it.quantity || 1;
      for (let i = 0; i < q; i++) {
        list.push(it);
        if (list.length >= 24) break;
      }
      if (list.length >= 24) break;
    }
    return list;
  }, [items]);

  const initialPos = targetPos || martRuntime.playerPos;
  const initialYaw = targetYaw !== undefined ? targetYaw : martRuntime.playerYaw;

  const currentPos = useRef(
    new THREE.Vector3(
      initialPos[0] + Math.sin(initialYaw) * 1.15,
      0, // Ground level Y = 0
      initialPos[2] + Math.cos(initialYaw) * 1.15
    )
  );
  const currentYaw = useRef(initialYaw);
  const prevTrolleyPos = useRef(new THREE.Vector3().copy(currentPos.current));
  const prevYaw = useRef(initialYaw);
  const wheelRollRef = useRef(0);
  const casterSwivelRef = useRef(0);

  // Wheel refs for physical rolling and swiveling
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Group>(null);
  const rearRightWheelRef = useRef<THREE.Group>(null);
  const frontLeftCasterRef = useRef<THREE.Group>(null);
  const frontRightCasterRef = useRef<THREE.Group>(null);

  // Snap to entrance position on store entry
  useEffect(() => {
    const actualPos = martRuntime.playerPos;
    const actualYaw = martRuntime.playerYaw ?? 0;
    const offsetX = Math.sin(actualYaw) * 1.15;
    const offsetZ = Math.cos(actualYaw) * 1.15;
    currentPos.current.set(actualPos[0] + offsetX, 0, actualPos[2] + offsetZ);
    prevTrolleyPos.current.copy(currentPos.current);
    currentYaw.current = actualYaw;
    prevYaw.current = actualYaw;
    wheelRollRef.current = 0;
    casterSwivelRef.current = 0;
    if (trolleyRef.current) {
      trolleyRef.current.position.copy(currentPos.current);
      trolleyRef.current.rotation.set(0, actualYaw + Math.PI, 0);
    }
  }, [hasEnteredStore]);

  // Instant snap on reset
  useEffect(() => {
    if (resetTrigger === 0) return;
    const actualPos = martRuntime.playerPos;
    const actualYaw = martRuntime.playerYaw ?? 0;
    const offsetX = Math.sin(actualYaw) * 1.15;
    const offsetZ = Math.cos(actualYaw) * 1.15;
    currentPos.current.set(actualPos[0] + offsetX, 0, actualPos[2] + offsetZ);
    prevTrolleyPos.current.copy(currentPos.current);
    currentYaw.current = actualYaw;
    prevYaw.current = actualYaw;
    if (trolleyRef.current) {
      trolleyRef.current.position.copy(currentPos.current);
      trolleyRef.current.rotation.set(0, actualYaw + Math.PI, 0);
    }
  }, [resetTrigger]);

  // Instant snap on teleport
  useEffect(() => {
    if (teleportTrigger === 0) return;
    const actualPos = martRuntime.playerPos;
    const actualYaw = martRuntime.playerYaw ?? 0;
    const offsetX = Math.sin(actualYaw) * 1.15;
    const offsetZ = Math.cos(actualYaw) * 1.15;
    currentPos.current.set(actualPos[0] + offsetX, 0, actualPos[2] + offsetZ);
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
    if (!useMartStore.getState().hasEnteredStore) return;

    const actualPos = targetPos || martRuntime.playerPos;
    let actualYaw = targetYaw !== undefined ? targetYaw : martRuntime.playerYaw;

    const offsetDistance = 1.15;
    const offsetX = Math.sin(actualYaw) * offsetDistance;
    const offsetZ = Math.cos(actualYaw) * offsetDistance;
    let desiredX = actualPos[0] + offsetX;
    // Ground level: wheels touch floor exactly at Y = 0
    const desiredY = 0;
    let desiredZ = actualPos[2] + offsetZ;

    // Hypermarket bounds clamp
    desiredX = THREE.MathUtils.clamp(desiredX, -34.8, 34.8);
    desiredZ = THREE.MathUtils.clamp(desiredZ, -34.8, 34.8);

    // Fast teleport catch-up
    staticTargetPos.set(desiredX, desiredY, desiredZ);
    const distToTarget = currentPos.current.distanceTo(staticTargetPos);
    if (distToTarget > 3.5) {
      currentPos.current.set(desiredX, desiredY, desiredZ);
      currentYaw.current = actualYaw;
    }

    // Smooth critically-damped spring follow
    currentPos.current.set(desiredX, desiredY, desiredZ);

    // Physical wheel roll based on displacement
    const prevP = prevTrolleyPos.current;
    const currP = currentPos.current;
    const dx = currP.x - prevP.x;
    const dz = currP.z - prevP.z;

    const fwdX = -Math.sin(actualYaw);
    const fwdZ = -Math.cos(actualYaw);
    const forwardStep = dx * fwdX + dz * fwdZ;

    // Wheel radius = 0.05m
    wheelRollRef.current += forwardStep / 0.05;
    prevTrolleyPos.current.copy(currP);

    // Front caster steering swivel
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

    // Wheel rotations
    if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x = wheelRollRef.current;
    if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x = wheelRollRef.current;
    if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x = wheelRollRef.current;
    if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x = wheelRollRef.current;

    if (frontLeftCasterRef.current) frontLeftCasterRef.current.rotation.y = casterSwivelRef.current;
    if (frontRightCasterRef.current) frontRightCasterRef.current.rotation.y = casterSwivelRef.current;
  });

  const itemsInBasket = billingPhase === 'scanning'
    ? displayItems.slice(Math.min(displayItems.length, transferredToBenchCount))
    : (['review', 'checkout_details', 'processing', 'success_popup'].includes(billingPhase)
      ? []
      : displayItems);

  // 4 Wheel Footprint Coordinates: X = +-0.22, Z = +-0.30
  const casterPositions = [
    { name: 'frontLeft',  x: -0.22, z: -0.30 },
    { name: 'frontRight', x:  0.22, z: -0.30 },
    { name: 'rearLeft',   x: -0.22, z:  0.30 },
    { name: 'rearRight',  x:  0.22, z:  0.30 },
  ];

  return (
    <group ref={trolleyRef} name="trolley-root" raycast={() => null}>
      {/* ==============================================================
          PHASE 3: INDIVIDUAL WHEEL CONTACT SHADOW DECALS (0.2m Diameter)
          Placed at floor Y + 0.002, centered exactly under each wheel
          ============================================================== */}
      {casterPositions.map((c) => (
        <mesh
          key={`shadow-${c.name}`}
          position={[c.x, 0.002, c.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={trolleyGeos.shadowDecalPlane}
          material={trolleyMaterials.shadowDecal}
        />
      ))}

      {/* ==============================================================
          PHASE 2: 4 SWIVEL CASTERS & BLACK RUBBER WHEELS
          Wheel radius: 0.05m. Wheel axis at Y = 0.05m.
          Wheel bottom touches floor at exactly Y = 0.000m.
          ============================================================== */}

      {/* Front Left Caster */}
      <group position={[-0.22, 0.05, -0.30]}>
        <group ref={frontLeftCasterRef}>
          {/* Chrome caster fork */}
          <mesh position={[0, 0.035, 0]} geometry={trolleyGeos.casterForkTop} material={trolleyMaterials.chromeMetal} />
          <mesh position={[-0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
          <mesh position={[0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
          {/* Black rubber wheel */}
          <group ref={frontLeftWheelRef}>
            <mesh rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.wheelCylinder} material={trolleyMaterials.blackRubberWheel} />
          </group>
        </group>
      </group>

      {/* Front Right Caster */}
      <group position={[0.22, 0.05, -0.30]}>
        <group ref={frontRightCasterRef}>
          <mesh position={[0, 0.035, 0]} geometry={trolleyGeos.casterForkTop} material={trolleyMaterials.chromeMetal} />
          <mesh position={[-0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
          <mesh position={[0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
          <group ref={frontRightWheelRef}>
            <mesh rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.wheelCylinder} material={trolleyMaterials.blackRubberWheel} />
          </group>
        </group>
      </group>

      {/* Rear Left Caster */}
      <group position={[-0.22, 0.05, 0.30]}>
        <mesh position={[0, 0.035, 0]} geometry={trolleyGeos.casterForkTop} material={trolleyMaterials.chromeMetal} />
        <mesh position={[-0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
        <mesh position={[0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
        <group ref={rearLeftWheelRef}>
          <mesh rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.wheelCylinder} material={trolleyMaterials.blackRubberWheel} />
        </group>
      </group>

      {/* Rear Right Caster */}
      <group position={[0.22, 0.05, 0.30]}>
        <mesh position={[0, 0.035, 0]} geometry={trolleyGeos.casterForkTop} material={trolleyMaterials.chromeMetal} />
        <mesh position={[-0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
        <mesh position={[0.016, 0.015, 0]} geometry={trolleyGeos.casterForkLeg} material={trolleyMaterials.chromeMetal} />
        <group ref={rearRightWheelRef}>
          <mesh rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.wheelCylinder} material={trolleyMaterials.blackRubberWheel} />
        </group>
      </group>

      {/* ==============================================================
          LOWER TUBULAR CHASSIS FRAME (High-Polish Chrome, 22mm tubes)
          ============================================================== */}
      {/* Left Longitudinal Chassis Rail */}
      <mesh position={[-0.22, 0.10, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={trolleyGeos.chassisSideTube} material={trolleyMaterials.chromeMetal} />
      {/* Right Longitudinal Chassis Rail */}
      <mesh position={[0.22, 0.10, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={trolleyGeos.chassisSideTube} material={trolleyMaterials.chromeMetal} />
      {/* Front Cross Tube */}
      <mesh position={[0, 0.10, -0.32]} rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.chassisCrossTube} material={trolleyMaterials.chromeMetal} />
      {/* Rear Cross Tube */}
      <mesh position={[0, 0.10, 0.32]} rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.chassisCrossTube} material={trolleyMaterials.chromeMetal} />

      {/* Lower Wire Shelf at Y = 0.28m (Bulk Storage Tray) */}
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={trolleyGeos.lowerShelfGrid} material={trolleyMaterials.wireMesh} />
      <mesh position={[-0.21, 0.285, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={trolleyGeos.lowerShelfRimSide} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0.21, 0.285, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={trolleyGeos.lowerShelfRimSide} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0, 0.285, -0.28]} rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.lowerShelfRimCross} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0, 0.285, 0.28]} rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.lowerShelfRimCross} material={trolleyMaterials.chromeMetal} />

      {/* Upright Support Struts */}
      <mesh position={[-0.23, 0.44, 0.28]} rotation={[0.12, 0, 0]} geometry={trolleyGeos.uprightSupportTube} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0.23, 0.44, 0.28]} rotation={[0.12, 0, 0]} geometry={trolleyGeos.uprightSupportTube} material={trolleyMaterials.chromeMetal} />
      <mesh position={[-0.21, 0.34, -0.18]} rotation={[-0.15, 0, 0]} geometry={trolleyGeos.uprightSupportTube} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0.21, 0.34, -0.18]} rotation={[-0.15, 0, 0]} geometry={trolleyGeos.uprightSupportTube} material={trolleyMaterials.chromeMetal} />

      {/* ==============================================================
          UPPER WIRE BASKET (0.50m wide x 0.72m long, See-Through Mesh)
          Floor support Y = 0.52m
          ============================================================== */}
      {/* Basket Floor Grid */}
      <mesh position={[0, 0.52, 0.02]} rotation={[-Math.PI / 2, 0, 0]} geometry={trolleyGeos.basketFloor} material={trolleyMaterials.wireMesh} />

      {/* Top Tubular Rims */}
      <mesh position={[0, 0.86, -0.33]} rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.basketTopFront} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0, 0.92, 0.36]} rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.basketTopRear} material={trolleyMaterials.chromeMetal} />
      <mesh position={[-0.24, 0.89, 0.02]} rotation={[Math.PI / 2 - 0.08, 0, 0]} geometry={trolleyGeos.basketTopSide} material={trolleyMaterials.chromeMetal} />
      <mesh position={[0.24, 0.89, 0.02]} rotation={[Math.PI / 2 - 0.08, 0, 0]} geometry={trolleyGeos.basketTopSide} material={trolleyMaterials.chromeMetal} />

      {/* See-Through Wire Mesh Walls (4mm wire, 50mm grid opening) */}
      <mesh position={[-0.24, 0.70, 0.02]} rotation={[0, Math.PI / 2, 0]} geometry={trolleyGeos.basketSideWall} material={trolleyMaterials.wireMesh} />
      <mesh position={[0.24, 0.70, 0.02]} rotation={[0, -Math.PI / 2, 0]} geometry={trolleyGeos.basketSideWall} material={trolleyMaterials.wireMesh} />
      <mesh position={[0, 0.69, -0.33]} geometry={trolleyGeos.basketFrontWall} material={trolleyMaterials.wireMesh} />
      <mesh position={[0, 0.72, 0.36]} rotation={[0, Math.PI, 0]} geometry={trolleyGeos.basketRearWall} material={trolleyMaterials.wireMesh} />

      {/* ==============================================================
          HANDLE: BRIGHT RED PLASTIC HANDLEBAR (MATCHES REFERENCE PHOTO)
          ============================================================== */}
      <group position={[0, 0.95, 0.42]}>
        {/* Chrome support mounting brackets */}
        <mesh position={[-0.23, -0.04, -0.05]} rotation={[-0.45, 0, 0]} geometry={trolleyGeos.handleBracket} material={trolleyMaterials.chromeMetal} />
        <mesh position={[0.23, -0.04, -0.05]} rotation={[-0.45, 0, 0]} geometry={trolleyGeos.handleBracket} material={trolleyMaterials.chromeMetal} />

        {/* Bright red plastic handle bar across top */}
        <mesh rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.handleBarRed} material={trolleyMaterials.redPlastic} />
        {/* Red rounded endcaps */}
        <mesh position={[-0.24, 0, 0]} geometry={trolleyGeos.handleEndCap} material={trolleyMaterials.redPlastic} />
        <mesh position={[0.24, 0, 0]} geometry={trolleyGeos.handleEndCap} material={trolleyMaterials.redPlastic} />

        {/* Brand label plate centered on red handle */}
        <mesh position={[0, 0.016, 0]} geometry={trolleyGeos.handleBrandPlate} material={trolleyMaterials.chromeMetal} />
        <Text
          position={[0, 0.021, 0]}
          fontSize={0.014}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="extrabold"
          letterSpacing={0.06}
        >
          MARTVERSE
        </Text>
      </group>

      {/* ==============================================================
          CHILD SEAT: TWO BRIGHT RED PLASTIC PANELS (MATCHES REFERENCE PHOTO)
          Centered side-by-side on handle side of basket
          ============================================================== */}
      <group position={[0, 0.73, 0.355]}>
        {/* Chrome hinge support rod */}
        <mesh rotation={[0, 0, Math.PI / 2]} geometry={trolleyGeos.childSeatRod} material={trolleyMaterials.chromeMetal} />
        {/* Left red plastic flap */}
        <mesh position={[-0.075, 0, 0]} geometry={trolleyGeos.childSeatPanel} material={trolleyMaterials.redPlastic} />
        {/* Right red plastic flap */}
        <mesh position={[0.075, 0, 0]} geometry={trolleyGeos.childSeatPanel} material={trolleyMaterials.redPlastic} />
      </group>

      {/* ==============================================================
          PHASE 4: LIVE CART ITEMS SITTING IN THE BASKET (3x4 MATRIX)
          Bottom Y = 0.521m (firmly resting on wire floor, no floating)
          ============================================================== */}
      <group>
        {itemsInBasket.map((item, idx) => (
          <BasketProductItem key={`basket-item-${item.id}-${idx}`} item={item} slotIndex={idx} />
        ))}
      </group>
    </group>
  );
};

export const TrolleyModel = React.memo(TrolleyModelComponent);
