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

// 3D Item Mesh representing grocery items on the conveyor
const ConveyorItemMesh: React.FC<{
  item: CartItem;
  position: [number, number, number];
  rotation: [number, number, number];
  isLaserActive: boolean;
}> = ({ item, position, rotation, isLaserActive }) => {
  const isBottle = item.modelType === 'bottle' || /oil|shampoo|liquid|wash|dishwash/i.test(item.productName);
  const isClothing = item.modelType === 'shirt' || item.modelType === 'hanger' || /shirt|polo|kurta|saree|dress|jeans|apparel/i.test(item.productName) || !!item.size;
  const isChocolate = item.modelType === 'chocolate' || item.modelType === 'bar' || /dairy\s*milk|chocolate|kitkat/i.test(item.productName);
  const isSnack = /biscuit|bhujia|chocolate|silk|rocher|snack/i.test(item.productName);

  const color = item.color || (isBottle ? '#38bdf8' : isClothing ? '#818cf8' : isChocolate ? '#28074d' : isSnack ? '#fbbf24' : '#34d399');

  return (
    <group position={position} rotation={rotation}>
      {isBottle ? (
        <group>
          {/* Main Bottle Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.15, 14]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
          </mesh>
          {/* Bottle Neck & Cap */}
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.02, 0.045, 0.04, 14]} />
            <meshStandardMaterial color={color} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.125, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.025, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Front Printed Product Label */}
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.046, 0.046, 0.08, 14]} />
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
            <boxGeometry args={[0.20, 0.02, 0.09]} />
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
          {/* Grocery Carton Box (Atta, Cereals, Biscuits, Chocolates) */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.14, 0.10]} />
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

      {/* Holographic Laser Reflection Glow when passing scanner */}
      {isLaserActive && (
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.35} wireframe />
        </mesh>
      )}
    </group>
  );
};

// 3D Animated Conveyor Scanning System
const ConveyorAnimation3D: React.FC<{
  activeDeskX: number;
  onBagBump: () => void;
}> = ({ activeDeskX, onBagBump }) => {
  const phase = useBillingStore((state) => state.phase);
  const isPaused = useBillingStore((state) => state.isPaused);
  const cartItems = useCartStore((state) => state.items);

  // Flatten items for individual physical scanning
  const unitItems = useMemo(() => {
    return cartItems.flatMap((it) => Array(Math.min(it.quantity, 4)).fill(it)).slice(0, 14);
  }, [cartItems]);

  const [activeItems, setActiveItems] = useState<
    Array<{
      id: string;
      item: CartItem;
      index: number;
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

      // Initialize all items with staggered start times (2.2s gap between products for smooth, clear pacing)
      const initialized = unitItems.map((it, idx) => ({
        id: `${it.id}-${idx}`,
        item: it,
        index: idx,
        startTime: idx * 2.2,
        pos: [activeDeskX - 1.9, 0.75, 17.0] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
        stage: 'fly' as const,
        landSoundPlayed: false,
        scanSoundPlayed: false,
        priceTagY: 0,
        priceTagOpacity: 0,
      }));

      setActiveItems(initialized);
    } else if (phase === 'idle') {
      setActiveItems([]);
    }
  }, [phase, unitItems.length, activeDeskX]);

  useFrame((_, delta) => {
    if (phase !== 'scanning' || isPaused || activeItems.length === 0) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    let allDone = true;
    let anyStateChanged = false;

    // Source Trolley position (in customer passage lane to the LEFT of active desk)
    const playerX = martRuntime.playerPos[0];
    const trolleyX = playerX < activeDeskX
      ? Math.min(activeDeskX - 1.2, Math.max(activeDeskX - 2.5, playerX))
      : activeDeskX - 1.9;
    const trolleyZ = martRuntime.playerPos[2] > 14 && martRuntime.playerPos[2] < 20
      ? martRuntime.playerPos[2]
      : 17.0;

    // Conveyor Bench target coordinates on the countertop
    const beltX = activeDeskX - 0.20;
    const beltDropZ = 16.8; // Landing spot on the black rubber belt
    const scannerZ = 18.3; // Barcode optical window
    const bagZ = 19.1; // Green shopping bag packing station

    const updated = activeItems.map((p) => {
      if (p.stage === 'done') {
        return p;
      }

      allDone = false;
      const t = elapsed - p.startTime;

      if (t < 0) {
        // Waiting in trolley basket
        return p;
      }

      // Slower, smooth and clear animation pacing (3.2 seconds total per item)
      const totalItemDuration = 3.2;
      const progress = Math.min(1, Math.max(0, t / totalItemDuration));

      let curX = trolleyX;
      let curY = 0.75;
      let curZ = trolleyZ;
      let rotX = 0;
      let rotY = p.index * 0.4;
      let rotZ = 0;
      let curStage: 'fly' | 'convey' | 'scan' | 'pack' | 'done' = p.stage;
      let landSound = p.landSoundPlayed;
      let scanSound = p.scanSoundPlayed;
      let priceY = p.priceTagY;
      let priceOp = p.priceTagOpacity;

      // ==============================================================
      // 1. FLIGHT & PARABOLIC DROP DIRECTLY ONTO THE BENCH BLACK BELT (0% - 35%)
      // ==============================================================
      if (progress < 0.35) {
        curStage = 'fly';
        const u = progress / 0.35;
        const ease = u * u * (3 - 2 * u); // Smooth cubic ease-in-out

        curX = THREE.MathUtils.lerp(trolleyX, beltX, ease);
        curZ = THREE.MathUtils.lerp(trolleyZ, beltDropZ, ease);
        // Smooth parabolic arc rising from trolley basket and dropping down onto the bench belt
        curY = THREE.MathUtils.lerp(0.75, 1.08, ease) + Math.sin(u * Math.PI) * 0.55;

        rotX = Math.sin(u * Math.PI) * 0.35;
        rotZ = (1 - u) * 0.35;
      }
      // ==============================================================
      // 2. LANDING BOUNCE & GLIDING FORWARD IN A STRAIGHT LINE (35% - 66%)
      // ==============================================================
      else if (progress < 0.66) {
        curStage = 'convey';
        if (!landSound) {
          landSound = true;
          sounds.playItemLand();
          anyStateChanged = true;
        }

        const u = (progress - 0.35) / 0.31;
        curX = beltX;
        curZ = THREE.MathUtils.lerp(beltDropZ, scannerZ, u);

        // Soft landing damping bounce on the black rubber belt
        const bounce = Math.exp(-u * 6) * Math.sin(u * 12) * 0.035;
        curY = 1.08 + Math.max(0, bounce);

        rotX = 0;
        rotZ = 0;
      }
      // ==============================================================
      // 3. LASER BARCODE SCANNING & ADD AMOUNT (66% - 82%)
      // ==============================================================
      else if (progress < 0.82) {
        curStage = 'scan';
        curX = beltX;
        curZ = scannerZ;
        curY = 1.08;

        if (!scanSound) {
          scanSound = true;
          sounds.playScanBeep();
          // Update live cumulative total in store
          useBillingStore.setState((prev) => ({
            runningTotal: prev.runningTotal + p.item.price,
            currentIndex: Math.min(prev.totalToScan, p.index + 1),
          }));
          priceY = 1.28;
          priceOp = 1.0;
          anyStateChanged = true;
        }

        // Float holographic +₹XX price tag upwards
        priceY += delta * 0.45;
        priceOp = Math.max(0, priceOp - delta * 1.5);
      }
      // ==============================================================
      // 4. MOVE TO GREEN BAG & PACK INSIDE (82% - 100%)
      // ==============================================================
      else {
        curStage = 'pack';
        const u = (progress - 0.82) / 0.18;
        const ease = u * u * (3 - 2 * u);

        curX = beltX;
        curZ = THREE.MathUtils.lerp(scannerZ, bagZ, ease);

        // Arch over the bag rim and drop inside
        if (u < 0.5) {
          curY = THREE.MathUtils.lerp(1.08, 1.25, u * 2);
          rotX = u * 0.5;
        } else {
          curY = THREE.MathUtils.lerp(1.25, 1.10, (u - 0.5) * 2);
          rotX = 0.5 - (u - 0.5) * 0.3;
        }

        if (progress >= 0.98) {
          curStage = 'done';
          onBagBump();
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

    // Auto-transition to review bill once all items finish their 3D conveyor journey
    if (allDone && !finishedRef.current && activeItems.length > 0) {
      finishedRef.current = true;
      sounds.playCashRegister();
      setTimeout(() => {
        useBillingStore.getState().skipToReview();
      }, 400);
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

            {/* 3D Floating holographic price tag when scanned */}
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

export const BillingCounter3D: React.FC<BillingCounterProps> = ({ position }) => {
  const laserRef = useRef<THREE.Mesh>(null);
  const conveyorBeltRibsRef = useRef<THREE.Group>(null);
  const bagGroupRefs = useRef<(THREE.Group | null)[]>([]);

  const isConveyorMoving = useBillingStore((state) => state.isConveyorMoving);
  const phase = useBillingStore((state) => state.phase);
  const runningTotal = useBillingStore((state) => state.runningTotal);
  const currentScanningItem = useBillingStore((state) => state.currentScanningItem);

  // Active desk index (0, 1, or 2) closest to player
  const [activeDeskIndex, setActiveDeskIndex] = useState(1);
  const [bagScale, setBagScale] = useState(1.0);

  // Generous 3.8m spacing creates 2.5m wide customer passage lanes
  const counterXPositions = [-3.8, 0, 3.8];

  const handleBagBump = () => {
    setBagScale(1.15);
  };

  useFrame((_, delta) => {
    // Dynamic active counter selection based on real player position in left-side boxes
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
      laserRef.current.position.z = Math.sin(Date.now() * 0.001 * speed) * (isScanning ? 0.12 : 0.04);
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

        {/* ============================================================== */}
        {/* FRONT FACE (Facing -Z towards supermarket aisles & customers approaching) */}
        {/* ============================================================== */}
        <group position={[0, 0, -0.085]} rotation={[0, Math.PI, 0]}>
          {/* Clean, Prominent Dark Slate Title - No Colors or Clutter */}
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

        {/* ============================================================== */}
        {/* BACK FACE (Facing +Z towards store exit & rear wall) */}
        {/* ============================================================== */}
        <group position={[0, 0, 0.085]}>
          {/* Clean, Prominent Dark Slate Title - No Colors or Clutter */}
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

      {/* --- 3 Checkout Counters with Generous 2.5m Wide Passageways --- */}
      {counterXPositions.map((xOffset, cIdx) => {
        const isActiveDesk = cIdx === activeDeskIndex;

        return (
          <group key={`counter-${cIdx}`} position={[xOffset, 0, 0]}>
            {/* Main Counter Desk Base (width: 1.3, depth: 3.2, height: 1.0) */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.3, 1.0, 3.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>

            {/* Stainless Steel / Clean White Countertop */}
            <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.35, 0.06, 3.25]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.2} />
            </mesh>

            {/* Black Rubber Conveyor Belt ("That Black Spot") */}
            <group position={[-0.15, 1.06, -0.6]}>
              <mesh receiveShadow>
                <boxGeometry args={[0.65, 0.02, 1.6]} />
                <meshStandardMaterial color="#09090b" roughness={0.9} />
              </mesh>

              {/* Animated Conveyor Ribbed Tread Lines */}
              <group ref={isActiveDesk ? conveyorBeltRibsRef : null}>
                {Array.from({ length: 14 }).map((_, rIdx) => (
                  <mesh
                    key={`rib-${rIdx}`}
                    position={[0, 0.012, -0.75 + rIdx * 0.115]}
                  >
                    <boxGeometry args={[0.62, 0.005, 0.018]} />
                    <meshBasicMaterial color="#1e293b" />
                  </mesh>
                ))}
              </group>
            </group>

            {/* Barcode Scanner Optical Glass Window with Red Laser Line */}
            <group position={[-0.15, 1.07, 0.3]}>
              {/* Glass Optical Aperture */}
              <mesh>
                <boxGeometry args={[0.32, 0.01, 0.32]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.7} />
              </mesh>

              {/* Dynamic Sweeping Red Laser Line */}
              <mesh
                ref={isActiveDesk ? laserRef : null}
                position={[0, 0.02, 0]}
              >
                <boxGeometry args={[0.28, 0.01, 0.025]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.85} />
              </mesh>

              {/* Vertical Laser Scan Fan Light */}
              <mesh position={[0, 0.12, 0]} rotation={[0, 0, 0]}>
                <planeGeometry args={[0.28, 0.22]} />
                <meshBasicMaterial
                  color="#ef4444"
                  transparent
                  opacity={phase === 'scanning' && isActiveDesk ? 0.35 : 0.08}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Subtle Red Laser Light */}
              <pointLight
                position={[0, 0.15, 0]}
                color="#ef4444"
                intensity={phase === 'scanning' && isActiveDesk ? 1.5 : 0.3}
                distance={0.9}
              />
            </group>

            {/* POS Touchscreen Monitor */}
            <group position={[0.42, 1.35, 0.3]} rotation={[0, -0.4, 0]}>
              {/* Monitor Stand */}
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              {/* Monitor Screen Frame */}
              <mesh castShadow>
                <boxGeometry args={[0.48, 0.34, 0.04]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Glowing Screen Content */}
              <mesh position={[0, 0, 0.025]}>
                <planeGeometry args={[0.44, 0.3]} />
                <meshBasicMaterial
                  color={isActiveDesk && phase === 'scanning' ? '#047857' : '#0284c7'}
                />
              </mesh>
              <Text
                position={[0, 0.03, 0.03]}
                fontSize={0.038}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {isActiveDesk && phase === 'scanning'
                  ? `MARTVERSE POS • LANE ${cIdx + 1}\nSCANNING ITEMS...\nTOTAL: ₹${runningTotal.toFixed(2)}`
                  : isActiveDesk && phase === 'review'
                  ? `MARTVERSE POS • LANE ${cIdx + 1}\nBILL READY\nTOTAL: ₹${runningTotal.toFixed(2)}`
                  : `MARTVERSE POS\nLANE ${cIdx + 1}\nREADY FOR CHECKOUT`}
              </Text>
            </group>

            {/* Bagging Area (Green Shopping Bags with Physical Bounce) */}
            <group
              ref={(el) => {
                bagGroupRefs.current[cIdx] = el;
              }}
              position={[-0.15, 1.15, 1.1]}
              scale={isActiveDesk ? [1, bagScale, 1] : [1, 1, 1]}
            >
              <mesh castShadow>
                <boxGeometry args={[0.38, 0.30, 0.28]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
              {/* Open Bag Rim Inside */}
              <mesh position={[0, 0.155, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.34, 0.24]} />
                <meshBasicMaterial color="#052e16" />
              </mesh>
              <Text
                position={[0, 0, 0.145]}
                fontSize={0.048}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                MARTVERSE
              </Text>
            </group>
          </group>
        );
      })}

      {/* --- Live 3D Parabolic Flying, Scanning & Packing Pipeline --- */}
      <ConveyorAnimation3D
        activeDeskX={counterXPositions[activeDeskIndex]}
        onBagBump={handleBagBump}
      />

      {/* --- Checkout Lane 1 Floor Queue Box (Left of Counter 1 at x = -5.7) --- */}
      <group position={[-5.7, 0.015, -0.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshBasicMaterial color={activeDeskIndex === 0 ? "#10b981" : "#38bdf8"} transparent opacity={0.10} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshBasicMaterial color={activeDeskIndex === 0 ? "#10b981" : "#38bdf8"} wireframe />
        </mesh>
        <Text
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.11}
          color={activeDeskIndex === 0 ? "#10b981" : "#38bdf8"}
          anchorX="center"
          anchorY="middle"
        >
          {'LANE 1 • TROLLEY PARKING\n[ AUTO-SCAN ZONE ]'}
        </Text>
      </group>

      {/* --- Checkout Lane 2 Floor Queue Box (Left of Counter 2 at x = -1.9) --- */}
      <group position={[-1.9, 0.015, -0.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshBasicMaterial color={activeDeskIndex === 1 ? "#10b981" : "#38bdf8"} transparent opacity={0.10} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshBasicMaterial color={activeDeskIndex === 1 ? "#10b981" : "#38bdf8"} wireframe />
        </mesh>
        <Text
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.11}
          color={activeDeskIndex === 1 ? "#10b981" : "#38bdf8"}
          anchorX="center"
          anchorY="middle"
        >
          {'LANE 2 • TROLLEY PARKING\n[ AUTO-SCAN ZONE ]'}
        </Text>
      </group>

      {/* --- Checkout Lane 3 Floor Queue Box (Left of Counter 3 at x = +1.9) --- */}
      <group position={[1.9, 0.015, -0.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshBasicMaterial color={activeDeskIndex === 2 ? "#10b981" : "#38bdf8"} transparent opacity={0.10} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.4]} />
          <meshBasicMaterial color={activeDeskIndex === 2 ? "#10b981" : "#38bdf8"} wireframe />
        </mesh>
        <Text
          position={[0, 0.015, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.11}
          color={activeDeskIndex === 2 ? "#10b981" : "#38bdf8"}
          anchorX="center"
          anchorY="middle"
        >
          {'LANE 3 • TROLLEY PARKING\n[ AUTO-SCAN ZONE ]'}
        </Text>
      </group>

      {/* --- Prominent Stop & Auto-Scan Floor Sensor Line Across All 3 Lanes --- */}
      <group position={[0, 0.018, -2.4]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14.0, 0.35]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <Text
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
        >
          {'=== CHECKOUT SENSOR LINE • TROLLEY AUTO-SCAN ZONE ==='}
        </Text>
      </group>
    </group>
  );
};
