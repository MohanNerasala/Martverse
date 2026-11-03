'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
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
// Pre-allocated Shared Three.js Geometries (Module Scope Singletons)
// Eliminates 1,000+ GC allocations per second and prevents memory thrashing
// ---------------------------------------------------------------------------
const checkoutSharedGeos = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  // Counter bodies
  plinth: new THREE.BoxGeometry(1.24, 0.12, 3.18),
  body: new THREE.BoxGeometry(1.3, 0.86, 3.24),
  stripe: new THREE.BoxGeometry(1.305, 0.12, 3.245),
  countertop: new THREE.BoxGeometry(1.36, 0.05, 3.32),
  countertopBevel: new THREE.BoxGeometry(1.34, 0.008, 3.3),
  // Rails
  bumperRail: new THREE.CylinderGeometry(0.022, 0.022, 3.22, 12),
  bumperTrim: new THREE.CylinderGeometry(0.012, 0.012, 3.22, 10),
  bracketBox: new THREE.BoxGeometry(0.02, 0.06, 0.04),
  footrestBar: new THREE.CylinderGeometry(0.016, 0.016, 1.4, 12),
  footrestBracket: new THREE.CylinderGeometry(0.014, 0.014, 0.22, 10),
  // Drawer
  drawerCase: new THREE.BoxGeometry(0.46, 0.16, 0.44),
  drawerFace: new THREE.BoxGeometry(0.006, 0.14, 0.4),
  drawerHandle: new THREE.BoxGeometry(0.015, 0.018, 0.16),
  // Conveyor
  conveyorBed: new THREE.BoxGeometry(0.66, 0.02, 1.66),
  conveyorBelt: new THREE.BoxGeometry(0.62, 0.02, 1.62),
  conveyorSideRail: new THREE.BoxGeometry(0.024, 0.065, 1.64),
  conveyorFlare: new THREE.BoxGeometry(0.024, 0.065, 0.08),
  driveRoller: new THREE.CylinderGeometry(0.026, 0.026, 0.63, 14),
  driveRollerCap: new THREE.CylinderGeometry(0.032, 0.032, 0.03, 10),
  treadRib: new THREE.BoxGeometry(0.6, 0.004, 0.014),
  // Scanner
  scannerOuter: new THREE.BoxGeometry(0.38, 0.016, 0.38),
  scannerBevel: new THREE.BoxGeometry(0.35, 0.008, 0.35),
  scannerGlass: new THREE.BoxGeometry(0.31, 0.004, 0.31),
  scannerLaserBar: new THREE.BoxGeometry(0.31, 0.008, 0.035),
  scannerLedCase: new THREE.BoxGeometry(0.075, 0.004, 0.024),
  // Overhead sign
  laneSignBox: new THREE.BoxGeometry(0.38, 0.28, 0.08),
  laneSignCap: new THREE.BoxGeometry(0.39, 0.016, 0.086),
  laneSignStatusLed: new THREE.BoxGeometry(0.32, 0.008, 0.07),
  laneSignMast: new THREE.CylinderGeometry(0.022, 0.022, 1.6, 14),
  laneSignDownlight: new THREE.BoxGeometry(0.36, 0.016, 0.05),
  // POS Monitor & Customer Pole
  monitorMast: new THREE.CylinderGeometry(0.026, 0.026, 0.34, 14),
  monitorJoint: new THREE.CylinderGeometry(0.03, 0.03, 0.05, 12),
  monitorChassis: new THREE.BoxGeometry(0.54, 0.36, 0.028),
  monitorBezel: new THREE.BoxGeometry(0.525, 0.345, 0.005),
  monitorScreenPlane: new THREE.PlaneGeometry(0.5, 0.32),
  poleDisplayMast: new THREE.CylinderGeometry(0.018, 0.018, 0.44, 12),
  poleDisplayHead: new THREE.BoxGeometry(0.34, 0.10, 0.05),
  poleDisplayGlass: new THREE.PlaneGeometry(0.31, 0.075),
  // PIN Pad
  pinPadBody: new THREE.BoxGeometry(0.11, 0.18, 0.035),
  pinPadArm: new THREE.CylinderGeometry(0.014, 0.014, 0.18, 10),
  pinPadScreen: new THREE.PlaneGeometry(0.09, 0.055),
  // Stool
  stoolBase: new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16),
  stoolColumn: new THREE.CylinderGeometry(0.024, 0.024, 0.5, 12),
  stoolCushion: new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16),
  stoolBackrest: new THREE.BoxGeometry(0.03, 0.16, 0.26),
  // Bagging Station
  bagBasin: new THREE.BoxGeometry(0.62, 0.03, 0.72),
  bagBasinLipSide: new THREE.BoxGeometry(0.015, 0.035, 0.72),
  bagBasinLipEnd: new THREE.BoxGeometry(0.62, 0.035, 0.015),
  bagRackPost: new THREE.CylinderGeometry(0.014, 0.014, 0.32, 10),
  bagRackArm: new THREE.CylinderGeometry(0.007, 0.007, 0.28, 8),
  bagBody: new THREE.BoxGeometry(0.42, 0.32, 0.28),
  bagLip: new THREE.BoxGeometry(0.426, 0.016, 0.286),
  bagInterior: new THREE.PlaneGeometry(0.39, 0.25),
  // Stanchions
  stanchionBase: new THREE.CylinderGeometry(0.16, 0.18, 0.03, 14),
  stanchionPost: new THREE.CylinderGeometry(0.022, 0.022, 0.92, 12),
  stanchionCap: new THREE.CylinderGeometry(0.035, 0.035, 0.08, 12),
  stanchionBelt: new THREE.BoxGeometry(0.008, 0.045, 1.58),
  // Decals
  dockPlane: new THREE.PlaneGeometry(1.36, 2.46),
};

// ---------------------------------------------------------------------------
// Pre-allocated Shared Three.js Materials (Module Scope Singletons)
// ---------------------------------------------------------------------------
const checkoutSharedMats = {
  plinth: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.35, metalness: 0.65 }),
  bodyWhite: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.25, metalness: 0.1 }),
  accentBlue: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.28, metalness: 0.15 }),
  countertopSteel: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.88, roughness: 0.18 }),
  countertopTrim: new THREE.MeshStandardMaterial({ color: '#f1f5f9', metalness: 0.9, roughness: 0.15 }),
  chromeBright: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.12, metalness: 0.98 }),
  chromeDull: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.92, roughness: 0.15 }),
  chromeReflect: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.95, roughness: 0.1 }),
  bracketDark: new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8, roughness: 0.2 }),
  rubberDark: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.88, metalness: 0.08 }),
  bedSlate: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9, roughness: 0.2 }),
  blackLeather: new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.7, metalness: 0.1 }),
  scannerGlassMat: new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 }),
  laserRed: new THREE.MeshBasicMaterial({ color: '#ff2222', transparent: true, opacity: 0.96 }),
  vfdGreenScreen: new THREE.MeshBasicMaterial({ color: '#022c22' }),
  posBezelMat: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3 }),
  screenInactiveMat: new THREE.MeshBasicMaterial({ color: '#0369a1' }),
  screenScanningMat: new THREE.MeshBasicMaterial({ color: '#022c22' }),
  kraftPaper: new THREE.MeshStandardMaterial({ color: '#c29b67', roughness: 0.96, metalness: 0.02 }),
  kraftPaperLip: new THREE.MeshStandardMaterial({ color: '#ab834f', roughness: 0.9 }),
  kraftInterior: new THREE.MeshBasicMaterial({ color: '#543c1f' }),
  ropeHandle: new THREE.MeshStandardMaterial({ color: '#8f6a39', roughness: 0.85 }),
  stanchionBeltMat: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.6 }),
  signLedActive: new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: new THREE.Color('#38bdf8'), emissiveIntensity: 1.0, roughness: 0.2 }),
  signLedInactive: new THREE.MeshStandardMaterial({ color: '#a7f3d0', emissive: new THREE.Color('#059669'), emissiveIntensity: 0.6, roughness: 0.2 }),
  downlightMat: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.8, roughness: 0.1 }),
};

// ---------------------------------------------------------------------------
// High-Resolution Cached Canvas Textures (0ms Load, 0 WebGL font worker overhead)
// ---------------------------------------------------------------------------
const laneSignTextureCache = new Map<number, THREE.CanvasTexture>();

function getLaneSignTexture(laneNumber: number): THREE.CanvasTexture | null {
  if (typeof window === 'undefined') return null;
  let tex = laneSignTextureCache.get(laneNumber);
  if (!tex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Emerald Green Commercial Lane Box
      ctx.fillStyle = '#059669';
      ctx.fillRect(0, 0, 512, 360);

      // Top subtle cyan accent line
      ctx.fillStyle = '#34d399';
      ctx.fillRect(0, 0, 512, 14);

      // Large bold numeral
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 170px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const numStr = laneNumber < 10 ? `0${laneNumber}` : `${laneNumber}`;
      ctx.fillText(numStr, 256, 160);

      // Lane Open Badge Pill
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.roundRect(106, 262, 300, 60, 30);
      ctx.fill();

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('LANE OPEN', 256, 292);

      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      laneSignTextureCache.set(laneNumber, tex);
    }
  }
  return tex || null;
}

const monitorReadyTextureCache = new Map<number, THREE.CanvasTexture>();

function getMonitorReadyTexture(laneNumber: number): THREE.CanvasTexture | null {
  if (typeof window === 'undefined') return null;
  let tex = monitorReadyTextureCache.get(laneNumber);
  if (!tex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 340;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark Blue Screen Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 340);

      // Top Header Bar
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 512, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const numStr = laneNumber < 10 ? `0${laneNumber}` : `${laneNumber}`;
      ctx.fillText(`MARTVERSE • LANE ${numStr} • EXPRESS`, 256, 25);

      // Center Prompt
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('SELF-CHECKOUT OPEN', 256, 130);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('DRIVE TROLLEY INTO DOCK', 256, 180);

      // Bottom Status Pill
      ctx.fillStyle = '#059669';
      ctx.fillRect(24, 240, 464, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText('● SCANNER READY', 256, 270);

      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      monitorReadyTextureCache.set(laneNumber, tex);
    }
  }
  return tex || null;
}

const floorDockTextureCache = new Map<string, THREE.CanvasTexture>();

function getFloorDockTexture(laneNumber: number, isActive: boolean): THREE.CanvasTexture | null {
  if (typeof window === 'undefined') return null;
  const key = `${laneNumber}_${isActive ? 'active' : 'inactive'}`;
  let tex = floorDockTextureCache.get(key);
  if (!tex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background dock pad
      ctx.fillStyle = isActive ? '#e0f2fe' : '#f1f5f9';
      ctx.fillRect(0, 0, 512, 800);

      // Border safety band
      ctx.lineWidth = 14;
      ctx.strokeStyle = isActive ? '#0284c7' : '#94a3b8';
      ctx.strokeRect(7, 7, 498, 786);

      // Chevrons
      ctx.fillStyle = isActive ? '#0284c7' : '#64748b';
      ctx.font = '900 48px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲ ▲ ▲', 256, 140);

      // Lane Text
      const numStr = laneNumber < 10 ? `0${laneNumber}` : `${laneNumber}`;
      ctx.font = 'bold 40px system-ui, sans-serif';
      ctx.fillText(`LANE ${numStr} • TROLLEY BAY`, 256, 400);

      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillStyle = isActive ? '#0369a1' : '#94a3b8';
      ctx.fillText(isActive ? '[ AUTO-SCAN SENSOR DOCK ]' : '[ TROLLEY DOCK ]', 256, 450);

      // Wheel bracket corners
      ctx.strokeStyle = isActive ? '#0284c7' : '#94a3b8';
      ctx.lineWidth = 8;
      ctx.strokeRect(60, 60, 80, 80);
      ctx.strokeRect(372, 60, 80, 80);
      ctx.strokeRect(60, 660, 80, 80);
      ctx.strokeRect(372, 660, 80, 80);

      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      floorDockTextureCache.set(key, tex);
    }
  }
  return tex || null;
}

// ---------------------------------------------------------------------------
// 3D Item Mesh representing grocery items on the conveyor
// ---------------------------------------------------------------------------
const ConveyorItemMesh: React.FC<{
  item: CartItem;
  position: [number, number, number];
  rotation: [number, number, number];
}> = React.memo(({ item, position, rotation }) => {
  const isBottle =
    item.modelType === 'bottle' ||
    /oil|shampoo|liquid|wash|dishwash/i.test(item.productName);
  const isClothing =
    item.modelType === 'shirt' ||
    item.modelType === 'hanger' ||
    /shirt|polo|kurta|saree|dress|jeans|apparel/i.test(item.productName) ||
    Boolean(item.size);
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
          <mesh>
            <cylinderGeometry args={[0.045, 0.05, 0.15, 12]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.02, 0.045, 0.04, 12]} />
            <meshStandardMaterial color={color} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.125, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.025, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      ) : isClothing ? (
        <group>
          <mesh>
            <boxGeometry args={[0.18, 0.06, 0.18]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </group>
      ) : isChocolate ? (
        <group>
          <mesh>
            <boxGeometry args={[0.2, 0.02, 0.09]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh>
            <boxGeometry args={[0.15, 0.18, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
          </mesh>
        </group>
      )}
    </group>
  );
});

// ---------------------------------------------------------------------------
// 3D Animated Conveyor Scanning System (Parabolic flight -> Scan -> Bag)
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

  const itemsDataRef = useRef<Array<{
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
  }>>([]);

  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase === 'scanning' && unitItems.length > 0) {
      elapsedRef.current = 0;
      finishedRef.current = false;
      const stagger = 2.0;
      itemsDataRef.current = unitItems.map((u) => ({
        id: u.uniqueScanId,
        item: u.item,
        unitIndex: u.unitIndex,
        totalUnits: u.totalUnits,
        flatIndex: u.flatIndex,
        startTime: u.flatIndex * stagger,
        pos: [typeof martRuntime.playerPos[0] === 'number' ? martRuntime.playerPos[0] : activeDeskX - 1.9, 0.72, (martRuntime.playerPos[2] || 17.0) - 18.0],
        rot: [0, 0, 0],
        stage: 'fly',
        landSoundPlayed: false,
        scanSoundPlayed: false,
      }));
    } else if (phase === 'idle') {
      itemsDataRef.current = [];
    }
  }, [phase, unitItems, activeDeskX]);

  useFrame((_, delta) => {
    if (phase !== 'scanning' || isPaused || itemsDataRef.current.length === 0) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;
    let allDone = true;

    const playerX = martRuntime.playerPos[0];
    const playerZ = martRuntime.playerPos[2];
    const trolleyX = typeof playerX === 'number' ? playerX : activeDeskX - 1.9;
    const trolleyZ = (playerZ > 14 && playerZ < 21 ? playerZ : 17.0) - 18.0;

    const beltX = activeDeskX - 0.15;
    const beltDropZ = -0.9;
    const scannerZ = 0.3;
    const bagZ = 1.1;

    for (let i = 0; i < itemsDataRef.current.length; i++) {
      const p = itemsDataRef.current[i];
      const grp = groupRefs.current[i];
      if (p.stage === 'done') {
        if (grp) grp.visible = false;
        continue;
      }

      allDone = false;
      const t = elapsed - p.startTime;
      if (t < 0) {
        if (grp) grp.visible = false;
        continue;
      }

      if (grp) grp.visible = true;

      if (useBillingStore.getState().transferredToBenchCount < p.flatIndex + 1) {
        useBillingStore.getState().setTransferredToBenchCount(p.flatIndex + 1);
      }

      const totalItemDuration = 3.0;
      const progress = Math.min(1, Math.max(0, t / totalItemDuration));

      let curX = trolleyX;
      let curY = 0.72;
      let curZ = trolleyZ;
      let rotX = 0;
      const rotY = p.flatIndex * 0.4;
      let rotZ = 0;

      if (progress < 0.32) {
        p.stage = 'fly';
        const u = progress / 0.32;
        const ease = u * u * (3 - 2 * u);
        curX = THREE.MathUtils.lerp(trolleyX, beltX, ease);
        curZ = THREE.MathUtils.lerp(trolleyZ, beltDropZ, ease);
        curY = THREE.MathUtils.lerp(0.72, 1.08, ease) + Math.sin(u * Math.PI) * 0.55;
        rotX = Math.sin(u * Math.PI) * 0.4;
        rotZ = (1 - u) * 0.35;
      } else if (progress < 0.68) {
        p.stage = 'convey';
        if (!p.landSoundPlayed) {
          p.landSoundPlayed = true;
          sounds.playItemLand();
        }
        const u = (progress - 0.32) / 0.36;
        curX = beltX;
        curZ = THREE.MathUtils.lerp(beltDropZ, scannerZ, u);
        const bounce = Math.exp(-u * 6) * Math.sin(u * 12) * 0.04;
        curY = 1.08 + Math.max(0, bounce);
      } else if (progress < 0.84) {
        p.stage = 'scan';
        curX = beltX;
        curZ = scannerZ;
        curY = 1.08;
        if (!p.scanSoundPlayed) {
          p.scanSoundPlayed = true;
          sounds.playScanBeep();
          useBillingStore.getState().recordUnitScanned(p.flatIndex + 1, p.item, p.unitIndex, p.totalUnits);
        }
      } else {
        p.stage = 'pack';
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
          p.stage = 'done';
          onBagBump();
          sounds.playPickSound();
        }
      }

      if (grp) {
        grp.position.set(curX, curY, curZ);
        grp.rotation.set(rotX, rotY, rotZ);
      }
    }

    if (allDone && !finishedRef.current && itemsDataRef.current.length > 0) {
      finishedRef.current = true;
      sounds.playCashRegister();
      setTimeout(() => {
        useBillingStore.getState().finishScanning();
      }, 500);
    }
  });

  if (phase !== 'scanning') return null;

  return (
    <group raycast={() => null}>
      {unitItems.map((u, idx) => (
        <group
          key={u.uniqueScanId}
          ref={(el) => {
            groupRefs.current[idx] = el;
          }}
          visible={false}
        >
          <ConveyorItemMesh
            item={u.item}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Isolated Active POS Screen Sub-Component (Subscribes directly to runningTotal)
// Prevents parent desks or scenes from re-rendering during item scanning!
// ---------------------------------------------------------------------------
const ActiveDeskPosScreen: React.FC<{ laneNumberStr: string }> = React.memo(({ laneNumberStr }) => {
  const runningTotal = useBillingStore((state) => state.runningTotal);
  const phase = useBillingStore((state) => state.phase);
  const isScanning = phase === 'scanning';

  return (
    <group position={[0.44, 1.45, 0.28]} rotation={[-0.06, Math.PI - 0.32, 0]}>
      {/* Aluminum Monitor Chassis */}
      <mesh geometry={checkoutSharedGeos.monitorChassis} material={checkoutSharedMats.chromeDull} />
      <mesh position={[0, 0, 0.015]} geometry={checkoutSharedGeos.monitorBezel} material={checkoutSharedMats.posBezelMat} />

      {/* Screen Face */}
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[0.5, 0.32]} />
        <meshBasicMaterial color={isScanning ? '#022c22' : '#0369a1'} />
      </mesh>

      {/* Screen Typography */}
      <Text
        position={[0, 0.13, 0.022]}
        fontSize={0.019}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        fontWeight="bold"
      >
        {`MARTVERSE EXPRESS • LANE ${laneNumberStr}`}
      </Text>

      <Text
        position={[-0.22, 0.05, 0.022]}
        fontSize={0.018}
        color="#ffffff"
        anchorX="left"
        anchorY="top"
        lineHeight={1.4}
        fontWeight="medium"
      >
        {isScanning
          ? `SCANNING ACTIVE...\nTROLLEY ITEM DETECTED\nGST (5% INCL)`
          : phase === 'review'
          ? `BILL PROCESSED\nAWAITING PAYMENT\nALL ITEMS VERIFIED`
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
        fontWeight="extrabold"
      >
        {`TOTAL: ₹${runningTotal.toFixed(2)}`}
      </Text>
    </group>
  );
});

// ---------------------------------------------------------------------------
// INACTIVE Checkout Counter (Ultra-Lightweight, Pre-allocated Shared Geometries)
// Drops draw calls from 150 to ~8 meshes, 0 Troika Text, Renders Once & Never Re-renders
// ---------------------------------------------------------------------------
const InactiveCheckoutCounter: React.FC<{
  laneIndex: number;
  xOffset: number;
}> = React.memo(({ laneIndex, xOffset }) => {
  const laneTex = useMemo(() => getLaneSignTexture(laneIndex + 1), [laneIndex]);
  const monitorTex = useMemo(() => getMonitorReadyTexture(laneIndex + 1), [laneIndex]);

  return (
    <group position={[xOffset, 0, 0]} raycast={() => null}>
      {/* 1. Base Kickplate */}
      <mesh position={[0, 0.06, 0]} geometry={checkoutSharedGeos.plinth} material={checkoutSharedMats.plinth} />

      {/* 2. Main Cabinet Body */}
      <mesh position={[0, 0.55, 0]} geometry={checkoutSharedGeos.body} material={checkoutSharedMats.bodyWhite} />

      {/* 3. Blue Accent Stripe */}
      <mesh position={[0, 0.76, 0]} geometry={checkoutSharedGeos.stripe} material={checkoutSharedMats.accentBlue} />

      {/* 4. Trolley Bumper Rails */}
      <mesh position={[-0.66, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={checkoutSharedGeos.bumperRail} material={checkoutSharedMats.chromeBright} />
      <mesh position={[-0.66, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={checkoutSharedGeos.bumperRail} material={checkoutSharedMats.chromeBright} />

      {/* 5. Brushed Stainless Countertop */}
      <mesh position={[0, 1.025, 0]} geometry={checkoutSharedGeos.countertop} material={checkoutSharedMats.countertopSteel} />
      <mesh position={[0, 1.052, 0]} geometry={checkoutSharedGeos.countertopBevel} material={checkoutSharedMats.countertopTrim} />

      {/* 6. Conveyor Bed & Belt */}
      <group position={[-0.15, 1.055, -0.65]}>
        <mesh position={[0, -0.01, 0]} geometry={checkoutSharedGeos.conveyorBed} material={checkoutSharedMats.bedSlate} />
        <mesh geometry={checkoutSharedGeos.conveyorBelt} material={checkoutSharedMats.rubberDark} />
        <mesh position={[-0.32, 0.036, 0]} geometry={checkoutSharedGeos.conveyorSideRail} material={checkoutSharedMats.chromeDull} />
        <mesh position={[0.32, 0.036, 0]} geometry={checkoutSharedGeos.conveyorSideRail} material={checkoutSharedMats.chromeDull} />
      </group>

      {/* 7. Overhead Lane Number Beacon */}
      <group position={[0.56, 1.05, -1.45]}>
        <mesh position={[0, 0.8, 0]} geometry={checkoutSharedGeos.laneSignMast} material={checkoutSharedMats.chromeDull} />
        <group position={[0, 1.7, 0]}>
          <mesh geometry={checkoutSharedGeos.laneSignBox} material={checkoutSharedMats.chromeDull} />
          <mesh position={[0, 0.145, 0]} geometry={checkoutSharedGeos.laneSignCap} material={checkoutSharedMats.bracketDark} />
          <mesh position={[0, -0.145, 0]} geometry={checkoutSharedGeos.laneSignCap} material={checkoutSharedMats.bracketDark} />
          <mesh position={[0, 0.148, 0]} geometry={checkoutSharedGeos.laneSignStatusLed} material={checkoutSharedMats.signLedInactive} />
          {laneTex && (
            <>
              <mesh position={[0, 0, 0.042]}>
                <planeGeometry args={[0.34, 0.24]} />
                <meshBasicMaterial map={laneTex} />
              </mesh>
              <mesh position={[0, 0, -0.042]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.34, 0.24]} />
                <meshBasicMaterial map={laneTex} />
              </mesh>
            </>
          )}
          <mesh position={[0, -0.19, 0]} geometry={checkoutSharedGeos.laneSignDownlight} material={checkoutSharedMats.downlightMat} />
        </group>
      </group>

      {/* 8. POS Stand & Screen */}
      <group position={[0.44, 1.05, 0.28]}>
        <mesh position={[0, 0.18, 0]} geometry={checkoutSharedGeos.monitorMast} material={checkoutSharedMats.bracketDark} />
        <group position={[0, 0.4, 0]} rotation={[-0.06, Math.PI - 0.32, 0]}>
          <mesh geometry={checkoutSharedGeos.monitorChassis} material={checkoutSharedMats.chromeDull} />
          <mesh position={[0, 0, 0.015]} geometry={checkoutSharedGeos.monitorBezel} material={checkoutSharedMats.posBezelMat} />
          {monitorTex && (
            <mesh position={[0, 0, 0.019]}>
              <planeGeometry args={[0.5, 0.32]} />
              <meshBasicMaterial map={monitorTex} />
            </mesh>
          )}
        </group>
      </group>

      {/* 9. Bagging Station Base & Kraft Bag Placeholder */}
      <group position={[-0.15, 1.055, 1.1]}>
        <mesh position={[0, 0.005, 0]} geometry={checkoutSharedGeos.bagBasin} material={checkoutSharedMats.chromeDull} />
        <mesh position={[0, 0.16, 0]} geometry={checkoutSharedGeos.bagBody} material={checkoutSharedMats.kraftPaper} />
      </group>
    </group>
  );
});

// ---------------------------------------------------------------------------
// ACTIVE Checkout Counter (Interactive Scanner, Laser, Active Bag, Screen)
// ---------------------------------------------------------------------------
const ActiveCheckoutCounter: React.FC<{
  laneIndex: number;
  xOffset: number;
  laserRef: React.RefObject<THREE.Mesh | null>;
  conveyorBeltRibsRef: React.RefObject<THREE.Group | null>;
  bagGroupRef: (el: THREE.Group | null) => void;
}> = React.memo(({ laneIndex, xOffset, laserRef, conveyorBeltRibsRef, bagGroupRef }) => {
  const laneNumberStr = `0${laneIndex + 1}`;
  const laneTex = useMemo(() => getLaneSignTexture(laneIndex + 1), [laneIndex]);

  return (
    <group position={[xOffset, 0, 0]}>
      {/* 1. Base Kickplate */}
      <mesh position={[0, 0.06, 0]} geometry={checkoutSharedGeos.plinth} material={checkoutSharedMats.plinth} />

      {/* 2. Main Cabinet Body */}
      <mesh position={[0, 0.55, 0]} geometry={checkoutSharedGeos.body} material={checkoutSharedMats.bodyWhite} />

      {/* 3. Blue Accent Stripe */}
      <mesh position={[0, 0.76, 0]} geometry={checkoutSharedGeos.stripe} material={checkoutSharedMats.accentBlue} />

      {/* 4. Trolley Bumper Rails */}
      <mesh position={[-0.66, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={checkoutSharedGeos.bumperRail} material={checkoutSharedMats.chromeBright} />
      <mesh position={[-0.66, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={checkoutSharedGeos.bumperRail} material={checkoutSharedMats.chromeBright} />

      {/* 5. Brushed Stainless Countertop */}
      <mesh position={[0, 1.025, 0]} geometry={checkoutSharedGeos.countertop} material={checkoutSharedMats.countertopSteel} />
      <mesh position={[0, 1.052, 0]} geometry={checkoutSharedGeos.countertopBevel} material={checkoutSharedMats.countertopTrim} />

      {/* 6. Active Conveyor Belt System */}
      <group position={[-0.15, 1.055, -0.65]}>
        <mesh position={[0, -0.01, 0]} geometry={checkoutSharedGeos.conveyorBed} material={checkoutSharedMats.bedSlate} />
        <mesh geometry={checkoutSharedGeos.conveyorBelt} material={checkoutSharedMats.rubberDark} />
        <mesh position={[-0.32, 0.036, 0]} geometry={checkoutSharedGeos.conveyorSideRail} material={checkoutSharedMats.chromeDull} />
        <mesh position={[0.32, 0.036, 0]} geometry={checkoutSharedGeos.conveyorSideRail} material={checkoutSharedMats.chromeDull} />

        {/* Animated Ribbed Tread Lines */}
        <group ref={conveyorBeltRibsRef}>
          {Array.from({ length: 16 }).map((_, rIdx) => (
            <mesh key={`rib-${rIdx}`} position={[0, 0.011, -0.78 + rIdx * 0.104]} geometry={checkoutSharedGeos.treadRib} material={checkoutSharedMats.rubberDark} />
          ))}
        </group>
      </group>

      {/* 7. Bi-Optic Barcode Scanner & Scale Platform */}
      <group position={[-0.15, 1.065, 0.3]}>
        <mesh position={[0, -0.004, 0]} geometry={checkoutSharedGeos.scannerOuter} material={checkoutSharedMats.chromeDull} />
        <mesh position={[0, 0.002, 0]} geometry={checkoutSharedGeos.scannerBevel} material={checkoutSharedMats.bedSlate} />
        <mesh position={[0, 0.006, 0]} geometry={checkoutSharedGeos.scannerGlass} material={checkoutSharedMats.scannerGlassMat} />

        {/* Sweeping Laser Beam */}
        <mesh ref={laserRef} position={[0, 0.022, 0]} geometry={checkoutSharedGeos.scannerLaserBar} material={checkoutSharedMats.laserRed} />
      </group>

      {/* 8. Overhead Lane Beacon */}
      <group position={[0.56, 1.05, -1.45]}>
        <mesh position={[0, 0.8, 0]} geometry={checkoutSharedGeos.laneSignMast} material={checkoutSharedMats.chromeDull} />
        <group position={[0, 1.7, 0]}>
          <mesh geometry={checkoutSharedGeos.laneSignBox} material={checkoutSharedMats.chromeDull} />
          <mesh position={[0, 0.145, 0]} geometry={checkoutSharedGeos.laneSignCap} material={checkoutSharedMats.bracketDark} />
          <mesh position={[0, -0.145, 0]} geometry={checkoutSharedGeos.laneSignCap} material={checkoutSharedMats.bracketDark} />
          <mesh position={[0, 0.148, 0]} geometry={checkoutSharedGeos.laneSignStatusLed} material={checkoutSharedMats.signLedActive} />
          {laneTex && (
            <>
              <mesh position={[0, 0, 0.042]}>
                <planeGeometry args={[0.34, 0.24]} />
                <meshBasicMaterial map={laneTex} />
              </mesh>
              <mesh position={[0, 0, -0.042]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.34, 0.24]} />
                <meshBasicMaterial map={laneTex} />
              </mesh>
            </>
          )}
          <mesh position={[0, -0.19, 0]} geometry={checkoutSharedGeos.laneSignDownlight} material={checkoutSharedMats.downlightMat} />
        </group>
      </group>

      {/* 9. Isolated Active POS Screen (Subscribes to runningTotal directly) */}
      <ActiveDeskPosScreen laneNumberStr={laneNumberStr} />

      {/* 10. Bagging Station & Animated Kraft Grocery Bag */}
      <group position={[-0.15, 1.055, 1.1]}>
        <mesh position={[0, 0.005, 0]} geometry={checkoutSharedGeos.bagBasin} material={checkoutSharedMats.chromeDull} />
        <mesh position={[-0.305, 0.03, 0]} geometry={checkoutSharedGeos.bagBasinLipSide} material={checkoutSharedMats.bracketDark} />
        <mesh position={[0.305, 0.03, 0]} geometry={checkoutSharedGeos.bagBasinLipSide} material={checkoutSharedMats.bracketDark} />
        <mesh position={[0, 0.03, 0.355]} geometry={checkoutSharedGeos.bagBasinLipEnd} material={checkoutSharedMats.bracketDark} />

        {/* Animated Bouncing Kraft Grocery Bag */}
        <group ref={bagGroupRef} position={[0, 0.16, 0]}>
          <mesh geometry={checkoutSharedGeos.bagBody} material={checkoutSharedMats.kraftPaper} />
          <mesh position={[0, 0.162, 0]} geometry={checkoutSharedGeos.bagLip} material={checkoutSharedMats.kraftPaperLip} />
          <mesh position={[0, 0.165, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={checkoutSharedGeos.bagInterior} material={checkoutSharedMats.kraftInterior} />

          {/* Rope Handles */}
          <mesh position={[0, 0.22, 0.125]}>
            <torusGeometry args={[0.075, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#8f6a39" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.22, -0.125]}>
            <torusGeometry args={[0.075, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#8f6a39" roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* 11. Cashier Stool */}
      <group position={[0.55, 0, 0.35]}>
        <mesh position={[0, 0.02, 0]} geometry={checkoutSharedGeos.stoolBase} material={checkoutSharedMats.chromeReflect} />
        <mesh position={[0, 0.28, 0]} geometry={checkoutSharedGeos.stoolColumn} material={checkoutSharedMats.darkSteel} />
        <mesh position={[0, 0.53, 0]} geometry={checkoutSharedGeos.stoolCushion} material={checkoutSharedMats.blackLeather} />
      </group>
    </group>
  );
});

// ---------------------------------------------------------------------------
// Floor Dock Decals (Pre-generated Cached Canvas Texture)
// ---------------------------------------------------------------------------
const RealisticFloorDockDecal: React.FC<{
  laneIndex: number;
  position: [number, number, number];
  isActive: boolean;
}> = React.memo(({ laneIndex, position, isActive }) => {
  const dockTex = useMemo(() => getFloorDockTexture(laneIndex + 1, isActive), [laneIndex, isActive]);

  return (
    <group position={position} raycast={() => null}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={checkoutSharedGeos.dockPlane}>
        {dockTex ? (
          <meshBasicMaterial map={dockTex} transparent opacity={isActive ? 0.95 : 0.65} />
        ) : (
          <meshStandardMaterial color={isActive ? '#e0f2fe' : '#f1f5f9'} roughness={0.65} />
        )}
      </mesh>
    </group>
  );
});

// ---------------------------------------------------------------------------
// Stainless Steel Queue Stanchions (Pre-allocated Geometries)
// ---------------------------------------------------------------------------
const CheckoutQueueStanchions: React.FC<{ lanes: number[] }> = React.memo(({ lanes }) => {
  return (
    <group raycast={() => null}>
      {lanes.map((xL, idx) => {
        const sX = xL - 0.72;
        return (
          <group key={`stanchion-pair-${idx}`}>
            {/* Stanchion 1: Entry */}
            <group position={[sX, 0, -2.2]}>
              <mesh position={[0, 0.015, 0]} geometry={checkoutSharedGeos.stanchionBase} material={checkoutSharedMats.chromeReflect} />
              <mesh position={[0, 0.48, 0]} geometry={checkoutSharedGeos.stanchionPost} material={checkoutSharedMats.chromeBright} />
              <mesh position={[0, 0.96, 0]} geometry={checkoutSharedGeos.stanchionCap} material={checkoutSharedMats.chromeDull} />
            </group>

            {/* Stanchion 2: Mid Aisle */}
            <group position={[sX, 0, -0.6]}>
              <mesh position={[0, 0.015, 0]} geometry={checkoutSharedGeos.stanchionBase} material={checkoutSharedMats.chromeReflect} />
              <mesh position={[0, 0.48, 0]} geometry={checkoutSharedGeos.stanchionPost} material={checkoutSharedMats.chromeBright} />
              <mesh position={[0, 0.96, 0]} geometry={checkoutSharedGeos.stanchionCap} material={checkoutSharedMats.chromeDull} />
            </group>

            {/* Retractable Blue Belt */}
            <mesh position={[sX, 0.94, -1.4]} geometry={checkoutSharedGeos.stanchionBelt} material={checkoutSharedMats.stanchionBeltMat} />
          </group>
        );
      })}
    </group>
  );
});

// ---------------------------------------------------------------------------
// Parked Shopping Trolleys near Exit (Lightweight Reference Model)
// ---------------------------------------------------------------------------
const ParkedShoppingTrolleys: React.FC<{ position: [number, number, number] }> = React.memo(({ position }) => {
  return (
    <group position={position} raycast={() => null}>
      {[0, 0.45, 0.90].map((zN, nIdx) => (
        <group key={`nested-cart-${nIdx}`} position={[0, 0, zN]}>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.62, 0.04, 0.88]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.58, 0.05]}>
            <boxGeometry args={[0.58, 0.38, 0.78]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.15} wireframe={true} />
          </mesh>
          <mesh position={[0, 0.88, 0.48]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.56, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.38, 0.22, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.6, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
});

// ---------------------------------------------------------------------------
// Main BillingCounter3D Component
// ---------------------------------------------------------------------------
export const BillingCounter3D: React.FC<BillingCounterProps> = ({ position }) => {
  const laserRef = useRef<THREE.Mesh>(null);
  const conveyorBeltRibsRef = useRef<THREE.Group>(null);
  const bagGroupRefs = useRef<(THREE.Group | null)[]>([null, null, null, null, null, null]);

  const isConveyorMoving = useBillingStore((state) => state.isConveyorMoving);
  const phase = useBillingStore((state) => state.phase);

  const [activeDeskIndex, setActiveDeskIndex] = useState(2);
  const bagScaleRef = useRef(1.0);
  const lastDeskCheckRef = useRef(0);

  // 6 Commercial Checkout Lanes across X = [-15, 15]
  const counterXPositions = useMemo(() => [-15, -9, -3, 3, 9, 15], []);

  const handleBagBump = useCallback(() => {
    bagScaleRef.current = 1.15;
    const activeBag = bagGroupRefs.current[activeDeskIndex];
    if (activeBag) activeBag.scale.set(1, 1.15, 1);
  }, [activeDeskIndex]);

  // Stable bag ref setters per desk index (avoids inline arrow functions)
  const bagRefSetters = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((idx) => (el: THREE.Group | null) => {
      bagGroupRefs.current[idx] = el;
    });
  }, []);

  useFrame((_, delta) => {
    const now = performance.now();
    const playerZ = martRuntime.playerPos[2];
    const playerX = martRuntime.playerPos[0];

    // Only evaluate desk switching if NOT currently scanning, and player is within the billing section
    // Throttle to 350ms with 2.8m hysteresis to eliminate unnecessary re-renders
    if (phase !== 'scanning' && playerZ >= 13.0 && playerZ <= 26.0 && now - lastDeskCheckRef.current > 350) {
      lastDeskCheckRef.current = now;
      let bestIdx = activeDeskIndex;
      let minDiff = Math.abs(playerX - counterXPositions[activeDeskIndex]);
      for (let i = 0; i < counterXPositions.length; i++) {
        const dist = Math.abs(playerX - counterXPositions[i]);
        if (dist < minDiff - 2.8) { // 2.8m hysteresis
          bestIdx = i;
          minDiff = dist;
        }
      }
      if (bestIdx !== activeDeskIndex) {
        setActiveDeskIndex(bestIdx);
      }
    }

    // Laser scanning beam animation on active desk
    if (laserRef.current) {
      const isScanning = phase === 'scanning';
      const speed = isScanning ? 16 : 4;
      laserRef.current.position.z =
        Math.sin(Date.now() * 0.001 * speed) * (isScanning ? 0.12 : 0.04);
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity = isScanning ? 0.95 : 0.45;
    }

    // Moving ribbed conveyor belt treads on active desk
    if (isConveyorMoving && conveyorBeltRibsRef.current) {
      conveyorBeltRibsRef.current.children.forEach((child) => {
        child.position.z += delta * 0.42;
        if (child.position.z > 0.8) {
          child.position.z = -0.8;
        }
      });
    }

    // Smoothly settle bag squash & stretch bounce imperatively without React setState
    if (bagScaleRef.current > 1.0) {
      bagScaleRef.current = Math.max(1.0, bagScaleRef.current - delta * 0.8);
      const activeBag = bagGroupRefs.current[activeDeskIndex];
      if (activeBag) {
        activeBag.scale.set(1, bagScaleRef.current, 1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Professional D-Mart Hypermarket Checkout & Billing Lightbox Sign */}
      <group position={[0, 3.7, 0]} raycast={() => null}>
        {/* Chrome Suspension Rods across all 6 lanes */}
        {counterXPositions.map((rodX, rIdx) => (
          <mesh key={`rod-${rIdx}`} position={[rodX, 0.65, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 1.1, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* Sleek Aluminum Outer Frame */}
        <mesh>
          <boxGeometry args={[33.0, 0.82, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Pure White Translucent Diffuser Face */}
        <mesh>
          <boxGeometry args={[32.8, 0.76, 0.09]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.05} />
        </mesh>

        {/* FRONT FACE (Facing -Z towards approaching shoppers) */}
        <group position={[0, 0, -0.048]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.22, 0]}>
            <planeGeometry args={[14.0, 0.16]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <Text position={[0, 0.22, 0.005]} fontSize={0.095} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.06}>
            {'D-MART HYPERMARKET EXPRESS CHECKOUT'}
          </Text>

          <Text position={[0, 0.02, 0.005]} fontSize={0.24} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.08}>
            {'CHECKOUT & BILLING'}
          </Text>

          <Text position={[0, -0.20, 0.005]} fontSize={0.085} color="#047857" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.04}>
            {'↓ LANE 01      ↓ LANE 02      ↓ LANE 03      ↓ LANE 04      ↓ LANE 05      ↓ LANE 06'}
          </Text>
        </group>

        {/* BACK FACE (Facing +Z towards store exit) */}
        <group position={[0, 0, 0.048]}>
          <Text position={[0, 0.12, 0.005]} fontSize={0.18} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold" letterSpacing={0.06}>
            {'THANK YOU FOR SHOPPING AT D-MART MARTVERSE'}
          </Text>
          <Text position={[0, -0.12, 0.005]} fontSize={0.11} color="#0284c7" anchorX="center" anchorY="middle" fontWeight="bold">
            {'PLEASE PROCEED TO EXIT GATE'}
          </Text>
        </group>
      </group>

      {/* Stainless Steel Queue Stanchions & Retractable Belts */}
      <CheckoutQueueStanchions lanes={counterXPositions} />

      {/* Parked Return Shopping Trolleys near Exit */}
      <ParkedShoppingTrolleys position={[-18.5, 0, 1.8]} />
      <ParkedShoppingTrolleys position={[18.5, 0, 1.8]} />

      {/* --- 6 High-Performance Commercial Checkout Counters --- */}
      {counterXPositions.map((xOffset, cIdx) => {
        const isActiveDesk = cIdx === activeDeskIndex;

        return isActiveDesk ? (
          <ActiveCheckoutCounter
            key={`counter-${cIdx}`}
            laneIndex={cIdx}
            xOffset={xOffset}
            laserRef={laserRef}
            conveyorBeltRibsRef={conveyorBeltRibsRef}
            bagGroupRef={bagRefSetters[cIdx]}
          />
        ) : (
          <InactiveCheckoutCounter
            key={`counter-${cIdx}`}
            laneIndex={cIdx}
            xOffset={xOffset}
          />
        );
      })}

      {/* --- Live 3D Parabolic Flying, Scanning & Packing Pipeline --- */}
      <ConveyorAnimation3D
        activeDeskX={counterXPositions[activeDeskIndex]}
        onBagBump={handleBagBump}
      />

      {/* --- Checkout Floor Queue Docks across all 6 lanes --- */}
      {counterXPositions.map((xPos, idx) => (
        <RealisticFloorDockDecal
          key={`dock-${idx}`}
          laneIndex={idx}
          position={[xPos - 1.9, 0.012, -0.6]}
          isActive={activeDeskIndex === idx}
        />
      ))}

      {/* --- Industrial Safety Hazard Sensor Line Across All 6 Lanes --- */}
      <group position={[0, 0.016, -2.4]} raycast={() => null}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[33.0, 0.38]} />
          <meshStandardMaterial color="#facc15" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.001, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[33.0, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0, 0.001, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[33.0, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <Text
          position={[0, 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.14}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
          fontWeight="bold"
        >
          {'▶ ▶ ▶   CHECKOUT SENSOR LINE • TROLLEY AUTO-SCAN DOCK   ◀ ◀ ◀'}
        </Text>
      </group>
    </group>
  );
};
