'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useBillingStore } from '@/store/useBillingStore';
import { useCartStore } from '@/store/useCartStore';
import { martRuntime } from '@/store/useMartStore';
import { sounds } from '@/lib/sound';
import { CartItem } from '@/types';

interface BillingCounterProps {
  position: [number, number, number];
}

// ---------------------------------------------------------------------------
// 3D Item Mesh representing grocery items on the conveyor
// ---------------------------------------------------------------------------
const ConveyorItemMesh: React.FC<{
  item: CartItem;
  position: [number, number, number];
  rotation: [number, number, number];
  isLaserActive: boolean;
}> = ({ item, position, rotation, isLaserActive }) => {
  const isBottle =
    item.modelType === 'bottle' ||
    /oil|shampoo|liquid|wash|dishwash/i.test(item.productName);
  const isClothing =
    item.modelType === 'shirt' ||
    item.modelType === 'hanger' ||
    /shirt|polo|kurta|saree|dress|jeans|apparel/i.test(item.productName) ||
    !!item.size;
  const isChocolate =
    item.modelType === 'chocolate' ||
    item.modelType === 'bar' ||
    /dairy\s*milk|chocolate|kitkat/i.test(item.productName);
  const isSnack = /biscuit|bhujia|chocolate|silk|rocher|snack/i.test(item.productName);

  const color =
    item.color ||
    (isBottle
      ? '#38bdf8'
      : isClothing
      ? '#818cf8'
      : isChocolate
      ? '#28074d'
      : isSnack
      ? '#fbbf24'
      : '#34d399');

  return (
    <group position={position} rotation={rotation}>
      {isBottle ? (
        <group>
          {/* Main Bottle Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.15, 16]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
          </mesh>
          {/* Bottle Neck & Cap */}
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.02, 0.045, 0.04, 16]} />
            <meshStandardMaterial color={color} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.125, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.025, 14]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Front Printed Product Label */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.046, 0.046, 0.08, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      ) : isClothing ? (
        <group>
          {/* Folded Garment */}
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.06, 0.18]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Collar Seam */}
          <mesh position={[0, 0.032, 0]}>
            <boxGeometry args={[0.13, 0.006, 0.06]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      ) : isChocolate ? (
        <group>
          {/* Chocolate Bar Packet on Scanning Conveyor */}
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.02, 0.09]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
          </mesh>
          <mesh position={[-0.104, 0, 0]}>
            <boxGeometry args={[0.008, 0.018, 0.086]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0.104, 0, 0]}>
            <boxGeometry args={[0.008, 0.018, 0.086]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Barcode on back/side for scanner */}
          <mesh position={[0, 0.011, 0]}>
            <boxGeometry args={[0.08, 0.002, 0.04]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Grocery Carton Box (Atta, Cereals, Biscuits, Detergents) */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.14, 0.1]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.08} />
          </mesh>
          {/* Front Product Graphic Faceplate */}
          <mesh position={[0, 0, 0.052]}>
            <boxGeometry args={[0.12, 0.11, 0.005]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Back Printed Barcode */}
          <mesh position={[0, -0.02, -0.052]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.004]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {/* Holographic Laser Reflection & Barcode Scanning Visuals */}
      {isLaserActive && (
        <group>
          {/* Sweeping Laser Plane Sheet cutting through item */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.22, 0.005, 0.16]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.85} />
          </mesh>
          {/* Holographic Laser Wireframe Aura */}
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.25} wireframe />
          </mesh>
          {/* Emerald Green Holographic Confirmation Disk upon barcode beep */}
          <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.15, 24]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 3D Animated Conveyor Scanning System
// ---------------------------------------------------------------------------
const ConveyorAnimation3D: React.FC<{
  activeDeskX: number;
  onBagBump: () => void;
}> = ({ activeDeskX, onBagBump }) => {
  const phase = useBillingStore((state) => state.phase);
  const isPaused = useBillingStore((state) => state.isPaused);
  const cartItems = useCartStore((state) => state.items);

  const unitItems = useMemo(() => {
    const list: Array<{
      item: CartItem;
      unitIndex: number;
      totalUnits: number;
      flatIndex: number;
      uniqueScanId: string;
    }> = [];
    cartItems.forEach((it) => {
      for (let q = 0; q < it.quantity; q++) {
        list.push({
          item: it,
          unitIndex: q + 1,
          totalUnits: it.quantity,
          flatIndex: list.length,
          uniqueScanId: `${it.id}-unit-${q}-${list.length}`,
        });
      }
    });
    return list;
  }, [cartItems]);

  const [activeItems, setActiveItems] = useState<
    Array<{
      id: string;
      item: CartItem;
      unitIndex: number;
      totalUnits: number;
      flatIndex: number;
      startTime: number;
      pos: [number, number, number];
      rot: [number, number, number];
      stage: 'fly' | 'convey' | 'scan' | 'pack' | 'done';
      landSoundPlayed: boolean;
      scanSoundPlayed: boolean;
      priceTagY: number;
      priceTagOpacity: number;
    }>
  >([]);

  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase === 'scanning' && unitItems.length > 0) {
      elapsedRef.current = 0;
      lastTimeRef.current = Date.now();
      finishedRef.current = false;

      const stagger = unitItems.length > 5 ? 1.8 : 2.4;
      const initialized = unitItems.map((u) => ({
        id: u.uniqueScanId,
        item: u.item,
        unitIndex: u.unitIndex,
        totalUnits: u.totalUnits,
        flatIndex: u.flatIndex,
        startTime: u.flatIndex * stagger,
        pos: [activeDeskX - 1.9, 0.72, -1.0] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
        stage: 'fly' as const,
        landSoundPlayed: false,
        scanSoundPlayed: false,
        priceTagY: 1.15,
        priceTagOpacity: 0,
      }));

      setActiveItems(initialized);
    } else if (phase === 'idle') {
      setActiveItems([]);
    }
  }, [phase, unitItems, activeDeskX]);

  useFrame((_, delta) => {
    if (phase !== 'scanning' || isPaused || activeItems.length === 0) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    let allDone = true;

    const playerZ = martRuntime.playerPos[2];
    const trolleyX = activeDeskX - 1.9;
    const trolleyZ = (playerZ > 14 && playerZ < 21 ? playerZ : 17.0) - 18.0;

    const beltX = activeDeskX - 0.15;
    const beltDropZ = -0.9;
    const scannerZ = 0.3;
    const bagZ = 1.1;

    const updated = activeItems.map((p) => {
      if (p.stage === 'done') {
        return p;
      }

      allDone = false;
      const t = elapsed - p.startTime;

      if (t < 0) {
        return p;
      }

      if (useBillingStore.getState().transferredToBenchCount < p.flatIndex + 1) {
        useBillingStore.getState().setTransferredToBenchCount(p.flatIndex + 1);
      }

      const totalItemDuration = 3.6;
      const progress = Math.min(1, Math.max(0, t / totalItemDuration));

      let curX = trolleyX;
      let curY = 0.72;
      let curZ = trolleyZ;
      let rotX = 0;
      let rotY = p.flatIndex * 0.4;
      let rotZ = 0;
      let curStage: 'fly' | 'convey' | 'scan' | 'pack' | 'done' = p.stage;
      let landSound = p.landSoundPlayed;
      let scanSound = p.scanSoundPlayed;
      let priceY = p.priceTagY;
      let priceOp = p.priceTagOpacity;

      // 1. FLIGHT (0% - 32%)
      if (progress < 0.32) {
        curStage = 'fly';
        const u = progress / 0.32;
        const ease = u * u * (3 - 2 * u);

        curX = THREE.MathUtils.lerp(trolleyX, beltX, ease);
        curZ = THREE.MathUtils.lerp(trolleyZ, beltDropZ, ease);
        curY = THREE.MathUtils.lerp(0.72, 1.08, ease) + Math.sin(u * Math.PI) * 0.55;

        rotX = Math.sin(u * Math.PI) * 0.4;
        rotZ = (1 - u) * 0.35;
      }
      // 2. CONVEY (32% - 68%)
      else if (progress < 0.68) {
        curStage = 'convey';
        if (!landSound) {
          landSound = true;
          sounds.playItemLand();
        }

        const u = (progress - 0.32) / 0.36;
        curX = beltX;
        curZ = THREE.MathUtils.lerp(beltDropZ, scannerZ, u);

        const bounce = Math.exp(-u * 6) * Math.sin(u * 12) * 0.04;
        curY = 1.08 + Math.max(0, bounce);

        rotX = 0;
        rotZ = 0;
      }
      // 3. SCAN (68% - 84%)
      else if (progress < 0.84) {
        curStage = 'scan';
        curX = beltX;
        curZ = scannerZ;
        curY = 1.08;

        if (!scanSound) {
          scanSound = true;
          sounds.playScanBeep();
          useBillingStore
            .getState()
            .recordUnitScanned(p.flatIndex + 1, p.item, p.unitIndex, p.totalUnits);
          priceY = 1.25;
          priceOp = 1.0;
        }

        priceY += delta * 0.4;
        priceOp = Math.max(0, priceOp - delta * 1.5);
      }
      // 4. PACK (84% - 100%)
      else {
        curStage = 'pack';
        const u = (progress - 0.84) / 0.16;
        const ease = u * u * (3 - 2 * u);

        curX = beltX;
        curZ = THREE.MathUtils.lerp(scannerZ, bagZ, ease);

        if (u < 0.5) {
          curY = THREE.MathUtils.lerp(1.08, 1.25, u * 2);
          rotX = u * 0.6;
        } else {
          curY = THREE.MathUtils.lerp(1.25, 1.1, (u - 0.5) * 2);
          rotX = 0.6 - (u - 0.5) * 0.4;
        }

        if (progress >= 0.98) {
          curStage = 'done';
          onBagBump();
          sounds.playPickSound();
        }
      }

      return {
        ...p,
        pos: [curX, curY, curZ] as [number, number, number],
        rot: [rotX, rotY, rotZ] as [number, number, number],
        stage: curStage,
        landSoundPlayed: landSound,
        scanSoundPlayed: scanSound,
        priceTagY: priceY,
        priceTagOpacity: priceOp,
      };
    });

    setActiveItems(updated);

    if (allDone && !finishedRef.current && activeItems.length > 0) {
      finishedRef.current = true;
      sounds.playCashRegister();
      setTimeout(() => {
        useBillingStore.getState().finishScanning();
      }, 500);
    }
  });

  if (phase !== 'scanning') return null;

  return (
    <group>
      {activeItems.map((p) => {
        const isStarted = elapsedRef.current >= p.startTime;
        if (!isStarted || p.stage === 'done') return null;

        return (
          <group key={p.id}>
            <ConveyorItemMesh
              item={p.item}
              position={p.pos}
              rotation={p.rot}
              isLaserActive={p.stage === 'scan'}
            />

            {p.priceTagOpacity > 0.05 && (
              <group position={[p.pos[0], p.priceTagY, p.pos[2]]}>
                <Text
                  fontSize={0.09}
                  color="#10b981"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.015}
                  outlineColor="#064e3b"
                >
                  {`+ ₹${p.item.price.toFixed(2)}`}
                </Text>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Realistic Supermarket Checkout Counter Model
// ---------------------------------------------------------------------------
interface SingleCheckoutCounterProps {
  laneIndex: number;
  xOffset: number;
  isActiveDesk: boolean;
  phase: string;
  runningTotal: number;
  isConveyorMoving: boolean;
  laserRef: React.RefObject<THREE.Mesh | null> | null;
  conveyorBeltRibsRef: React.RefObject<THREE.Group | null> | null;
  bagGroupRef: (el: THREE.Group | null) => void;
  bagScale: number;
}

const SingleCheckoutCounter: React.FC<SingleCheckoutCounterProps> = ({
  laneIndex,
  xOffset,
  isActiveDesk,
  phase,
  runningTotal,
  isConveyorMoving,
  laserRef,
  conveyorBeltRibsRef,
  bagGroupRef,
  bagScale,
}) => {
  const laneNumberStr = `0${laneIndex + 1}`;
  const isScanning = isActiveDesk && phase === 'scanning';

  return (
    <group position={[xOffset, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. COUNTER BASE & DESK CABINETRY (FURNITURE GRADE)             */}
      {/* ============================================================== */}
      {/* Recessed Kick-Plate Base (Elevation indentation) */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[1.24, 0.12, 3.18]} />
        <meshStandardMaterial color="#090d16" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Main Cabinet Body (Deep Matte Charcoal Steel Chassis) */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.86, 3.24]} />
        <meshStandardMaterial color="#1e2430" roughness={0.45} metalness={0.35} />
      </mesh>

      {/* Protective Trolley Impact Rub-Rails along customer side (x = -0.66) */}
      <group position={[-0.66, 0, 0]}>
        {/* Upper Rubber Bumper Rail */}
        <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 3.22, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Upper Chrome Trim Highlight */}
        <mesh position={[0.005, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 3.22, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>

        {/* Lower Rubber Bumper Rail */}
        <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 3.22, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        {/* Lower Chrome Trim Highlight */}
        <mesh position={[0.005, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 3.22, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>

        {/* Rail Mounting Brackets */}
        {[-1.3, -0.6, 0.1, 0.8, 1.4].map((bz, bIdx) => (
          <group key={`bkt-${bIdx}`} position={[0.015, 0, bz]}>
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[0.02, 0.06, 0.04]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <boxGeometry args={[0.02, 0.06, 0.04]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Cashier Side Inset & Ergonomic Footrest (x > 0) */}
      <group position={[0.42, 0, 0]}>
        {/* Stainless Steel Tubular Footrest Bar */}
        <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 1.4, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[0.1, 0.16, -0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, 0.22, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.16, 0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, 0.22, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Built-in Under-Counter Cash Drawer Unit (under POS on Cashier Side) */}
      <group position={[0.4, 0.86, 0.28]}>
        {/* Drawer Casing Face */}
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.16, 0.44]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Recessed Drawer Front Face */}
        <mesh position={[0.232, 0, 0]}>
          <boxGeometry args={[0.006, 0.14, 0.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Polished Chrome Pull Handle */}
        <mesh position={[0.245, 0.02, 0]}>
          <boxGeometry args={[0.015, 0.018, 0.16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Keyhole Cylinder */}
        <mesh position={[0.238, 0.02, 0.14]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.007, 0.007, 0.01, 10]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Cashier Media / Bill Drop Slot */}
        <mesh position={[0.238, -0.04, 0]}>
          <boxGeometry args={[0.005, 0.006, 0.12]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>

      {/* Cashier Side Access Cabinet Doors */}
      <group position={[0.652, 0.45, -0.7]}>
        {/* Door 1 Panel & Seam */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.006, 0.58, 0.56]} />
          <meshStandardMaterial color="#1b2230" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0.008, 0.12, 0.22]}>
          <boxGeometry args={[0.012, 0.06, 0.018]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Door 2 Panel & Seam */}
        <mesh position={[0, 0, 0.62]}>
          <boxGeometry args={[0.006, 0.58, 0.56]} />
          <meshStandardMaterial color="#1b2230" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0.008, 0.12, 0.84]}>
          <boxGeometry args={[0.012, 0.06, 0.018]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* Cashier Ergonomic Swivel Stool */}
      <group position={[0.55, 0, 0.35]}>
        {/* Base Chrome Disc */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Center Pneumatic Column */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.5, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Chrome Footrest Ring */}
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[0.14, 0.01, 8, 20]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Black Leather Seat Cushion */}
        <mesh position={[0, 0.53, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
          <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Curved Stool Lumbar Backrest */}
        <mesh position={[0.14, 0.72, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.03, 0.16, 0.26]} />
          <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0.07, 0.62, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.01, 0.01, 0.22, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 2. BRUSHED STAINLESS STEEL COUNTERTOP & DIVIDER TRAY           */}
      {/* ============================================================== */}
      {/* Heavy-Duty Brushed Stainless Steel Countertop Slab */}
      <mesh position={[0, 1.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.36, 0.05, 3.32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.88}
          roughness={0.18}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Bullnose Perimeter Beveled Edging */}
      <mesh position={[0, 1.052, 0]}>
        <boxGeometry args={[1.34, 0.008, 3.3]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Customer Acrylic Divider Bar Tray on Customer Edge */}
      <group position={[-0.56, 1.06, -0.65]}>
        {/* Acrylic Tray Bed & Lip */}
        <mesh>
          <boxGeometry args={[0.09, 0.024, 0.64]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.45} roughness={0.1} />
        </mesh>
        <mesh position={[-0.042, 0.02, 0]}>
          <boxGeometry args={[0.006, 0.025, 0.64]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0.042, 0.02, 0]}>
          <boxGeometry args={[0.006, 0.025, 0.64]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} roughness={0.1} />
        </mesh>

        {/* Separator Bar 1 ("Next Customer Please" - Red/White) */}
        <group position={[-0.015, 0.022, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.52, 12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Black Rubber Shock Absorber End Caps */}
          <mesh position={[0, 0, -0.26]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.019, 0.019, 0.03, 12]} />
            <meshStandardMaterial color="#09090b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.019, 0.019, 0.03, 12]} />
            <meshStandardMaterial color="#09090b" roughness={0.8} />
          </mesh>
          {/* Text Band */}
          <mesh position={[0, 0.017, 0]}>
            <boxGeometry args={[0.02, 0.002, 0.24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Separator Bar 2 ("Martverse Express" - Sapphire Blue) */}
        <group position={[0.02, 0.022, 0.04]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.48, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.019, 0.019, 0.03, 12]} />
            <meshStandardMaterial color="#09090b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.019, 0.019, 0.03, 12]} />
            <meshStandardMaterial color="#09090b" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 3. PRECISION CONVEYOR BELT SYSTEM                              */}
      {/* ============================================================== */}
      <group position={[-0.15, 1.055, -0.65]}>
        {/* Recessed Frame Bed */}
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[0.66, 0.02, 1.66]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>

        {/* Vulcanized Textured Rubber Conveyor Belt */}
        <mesh receiveShadow>
          <boxGeometry args={[0.62, 0.02, 1.62]} />
          <meshStandardMaterial color="#111317" roughness={0.92} metalness={0.06} />
        </mesh>

        {/* Brushed Stainless Steel Guide Rails */}
        {/* Customer Side Rail */}
        <mesh position={[-0.32, 0.036, 0]}>
          <boxGeometry args={[0.024, 0.065, 1.64]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Flared Entry Corner piece */}
        <mesh position={[-0.32, 0.036, -0.82]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.024, 0.065, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Cashier Side Rail */}
        <mesh position={[0.32, 0.036, 0]}>
          <boxGeometry args={[0.024, 0.065, 1.64]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh position={[0.32, 0.036, -0.82]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.024, 0.065, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Heavy-Duty Cylindrical End Drive Rollers */}
        <group position={[0, -0.005, -0.81]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.026, 0.026, 0.63, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* Chrome Bearing Caps on Rail Sides */}
          <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.03, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.03, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        <group position={[0, -0.005, 0.81]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.026, 0.026, 0.63, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.15} />
          </mesh>
          <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.03, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.032, 0.032, 0.03, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Optical Photocell Eye Sensors on rails right before scanner */}
        <group position={[0, 0.04, 0.72]}>
          {/* Transmitter Sensor Housing on Customer Rail */}
          <mesh position={[-0.31, 0, 0]}>
            <boxGeometry args={[0.016, 0.028, 0.036]} />
            <meshStandardMaterial color="#09090b" roughness={0.5} />
          </mesh>
          <mesh position={[-0.301, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.004, 10]} />
            <meshStandardMaterial color="#dc2626" roughness={0.1} />
          </mesh>
          {/* Receiver Sensor Housing on Cashier Rail */}
          <mesh position={[0.31, 0, 0]}>
            <boxGeometry args={[0.016, 0.028, 0.036]} />
            <meshStandardMaterial color="#09090b" roughness={0.5} />
          </mesh>
          <mesh position={[0.301, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.004, 10]} />
            <meshStandardMaterial color="#10b981" roughness={0.1} />
          </mesh>
        </group>

        {/* Animated Ribbed Tread Lines */}
        <group ref={isActiveDesk ? conveyorBeltRibsRef : null}>
          {Array.from({ length: 16 }).map((_, rIdx) => (
            <mesh key={`rib-${rIdx}`} position={[0, 0.011, -0.78 + rIdx * 0.104]}>
              <boxGeometry args={[0.6, 0.004, 0.014]} />
              <meshBasicMaterial color="#1f242d" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ============================================================== */}
      {/* 4. BI-OPTIC SCALE & MULTI-PLANE BARCODE SCANNER (ZEBRA/HONEYWELL)*/}
      {/* ============================================================== */}
      <group position={[-0.15, 1.065, 0.3]}>
        {/* Stainless Steel Outer Scale Platter Flange */}
        <mesh position={[0, -0.004, 0]}>
          <boxGeometry args={[0.38, 0.016, 0.38]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.18} />
        </mesh>

        {/* Beveled Platter Border */}
        <mesh position={[0, 0.002, 0]}>
          <boxGeometry args={[0.35, 0.008, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Sapphire Scratch-Resistant Optical Horizontal Window */}
        <mesh position={[0, 0.006, 0]}>
          <boxGeometry args={[0.31, 0.004, 0.31]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.08}
            metalness={0.2}
            transparent
            opacity={0.82}
          />
        </mesh>

        {/* Digital Scale LED Readout on Platter Corner (0.000 kg) */}
        <group position={[-0.11, 0.009, 0.14]}>
          <mesh>
            <boxGeometry args={[0.075, 0.004, 0.024]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0.003, 0]}>
            <boxGeometry args={[0.065, 0.002, 0.018]} />
            <meshBasicMaterial color="#022c22" />
          </mesh>
          <Text
            position={[0, 0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.013}
            color="#34d399"
            anchorX="center"
            anchorY="middle"
          >
            {isScanning ? '0.450 kg' : '0.000 kg'}
          </Text>
        </group>

        {/* Optical Perimeter Laser Status Glow */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.32, 0.003, 0.32]} />
          <meshStandardMaterial
            color={isScanning ? '#10b981' : '#38bdf8'}
            emissive={isScanning ? '#059669' : '#0284c7'}
            emissiveIntensity={isScanning ? 1.6 : 0.5}
            wireframe
          />
        </mesh>

        {/* Dynamic Sweeping Red Laser Line */}
        <mesh ref={isActiveDesk ? laserRef : null} position={[0, 0.022, 0]}>
          <boxGeometry args={[0.29, 0.006, 0.025]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.92} />
        </mesh>

        {/* Crosshair Secondary Red Laser Line */}
        <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.29, 0.005, 0.016]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={isScanning ? 0.8 : 0.3} />
        </mesh>

        {/* Volumetric Laser Scan Sheet Fan */}
        <mesh position={[0, 0.16, 0]}>
          <planeGeometry args={[0.28, 0.28]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={isScanning ? 0.42 : 0.08}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Vertical Bi-Optic Scanner Tower (Upright Hood) */}
        <group position={[0.22, 0.18, 0]}>
          {/* Molded Aerodynamic Tower Body */}
          <mesh castShadow>
            <boxGeometry args={[0.085, 0.38, 0.34]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Dark Glass Vertical Scan Aperture */}
          <mesh position={[-0.044, 0, 0]}>
            <planeGeometry args={[0.26, 0.3]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={isScanning ? 0.65 : 0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Vertical Laser Projector Stripe */}
          {isScanning && (
            <mesh position={[-0.14, 0, 0]}>
              <planeGeometry args={[0.2, 0.015]} />
              <meshBasicMaterial
                color="#ef4444"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {/* Beep Speaker Grill Perforations */}
          <mesh position={[0.044, 0.1, 0]}>
            <boxGeometry args={[0.002, 0.06, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* Handheld Barcode Scanner Pistol in Holster */}
        <group position={[0.28, 0.14, 0.22]} rotation={[0.4, 0, -0.3]}>
          {/* Holster Bracket */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.08, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          {/* Handheld Gun Grip */}
          <mesh position={[0.02, 0.06, 0.02]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.018, 0.11, 10]} />
            <meshStandardMaterial color="#09090b" roughness={0.7} />
          </mesh>
          {/* Scanner Gun Head (Zebra Yellow/Black look) */}
          <mesh position={[0.02, 0.12, 0.05]}>
            <boxGeometry args={[0.048, 0.04, 0.075]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          <mesh position={[0.02, 0.12, 0.09]}>
            <boxGeometry args={[0.042, 0.034, 0.005]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Coiled Cord */}
          <mesh position={[0.02, 0.01, -0.01]}>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 8]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
        </group>

        {/* High-Intensity Red Scan Illumination Light */}
        <pointLight
          position={[0, 0.18, 0]}
          color="#ef4444"
          intensity={isScanning ? 2.8 : 0.5}
          distance={1.4}
        />
      </group>

      {/* ============================================================== */}
      {/* 5. CASHIER POS WORKSTATION & PAYMENT SYSTEM                     */}
      {/* ============================================================== */}
      {/* Articulated Dual-Joint Aluminum Monitor Arm */}
      <group position={[0.44, 1.05, 0.28]}>
        {/* Base Mounting Flange Bolted to Counter */}
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.058, 0.065, 0.024, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Vertical Upright Mast */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.026, 0.026, 0.34, 14]} />
          <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Articulated Elbow Joint */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Modern Widescreen POS Touchscreen Monitor */}
      <group position={[0.44, 1.45, 0.28]} rotation={[0.08, -0.45, 0]}>
        {/* Sleek Aluminum Monitor Chassis Rear */}
        <mesh castShadow>
          <boxGeometry args={[0.54, 0.36, 0.028]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Rear VESA Plate & Cable Inset */}
        <mesh position={[0, 0, -0.018]}>
          <boxGeometry args={[0.12, 0.12, 0.01]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Ultra-Slim Bezel Front Frame */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[0.525, 0.345, 0.005]} />
          <meshStandardMaterial color="#020617" roughness={0.1} />
        </mesh>
        {/* Active High-Definition POS Screen Display */}
        <mesh position={[0, 0, 0.019]}>
          <planeGeometry args={[0.5, 0.32]} />
          <meshBasicMaterial color={isScanning ? '#022c22' : '#090d16'} />
        </mesh>

        {/* Screen GUI Elements */}
        {/* Top Header Bar */}
        <mesh position={[0, 0.13, 0.021]}>
          <planeGeometry args={[0.48, 0.04]} />
          <meshBasicMaterial color="#1e3a8a" />
        </mesh>
        <Text
          position={[0, 0.13, 0.022]}
          fontSize={0.019}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {`MARTVERSE POS OS 4.2 • LANE ${laneNumberStr} • LIVE INVOICE`}
        </Text>

        {/* Main Content Area */}
        <Text
          position={[-0.22, 0.05, 0.022]}
          fontSize={0.018}
          color="#94a3b8"
          anchorX="left"
          anchorY="top"
          lineHeight={1.4}
        >
          {isScanning
            ? `SCANNING ACTIVE...\nPARABOLIC TROLLEY SYNC\nGST (5% INCL)`
            : phase === 'review'
            ? `BILL PROCESSED\nAWAITING CARD / UPI\nALL UNITS VERIFIED`
            : `MARTVERSE RETAIL READY\nPLACE TROLLEY IN DOCK\nAUTO-DETECTION ON`}
        </Text>

        {/* Running Total Highlight Ribbon */}
        <mesh position={[0, -0.09, 0.021]}>
          <planeGeometry args={[0.48, 0.07]} />
          <meshBasicMaterial color={isScanning ? '#059669' : '#0284c7'} />
        </mesh>
        <Text
          position={[0, -0.09, 0.022]}
          fontSize={0.028}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`TOTAL: ₹${runningTotal.toFixed(2)}`}
        </Text>
      </group>

      {/* Customer-Facing Mini Pole Display (Facing Customer Aisle) */}
      <group position={[0.18, 1.05, 0.15]}>
        {/* Mounting Mast */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.36, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Customer VFD Display Head (Rotated towards customer) */}
        <group position={[0, 0.38, 0]} rotation={[0, Math.PI - 0.25, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.09, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Glowing Green/Cyan VFD Glass */}
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[0.26, 0.055]} />
            <meshBasicMaterial color="#022c22" />
          </mesh>
          <Text
            position={[0, 0.01, 0.024]}
            fontSize={0.018}
            color="#34d399"
            anchorX="center"
            anchorY="middle"
          >
            {`MARTVERSE • LANE ${laneNumberStr}`}
          </Text>
          <Text
            position={[0, -0.014, 0.024]}
            fontSize={0.016}
            color="#6ee7b7"
            anchorX="center"
            anchorY="middle"
          >
            {`DUE: ₹${runningTotal.toFixed(2)}`}
          </Text>
        </group>
      </group>

      {/* Verifone/Ingenico Chip & PIN Card Reader Terminal (Customer Swivel Arm) */}
      <group position={[-0.28, 1.22, 0.45]} rotation={[-0.2, 0.3, 0]}>
        {/* Swivel Mount Arm */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.18, 10]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Terminal Body */}
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.18, 0.035]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Contactless NFC Wave Screen */}
        <mesh position={[0, 0.045, 0.019]}>
          <planeGeometry args={[0.09, 0.055]} />
          <meshBasicMaterial color="#0369a1" />
        </mesh>
        <Text
          position={[0, 0.045, 0.021]}
          fontSize={0.011}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`TAP / INSERT CARD\n₹${runningTotal.toFixed(2)}`}
        </Text>
        {/* Numeric Tactile Keypad */}
        <mesh position={[0, -0.035, 0.019]}>
          <planeGeometry args={[0.08, 0.07]} />
          <meshBasicMaterial color="#09090b" />
        </mesh>
        {/* Colored Function Keys (Green OK, Red Cancel, Yellow Clear) */}
        <mesh position={[0.025, -0.065, 0.021]}>
          <boxGeometry args={[0.016, 0.008, 0.002]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <mesh position={[-0.025, -0.065, 0.021]}>
          <boxGeometry args={[0.016, 0.008, 0.002]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, -0.065, 0.021]}>
          <boxGeometry args={[0.016, 0.008, 0.002]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Chip Card Bottom Insertion Slot */}
        <mesh position={[0, -0.09, 0]}>
          <boxGeometry args={[0.065, 0.004, 0.018]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>

      {/* Epson Thermal Receipt Printer beside POS */}
      <group position={[0.54, 1.055, -0.04]}>
        {/* Printer Chassis */}
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.15, 0.14, 0.17]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Paper Cover Lid */}
        <mesh position={[0, 0.142, 0.01]}>
          <boxGeometry args={[0.14, 0.01, 0.13]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Receipt Paper Output Slit */}
        <mesh position={[0, 0.144, 0.045]}>
          <boxGeometry args={[0.09, 0.004, 0.01]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        {/* Status LEDs (Power Green & Error Amber) */}
        <mesh position={[-0.05, 0.13, 0.07]}>
          <sphereGeometry args={[0.003, 8, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <mesh position={[-0.038, 0.13, 0.07]}>
          <sphereGeometry args={[0.003, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Printed Receipt Paper emerging from slit */}
        <mesh position={[0, 0.165, 0.055]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.075, 0.05]} />
          <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 6. PACKING & BAGGING STATION (FABRIC BAG + CHROME CAROUSEL)    */}
      {/* ============================================================== */}
      <group position={[-0.15, 1.055, 1.1]}>
        {/* Stainless Steel Bagging Basin Drop Well */}
        <mesh position={[0, 0.005, 0]} receiveShadow>
          <boxGeometry args={[0.62, 0.03, 0.72]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.16} />
        </mesh>
        {/* Protective Raised Perimeter Lip */}
        <mesh position={[-0.305, 0.03, 0]}>
          <boxGeometry args={[0.015, 0.035, 0.72]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.305, 0.03, 0]}>
          <boxGeometry args={[0.015, 0.035, 0.72]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.03, 0.355]}>
          <boxGeometry args={[0.62, 0.035, 0.015]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Dual Tubular Chrome Bag Rack / Suspension Arms */}
        <group position={[0.22, 0, 0]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.32, 10]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Left Wire Suspension Arm */}
          <mesh position={[-0.14, 0.3, -0.12]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.007, 0.007, 0.28, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Right Wire Suspension Arm */}
          <mesh position={[-0.14, 0.3, 0.12]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.007, 0.007, 0.28, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Realistic Authentic Kraft Paper Grocery Bag Packing Assembly */}
        <group
          ref={bagGroupRef}
          position={[0, 0.16, 0]}
          scale={isActiveDesk ? [1, bagScale, 1] : [1, 1, 1]}
        >
          {/* Main Kraft Paper Bag Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.32, 0.28]} />
            <meshStandardMaterial color="#c29b67" roughness={0.96} metalness={0.02} />
          </mesh>
          {/* Top Folded Paper Serrated Lip */}
          <mesh position={[0, 0.162, 0]}>
            <boxGeometry args={[0.426, 0.016, 0.286]} />
            <meshStandardMaterial color="#ab834f" roughness={0.9} />
          </mesh>
          {/* Open Hollow Interior Depth */}
          <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.39, 0.25]} />
            <meshBasicMaterial color="#543c1f" />
          </mesh>

          {/* Realistic Twisted Kraft Paper Rope Handles */}
          {/* Front Loop Handle */}
          <mesh position={[0, 0.22, 0.125]}>
            <torusGeometry args={[0.075, 0.008, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#8f6a39" roughness={0.85} />
          </mesh>
          {/* Back Loop Handle */}
          <mesh position={[0, 0.22, -0.125]}>
            <torusGeometry args={[0.075, 0.008, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#8f6a39" roughness={0.85} />
          </mesh>

          {/* Front Printed Martverse Eco Kraft Typography */}
          <group position={[0, 0, 0.142]}>
            <Text
              position={[0, 0.04, 0.002]}
              fontSize={0.038}
              color="#2d4030"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
            >
              MARTVERSE
            </Text>
            <Text
              position={[0, -0.015, 0.002]}
              fontSize={0.016}
              color="#4a634e"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.04}
            >
              100% RECYCLED KRAFT
            </Text>
            <Text
              position={[0, -0.06, 0.002]}
              fontSize={0.013}
              color="#68876d"
              anchorX="center"
              anchorY="middle"
            >
              HYPERMARKET EXPRESS
            </Text>
          </group>
        </group>

        {/* Stack of Folded Spare Kraft Bags Next to the Packing Bay */}
        <group position={[0.08, 0.22, 0.22]} rotation={[0, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.26, 0.26, 0.03]} />
            <meshStandardMaterial color="#ab834f" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <torusGeometry args={[0.04, 0.006, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#845e2c" />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 7. OVERHEAD LANE NUMBER BEACON & STATUS MAST (REALISTIC - NO GREEN DOTS) */}
      {/* ============================================================== */}
      <group position={[0.56, 1.05, -1.45]}>
        {/* Brushed Stainless Steel Tower Mast with Base Mounting Ring */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.03, 14]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 1.6, 14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>

        {/* Dual-Sided Backlit Acrylic Lane Number Box */}
        <group position={[0, 1.7, 0]}>
          {/* Black Machined Aluminum Outer Bezel */}
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.28, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.8} />
          </mesh>

          {/* Top Machined Flat Cap (Realistic Architectural Cap - No Green Spheres) */}
          <mesh position={[0, 0.145, 0]}>
            <boxGeometry args={[0.39, 0.016, 0.086]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Integrated Slim Diffused LED Status Edge Bar */}
          <mesh position={[0, 0.148, 0]}>
            <boxGeometry args={[0.32, 0.008, 0.07]} />
            <meshStandardMaterial
              color={isActiveDesk ? '#38bdf8' : '#ffffff'}
              emissive={isActiveDesk ? '#38bdf8' : '#ffffff'}
              emissiveIntensity={isActiveDesk ? 0.8 : 0.25}
              roughness={0.2}
            />
          </mesh>

          {/* Bottom Machined Base Cap */}
          <mesh position={[0, -0.145, 0]}>
            <boxGeometry args={[0.39, 0.016, 0.086]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.85} />
          </mesh>

          {/* Backlit White Acrylic Panels - Front Side (-Z facing aisle) */}
          <mesh position={[0, 0, 0.042]}>
            <planeGeometry args={[0.34, 0.24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text
            position={[0, 0.03, 0.044]}
            fontSize={0.11}
            color="#090d16"
            anchorX="center"
            anchorY="middle"
          >
            {laneNumberStr}
          </Text>
          <Text
            position={[0, -0.065, 0.044]}
            fontSize={0.026}
            color="#047857"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            LANE OPEN
          </Text>

          {/* Reverse Side Facing +Z */}
          <mesh position={[0, 0, -0.042]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.34, 0.24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text
            position={[0, 0.03, -0.044]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.11}
            color="#090d16"
            anchorX="center"
            anchorY="middle"
          >
            {laneNumberStr}
          </Text>
          <Text
            position={[0, -0.065, -0.044]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.026}
            color="#047857"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            LANE OPEN
          </Text>

          {/* Clean Soft Neutral Work Downlight */}
          <pointLight
            position={[0, -0.18, 0]}
            color="#ffffff"
            intensity={isActiveDesk ? 0.9 : 0.3}
            distance={2.2}
          />
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Realistic Industrial Floor Dock Decal (Replaces Wireframe Cyan Planes)
// ---------------------------------------------------------------------------
const RealisticFloorDockDecal: React.FC<{
  laneIndex: number;
  position: [number, number, number];
  isActive: boolean;
}> = ({ laneIndex, position, isActive }) => {
  const laneStr = `0${laneIndex + 1}`;

  return (
    <group position={position}>
      {/* Heavy Industrial Vulcanized Rubber Dock Mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.36, 2.46]} />
        <meshStandardMaterial
          color={isActive ? '#141824' : '#0e121a'}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Outer Safety Beveled Hazard Border */}
      <group position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Top & Bottom Industrial Safety Strips */}
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[1.36, 0.04]} />
          <meshBasicMaterial color={isActive ? '#38bdf8' : '#d97706'} />
        </mesh>
        <mesh position={[0, -1.2, 0]}>
          <planeGeometry args={[1.36, 0.04]} />
          <meshBasicMaterial color={isActive ? '#38bdf8' : '#d97706'} />
        </mesh>
        {/* Left & Right Strips */}
        <mesh position={[-0.66, 0, 0]}>
          <planeGeometry args={[0.035, 2.36]} />
          <meshBasicMaterial color={isActive ? '#38bdf8' : '#d97706'} />
        </mesh>
        <mesh position={[0.66, 0, 0]}>
          <planeGeometry args={[0.035, 2.36]} />
          <meshBasicMaterial color={isActive ? '#38bdf8' : '#d97706'} />
        </mesh>
      </group>

      {/* Stenciled Shopping Trolley Wheel Alignment Grid - Rotated to face approaching customer */}
      <group position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        {/* Forward Direction Chevrons pointing into counter */}
        <Text
          position={[0, 0.82, 0]}
          fontSize={0.12}
          color={isActive ? '#38bdf8' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
        >
          ▲ ▲ ▲
        </Text>

        {/* Center Stenciled Typography facing customer correctly */}
        <Text
          position={[0, -0.54, 0]}
          fontSize={0.095}
          color={isActive ? '#f1f5f9' : '#cbd5e1'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {`LANE ${laneStr} • TROLLEY BAY`}
        </Text>
        <Text
          position={[0, -0.72, 0]}
          fontSize={0.05}
          color={isActive ? '#38bdf8' : '#64748b'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          [ AUTO-SCAN SENSOR DOCK ]
        </Text>

        {/* Trolley Wheel Alignment Corner Brackets */}
        {[-0.45, 0.45].map((wx, wIdx) => (
          <group key={`wheel-mk-${wx}-${wIdx}`} position={[wx, 0.1, 0]}>
            <mesh position={[0, 0.4, 0]}>
              <planeGeometry args={[0.12, 0.025]} />
              <meshBasicMaterial color={isActive ? '#38bdf8' : '#64748b'} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <planeGeometry args={[0.12, 0.025]} />
              <meshBasicMaterial color={isActive ? '#38bdf8' : '#64748b'} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Main BillingCounter3D Component
// ---------------------------------------------------------------------------
export const BillingCounter3D: React.FC<BillingCounterProps> = ({ position }) => {
  const laserRef = useRef<THREE.Mesh>(null);
  const conveyorBeltRibsRef = useRef<THREE.Group>(null);
  const bagGroupRefs = useRef<(THREE.Group | null)[]>([]);

  const isConveyorMoving = useBillingStore((state) => state.isConveyorMoving);
  const phase = useBillingStore((state) => state.phase);
  const runningTotal = useBillingStore((state) => state.runningTotal);

  const [activeDeskIndex, setActiveDeskIndex] = useState(1);
  const [bagScale, setBagScale] = useState(1.0);

  // 3.8m spacing between counter centers
  const counterXPositions = [-3.8, 0, 3.8];

  const handleBagBump = () => {
    setBagScale(1.15);
  };

  useFrame((_, delta) => {
    // Dynamic active counter selection based on real player position
    const playerX = martRuntime.playerPos[0];
    let targetIdx = 1;
    if (playerX < -3.5) {
      targetIdx = 0; // Bench 1 at -3.8 (trolley is in Box 1 at -5.7)
    } else if (playerX > 0.0) {
      targetIdx = 2; // Bench 3 at +3.8 (trolley is in Box 3 at +1.9)
    } else {
      targetIdx = 1; // Bench 2 at 0 (trolley is in Box 2 at -1.9)
    }
    if (targetIdx !== activeDeskIndex) {
      setActiveDeskIndex(targetIdx);
    }

    // Laser scanning beam animation
    if (laserRef.current) {
      const isScanning = phase === 'scanning';
      const speed = isScanning ? 16 : 4;
      laserRef.current.position.z =
        Math.sin(Date.now() * 0.001 * speed) * (isScanning ? 0.12 : 0.04);
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity = isScanning ? 0.95 : 0.45;
    }

    // Moving ribbed conveyor belt treads
    if (isConveyorMoving && conveyorBeltRibsRef.current) {
      conveyorBeltRibsRef.current.children.forEach((child) => {
        child.position.z += delta * 0.65;
        if (child.position.z > 0.8) {
          child.position.z = -0.8;
        }
      });
    }

    // Smoothly settle bag squash & stretch bounce
    if (bagScale > 1.0) {
      setBagScale((prev) => Math.max(1.0, prev - delta * 0.8));
    }
  });

  return (
    <group position={position}>
      {/* --- Overhead Luxury White Billing Signboard Spanning All 3 Counters --- */}
      <group position={[0, 3.5, 0]}>
        {/* Chrome Suspension Rods to Ceiling */}
        {[-4.2, -1.4, 1.4, 4.2].map((rodX, rIdx) => (
          <mesh key={`rod-${rIdx}`} position={[rodX, 0.75, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 1.3, 10]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* Polished Chrome Outer Bezel Frame */}
        <mesh>
          <boxGeometry args={[11.16, 0.96, 0.14]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Pristine Pure White High-Gloss Porcelain/Acrylic Board Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[11.0, 0.88, 0.16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.08} metalness={0.04} />
        </mesh>

        {/* FRONT FACE (Facing -Z towards supermarket aisles & customers approaching) */}
        <group position={[0, 0, -0.085]} rotation={[0, Math.PI, 0]}>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.42}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {'BILLING CHECKOUT'}
          </Text>
        </group>

        {/* BACK FACE (Facing +Z towards store exit & rear wall) */}
        <group position={[0, 0, 0.085]}>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.42}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {'BILLING CHECKOUT'}
          </Text>
        </group>
      </group>

      {/* --- 3 Photo-Realistic Supermarket Checkout Counters --- */}
      {counterXPositions.map((xOffset, cIdx) => {
        const isActiveDesk = cIdx === activeDeskIndex;

        return (
          <SingleCheckoutCounter
            key={`counter-${cIdx}`}
            laneIndex={cIdx}
            xOffset={xOffset}
            isActiveDesk={isActiveDesk}
            phase={phase}
            runningTotal={runningTotal}
            isConveyorMoving={isConveyorMoving}
            laserRef={isActiveDesk ? laserRef : null}
            conveyorBeltRibsRef={isActiveDesk ? conveyorBeltRibsRef : null}
            bagGroupRef={(el) => {
              bagGroupRefs.current[cIdx] = el;
            }}
            bagScale={bagScale}
          />
        );
      })}

      {/* --- Live 3D Parabolic Flying, Scanning & Packing Pipeline --- */}
      <ConveyorAnimation3D
        activeDeskX={counterXPositions[activeDeskIndex]}
        onBagBump={handleBagBump}
      />

      {/* --- Checkout Floor Queue Docks (Realistic Industrial Non-Slip Vinyl Decals) --- */}
      {/* Lane 1 Floor Queue Dock (Left of Counter 1 at x = -5.7) */}
      <RealisticFloorDockDecal
        laneIndex={0}
        position={[-5.7, 0.012, -0.6]}
        isActive={activeDeskIndex === 0}
      />

      {/* Lane 2 Floor Queue Dock (Left of Counter 2 at x = -1.9) */}
      <RealisticFloorDockDecal
        laneIndex={1}
        position={[-1.9, 0.012, -0.6]}
        isActive={activeDeskIndex === 1}
      />

      {/* Lane 3 Floor Queue Dock (Left of Counter 3 at x = +1.9) */}
      <RealisticFloorDockDecal
        laneIndex={2}
        position={[1.9, 0.012, -0.6]}
        isActive={activeDeskIndex === 2}
      />

      {/* --- Industrial Safety Hazard Sensor Line Across All 3 Lanes --- */}
      <group position={[0, 0.016, -2.4]}>
        {/* Main High-Visibility Safety Band */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14.2, 0.38]} />
          <meshStandardMaterial color="#facc15" roughness={0.8} />
        </mesh>
        {/* Dark Top & Bottom Edge Inlays */}
        <mesh position={[0, 0.001, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14.2, 0.02]} />
          <meshBasicMaterial color="#090d16" />
        </mesh>
        <mesh position={[0, 0.001, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14.2, 0.02]} />
          <meshBasicMaterial color="#090d16" />
        </mesh>
        <Text
          position={[0, 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.14}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {'▶ ▶ ▶   CHECKOUT SENSOR LINE • TROLLEY AUTO-SCAN DOCK   ◀ ◀ ◀'}
        </Text>
      </group>
    </group>
  );
};
