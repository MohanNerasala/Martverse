'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMartStore, martRuntime } from '@/store/useMartStore';
import { useCartStore } from '@/store/useCartStore';
import { useBillingStore } from '@/store/useBillingStore';
import { sounds } from '@/lib/sound';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  sprint: boolean;
}

interface ObstacleBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const STATIC_OBSTACLES_FLOOR1: ObstacleBox[] = [
  // Outer Store Perimeter Walls (72m x 72m footprint)
  { minX: -37.0, maxX: -35.2, minZ: -37.0, maxZ: 37.0 },  // Left Wall
  { minX: 35.2, maxX: 37.0, minZ: -37.0, maxZ: 37.0 },   // Right Wall
  { minX: -37.0, maxX: 37.0, minZ: 35.2, maxZ: 37.0 },   // Back Wall
  { minX: -37.0, maxX: 37.0, minZ: -37.0, maxZ: -35.2 }, // Front Wall

  // Left Wall Retail Shelving Section (Household & Personal Care, X = -34.8, Z = [-18, 18])
  { minX: -35.4, maxX: -33.9, minZ: -18.5, maxZ: 18.5 },

  // Back Wall Warehouse Wholesale Pallet Racking (Atta, Rice, Oil, Salt, Z = 33.8, X = [-27, 27])
  { minX: -27.5, maxX: 27.5, minZ: 32.8, maxZ: 35.0 },

  // Commercial Refrigerator Gallery on Right Wall (Dairy, Sodas, Frozen Foods, X = 34.5, Z = [-14, 14])
  { minX: 33.20, maxX: 35.80, minZ: -14.20, maxZ: 14.20 },

  // 9 Varied Double-Sided Gondola Aisles (Mixed Orientations: Longitudinal + Perpendicular Cross Aisles)
  { minX: -24.95, maxX: -23.05, minZ: -14.5, maxZ: 14.5 }, // Aisle 1: Biscuits & Cookies (X = -24.0, 28m)
  { minX: -18.45, maxX: -16.55, minZ: -14.5, maxZ: 14.5 }, // Aisle 2: Savory Snacks & Chips (X = -17.5, 28m)
  { minX: -16.0, maxX: -6.0, minZ: -5.95, maxZ: -4.05 },    // Aisle 3: Leaf Teas & Infusions (East-West cross-gondola, Z = -5)
  { minX: -16.0, maxX: -6.0, minZ: 4.05, maxZ: 5.95 },      // Aisle 4: Instant Coffees & Hot Drinks (East-West cross-gondola, Z = 5)
  { minX: 16.55, maxX: 18.45, minZ: -14.5, maxZ: 14.5 },    // Aisle 5: Chakki Atta & Flours (X = 17.5, 28m)
  { minX: 23.05, maxX: 24.95, minZ: -14.5, maxZ: 14.5 },    // Aisle 6: Basmati Rice & Dals (X = 24.0, 28m)
  { minX: 6.0, maxX: 16.0, minZ: -5.95, maxZ: -4.05 },      // Aisle 7: Cooking Oils & Spices (East-West cross-gondola, Z = -5)
  { minX: 6.0, maxX: 16.0, minZ: 4.05, maxZ: 5.95 },        // Aisle 8: Instant Foods & Pasta (East-West cross-gondola, Z = 5)
  { minX: 28.55, maxX: 30.45, minZ: -11.5, maxZ: 11.5 },    // Aisle 9: Soft Drinks & Juices (X = 29.5, 22m)

  // 3 Central Grand Promenade Feature Promotional Islands (Low-profile, open 360-deg browsing)
  { minX: -1.8, maxX: 1.8, minZ: -23.5, maxZ: -21.5 },     // Island 1: Luxury Chocolates Showcase (X = 0, Z = -22.5)
  { minX: -1.7, maxX: 1.7, minZ: -16.2, maxZ: -13.8 },     // Island 2: Artisan Tea & Coffee Pavilion (X = 0, Z = -15)
  { minX: -1.6, maxX: 1.6, minZ: -6.2, maxZ: -3.8 },       // Island 3: Festive Sweets & Dry Fruits (X = 0, Z = -5)

  // 6 Commercial Checkout Billing Counter Desks at [-15, -9, -3, 3, 9, 15], Z ~ 22.0
  { minX: -16.15, maxX: -13.85, minZ: 20.8, maxZ: 23.2 },
  { minX: -10.15, maxX: -7.85, minZ: 20.8, maxZ: 23.2 },
  { minX: -4.15, maxX: -1.85, minZ: 20.8, maxZ: 23.2 },
  { minX: 1.85, maxX: 4.15, minZ: 20.8, maxZ: 23.2 },
  { minX: 7.85, maxX: 10.15, minZ: 20.8, maxZ: 23.2 },
  { minX: 13.85, maxX: 16.15, minZ: 20.8, maxZ: 23.2 },
];

interface DepenetrationResult {
  overlap: boolean;
  pX: number;
  pZ: number;
  normalX: number;
  normalZ: number;
}

// Single pre-allocated result object: eliminates 2,000+ GC object allocations per second
const depenetrationResult: DepenetrationResult = {
  overlap: false,
  pX: 0,
  pZ: 0,
  normalX: 0,
  normalZ: 0,
};

function getCircleBoxDepenetration(
  cx: number,
  cz: number,
  cr: number,
  box: ObstacleBox
): DepenetrationResult {
  const closestX = Math.max(box.minX, Math.min(cx, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(cz, box.maxZ));
  const dx = cx - closestX;
  const dz = cz - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= cr * cr) {
    depenetrationResult.overlap = false;
    depenetrationResult.pX = 0;
    depenetrationResult.pZ = 0;
    depenetrationResult.normalX = 0;
    depenetrationResult.normalZ = 0;
    return depenetrationResult;
  }

  const dist = Math.sqrt(distSq);
  if (dist < 0.0001) {
    const dL = cx - box.minX;
    const dR = box.maxX - cx;
    const dB = cz - box.minZ;
    const dT = box.maxZ - cz;
    const minD = Math.min(dL, dR, dB, dT);
    depenetrationResult.overlap = true;
    if (minD === dL) {
      depenetrationResult.pX = -(dL + cr); depenetrationResult.pZ = 0;
      depenetrationResult.normalX = -1; depenetrationResult.normalZ = 0;
    } else if (minD === dR) {
      depenetrationResult.pX = (dR + cr); depenetrationResult.pZ = 0;
      depenetrationResult.normalX = 1; depenetrationResult.normalZ = 0;
    } else if (minD === dB) {
      depenetrationResult.pX = 0; depenetrationResult.pZ = -(dB + cr);
      depenetrationResult.normalX = 0; depenetrationResult.normalZ = -1;
    } else {
      depenetrationResult.pX = 0; depenetrationResult.pZ = (dT + cr);
      depenetrationResult.normalX = 0; depenetrationResult.normalZ = 1;
    }
    return depenetrationResult;
  }

  const overlap = cr - dist;
  const normalX = dx / dist;
  const normalZ = dz / dist;
  depenetrationResult.overlap = true;
  depenetrationResult.pX = normalX * overlap;
  depenetrationResult.pZ = normalZ * overlap;
  depenetrationResult.normalX = normalX;
  depenetrationResult.normalZ = normalZ;
  return depenetrationResult;
}

// Pre-allocated static motion vector to eliminate GC heap allocation in useFrame
const staticMoveVector = new THREE.Vector3();

// Streamlined Coaxial Trolley Rig Collision Spheres (Prevents lateral wedging in aisles)
const STATIC_SPHERES = [
  { fwdDist: 0.35, latDist: 0.0, radius: 0.35 }, // Player & rear trolley core
  { fwdDist: 1.05, latDist: 0.0, radius: 0.28 }, // Front trolley bumper
] as const;

// Raycasts against store perimeter and interior gondola obstacles to prevent camera clipping
function checkCameraObstacleDistance(
  px: number,
  pz: number,
  dirX: number,
  dirZ: number,
  maxDist: number,
  obstacles: ObstacleBox[]
): number {
  let closestDist = maxDist;
  const padding = 0.32; // Buffer so camera never clips geometry

  // 1. Perimeter boundary walls (-35 to +35m)
  if (dirX < -0.001) {
    const dX = (-35.0 - px) / dirX;
    if (dX > 0) closestDist = Math.min(closestDist, Math.max(1.15, dX - padding));
  } else if (dirX > 0.001) {
    const dX = (35.0 - px) / dirX;
    if (dX > 0) closestDist = Math.min(closestDist, Math.max(1.15, dX - padding));
  }

  if (dirZ < -0.001) {
    const dZ = (-35.0 - pz) / dirZ;
    if (dZ > 0) closestDist = Math.min(closestDist, Math.max(1.15, dZ - padding));
  } else if (dirZ > 0.001) {
    const dZ = (35.0 - pz) / dirZ;
    if (dZ > 0) closestDist = Math.min(closestDist, Math.max(1.15, dZ - padding));
  }

  // 2. Interior shelf racks and obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const box = obstacles[i];
    if (box.maxX - box.minX > 60 || box.maxZ - box.minZ > 60) continue;

    const bMinX = box.minX - padding;
    const bMaxX = box.maxX + padding;
    const bMinZ = box.minZ - padding;
    const bMaxZ = box.maxZ + padding;

    let tmin = 0;
    let tmax = closestDist;

    if (Math.abs(dirX) > 1e-6) {
      const invD = 1 / dirX;
      let t1 = (bMinX - px) * invD;
      let t2 = (bMaxX - px) * invD;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) continue;
    } else {
      if (px < bMinX || px > bMaxX) continue;
    }

    if (Math.abs(dirZ) > 1e-6) {
      const invD = 1 / dirZ;
      let t1 = (bMinZ - pz) * invD;
      let t2 = (bMaxZ - pz) * invD;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) continue;
    } else {
      if (pz < bMinZ || pz > bMaxZ) continue;
    }

    if (tmin < closestDist && tmin >= 0) {
      closestDist = Math.max(1.15, tmin);
    }
  }

  return closestDist;
}

export const PlayerController: React.FC = () => {
  const { camera } = useThree();
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
    sprint: false,
  });

  const activeFloor = useMartStore((state) => state.activeFloor);
  const cameraMode = useMartStore((state) => state.cameraMode);
  const products = useMartStore((state) => state.products);
  const hasEnteredStore = useMartStore((state) => state.hasEnteredStore);
  const setActiveFloor = useMartStore((state) => state.setActiveFloor);
  const setProximity = useMartStore((state) => state.setProximity);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const openUnpaidExitAlert = useMartStore((state) => state.openUnpaidExitAlert);
  const hasMovedTrolley = useMartStore((state) => state.hasMovedTrolley);
  const setHasMovedTrolley = useMartStore((state) => state.setHasMovedTrolley);
  const resetTrigger = useMartStore((state) => state.resetTrigger);
  const teleportTrigger = useMartStore((state) => state.teleportTrigger);

  const startCheckout = useBillingStore((state) => state.startCheckout);

  // Motion physics refs
  const posRef = useRef(new THREE.Vector3(...martRuntime.playerPos));
  const velocityRef = useRef({ x: 0, z: 0 });
  const wheelMomentum = useRef({ x: 0, z: 0 });
  const isRightDragging = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const currentLookTarget = useRef(new THREE.Vector3(0, 1.85, -17.7));
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const lastTapTimeRef = useRef(0);
  const lastTapPosRef = useRef({ x: 0, y: 0 });
  const turn360Ref = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    startYaw: number;
    targetDelta: number;
  } | null>(null);
  const lastSyncTime = useRef(0);
  const lastProximityCheck = useRef(0);
  const camDistRef = useRef(2.95);
  const cameraProgressRef = useRef(cameraMode === 'first_person' ? 0.0 : 1.0);
  const resetPending = useRef(false);
  const prevZRef = useRef(martRuntime.playerPos[2]);
  const proximityCache = useRef<{
    nearBilling: boolean;
    nearExit: boolean;
    prompt: string | null;
  }>({ nearBilling: false, nearExit: false, prompt: null });

  // Initialize trolley position (Preserve existing target like billing counter if returning)
  useEffect(() => {
    const initX = martRuntime.playerPos[0];
    const initY = martRuntime.playerPos[1];
    const initZ = martRuntime.playerPos[2];
    const initYaw = martRuntime.playerYaw ?? 0;

    posRef.current.set(initX, initY, initZ);
    velocityRef.current = { x: 0, z: 0 };
    wheelMomentum.current = { x: 0, z: 0 };
    yawRef.current = initYaw;
    pitchRef.current = 0;
    targetYawRef.current = initYaw;
    targetPitchRef.current = 0;
    currentLookTarget.current.set(
      initX + Math.sin(initYaw) * 2.3,
      initY + 0.35,
      initZ + Math.cos(initYaw) * 2.3
    );
    const camDist = 0.55;
    const camHeight = 1.45;
    const rayDirX = -Math.sin(initYaw);
    const rayDirZ = -Math.cos(initYaw);
    camera.position.set(initX + rayDirX * camDist, initY - 1.5 + camHeight, initZ + rayDirZ * camDist);
    camera.lookAt(
      initX + Math.sin(initYaw) * 5.0,
      1.05,
      initZ + Math.cos(initYaw) * 5.0
    );
    keys.current = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      interact: false,
      sprint: false,
    };
  }, [hasEnteredStore]);

  // Handle Reset to Original State & Starting Position (Entrance)
  useEffect(() => {
    if (resetTrigger === 0) return;
    posRef.current.set(0, 1.5, -28);
    velocityRef.current = { x: 0, z: 0 };
    yawRef.current = 0;
    pitchRef.current = 0;
    targetYawRef.current = 0;
    targetPitchRef.current = 0;
    currentLookTarget.current.set(0, 1.28, -23.2);
    camDistRef.current = 2.95;
    cameraProgressRef.current = 1.0;
    martRuntime.playerPos[0] = 0;
    martRuntime.playerPos[1] = 1.5;
    martRuntime.playerPos[2] = -28;
    martRuntime.playerYaw = 0;
    resetPending.current = true;
  }, [resetTrigger]);

  // Handle Teleport & Auto-Navigation to Product Shelf
  useEffect(() => {
    if (teleportTrigger === 0) return;
    posRef.current.set(martRuntime.playerPos[0], martRuntime.playerPos[1], martRuntime.playerPos[2]);
    velocityRef.current = { x: 0, z: 0 };
    yawRef.current = martRuntime.playerYaw ?? 0;
    pitchRef.current = 0;
    targetYawRef.current = martRuntime.playerYaw ?? 0;
    targetPitchRef.current = 0;
    currentLookTarget.current.set(
      martRuntime.playerPos[0] + Math.sin(yawRef.current) * 2.3,
      martRuntime.playerPos[1] + 0.35,
      martRuntime.playerPos[2] + Math.cos(yawRef.current) * 2.3
    );
    resetPending.current = true;
  }, [teleportTrigger]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture any keys if cinematic intro is active or typing in input
      if (!useMartStore.getState().hasEnteredStore) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'KeyE':
          keys.current.interact = true;
          handleInteract();
          break;
        case 'Space':
          if (useBillingStore.getState().phase === 'scanning') {
            e.preventDefault();
            useBillingStore.getState().skipToReview();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
        case 'KeyE':
          keys.current.interact = false;
          break;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(target?.tagName) ||
        target?.closest('button') ||
        target?.closest('[role="dialog"]') ||
        target?.closest('.fixed')
      ) {
        return;
      }

      const now = performance.now();
      const dt = now - lastTapTimeRef.current;
      const dx = e.clientX - lastTapPosRef.current.x;
      const dy = e.clientY - lastTapPosRef.current.y;
      const distSq = dx * dx + dy * dy;

      if (e.button === 0) {
        isDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };

        // Double-tap detection: two taps within 300 ms with movement < 10 px (distSq < 100)
        if (dt > 40 && dt < 300 && distSq < 100) {
          // Trigger 1.2s eased 360° turn (easeInOutCubic) inside useFrame; ignore further double taps while active
          if (!turn360Ref.current?.active) {
            turn360Ref.current = {
              active: true,
              startTime: now,
              duration: 1200,
              startYaw: targetYawRef.current,
              targetDelta: Math.PI * 2,
            };
          }
          lastTapTimeRef.current = 0;
        } else {
          lastTapTimeRef.current = now;
          lastTapPosRef.current = { x: e.clientX, y: e.clientY };
        }
      } else if (e.button === 2) {
        isRightDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

      // Any intentional drag cancels the 360 turn immediately!
      if (isDragging.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        if (turn360Ref.current?.active) {
          turn360Ref.current = null;
        }
      }

      if (isRightDragging.current) {
        // Dragging mouse forward (dy < 0) pushes trolley forward
        wheelMomentum.current.z -= dy * 0.025;
        wheelMomentum.current.x += dx * 0.02;
        wheelMomentum.current.z = THREE.MathUtils.clamp(wheelMomentum.current.z, -1.2, 1.2);
        wheelMomentum.current.x = THREE.MathUtils.clamp(wheelMomentum.current.x, -1.2, 1.2);
        if (Math.abs(dy) > 2) {
          if (!hasMovedTrolley) setHasMovedTrolley(true);
        }
      }

      if (!isDragging.current) return;

      targetYawRef.current -= dx * 0.0068;
      targetPitchRef.current = Math.max(-0.55, Math.min(0.55, targetPitchRef.current - dy * 0.0042));

      // Escalator yaw containment: prevent turning sideways and shoving trolley into glass balustrade
      const onRamp =
        Math.abs(posRef.current.x - 14.7) < 1.4 &&
        posRef.current.z >= -9.0 &&
        posRef.current.z <= 7.0;

      if (onRamp) {
        const isAscending = Math.cos(targetYawRef.current) >= -0.2;
        if (isAscending) {
          targetYawRef.current = THREE.MathUtils.clamp(targetYawRef.current, -0.4, 0.4);
        } else {
          targetYawRef.current = THREE.MathUtils.clamp(targetYawRef.current, Math.PI - 0.4, Math.PI + 0.4);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      if (e.button === 0) isDragging.current = false;
      if (e.button === 2) isRightDragging.current = false;
    };

    const handlePointerCancel = () => {
      isDragging.current = false;
      isRightDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      // Trolley NEVER moves from wheel while cinematic intro is active, or if cart drawer/any modal is open
      if (!useMartStore.getState().hasEnteredStore) return;
      if (useCartStore.getState().isCartOpen) return;
      if (useMartStore.getState().isProductModalOpen) return;

      const target = e.target as HTMLElement;
      if (
        target?.closest('.overflow-y-auto') ||
        target?.closest('.overflow-x-auto') ||
        target?.closest('.fixed') ||
        target?.closest('[role="dialog"]') ||
        ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(target?.tagName)
      ) {
        return;
      }
      e.preventDefault();

      // Normalize deltas across deltaMode (0: pixels, 1: lines, 2: pages)
      let deltaX = e.deltaX;
      let deltaY = e.deltaY;
      if (e.deltaMode === 1) {
        deltaX *= 16;
        deltaY *= 16;
      } else if (e.deltaMode === 2) {
        deltaX *= 400;
        deltaY *= 400;
      }

      const factor = 0.008;
      const clampedX = THREE.MathUtils.clamp(deltaX, -100, 100);
      const clampedY = THREE.MathUtils.clamp(deltaY, -100, 100);

      wheelMomentum.current.z -= clampedY * factor;
      wheelMomentum.current.x += clampedX * factor;

      wheelMomentum.current.z = THREE.MathUtils.clamp(wheelMomentum.current.z, -3.0, 3.0);
      wheelMomentum.current.x = THREE.MathUtils.clamp(wheelMomentum.current.x, -3.0, 3.0);

      if (Math.abs(clampedY) > 2 || Math.abs(clampedX) > 2) {
        if (!hasMovedTrolley) {
          setHasMovedTrolley(true);
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'CANVAS') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Handle 'E' or Interaction
  const handleInteract = () => {
    const px = posRef.current.x;
    const pz = posRef.current.z;

    // Check Billing Counter (around z = 19.0 to 24.5, across lanes 1-6 from x = -17.5 to 17.5)
    const currentCart = useCartStore.getState().items;
    const currentPaid = useCartStore.getState().isPaid;

    if (pz >= 19.0 && pz <= 24.5 && px >= -17.5 && px <= 17.5) {
      if (currentCart.length > 0 && useBillingStore.getState().phase === 'idle') {
        startCheckout(currentCart);
      }
      return;
    }

    // Check Exit at Front Concourse (pz <= -32.5, px between -8 and 8)
    if (pz <= -32.5 && Math.abs(px) < 8.0) {
      if (currentCart.length === 0 || currentPaid) {
        sounds.playGateOpen();
        setCameraMode('exit');
      } else {
        sounds.playWarningBuzz();
        openUnpaidExitAlert();
      }
      return;
    }

    // If an item is actively hovered by the user's cursor, prioritize inspecting that exact item!
    const hovered = useMartStore.getState().hoveredProduct;
    if (hovered) {
      openProductModal(hovered);
      return;
    }

    // Otherwise check nearest product on active floor
    const nearbyProd = products.find((p) => {
      if (!p.placement) return false;
      const prodFloor = p.placement.floorNumber || (p.placement.aisleNumber <= 5 ? 1 : 2);
      if (prodFloor !== activeFloor) return false;
      const dx = p.placement.worldX - px;
      const dz = p.placement.worldZ - pz;
      const distSq = dx * dx + dz * dz;
      return distSq < 6.25;
    });

    if (nearbyProd) {
      openProductModal(nearbyProd);
    }
  };

  useFrame((_, rawDelta) => {
    // If the cinematic intro is playing, keep the trolley 100% frozen at the entrance
    if (!useMartStore.getState().hasEnteredStore) {
      posRef.current.set(0, 1.5, -20);
      velocityRef.current.x = 0;
      velocityRef.current.z = 0;
      wheelMomentum.current.x = 0;
      wheelMomentum.current.z = 0;
      martRuntime.playerPos[0] = 0;
      martRuntime.playerPos[1] = 1.5;
      martRuntime.playerPos[2] = -20;
      martRuntime.playerYaw = 0;
      camera.position.set(0, 3.45, -23.0);
      camera.lookAt(0, 1.85, -17.7);
      return;
    }

    // Clamp delta to prevent collision tunneling or physics oscillation during frame spikes
    const delta = Math.min(rawDelta, 0.04);
    const isAutoNavigatingToExit = useMartStore.getState().isAutoNavigatingToExit;
    const finishExitAnimation = useMartStore.getState().finishExitAnimation;
    const activeAutoNav = useMartStore.getState().activeAutoNav;
    const cancelAutoNav = useMartStore.getState().cancelAutoNav;

    // Check for user manual steering to immediately cancel auto-nav if requested
    const isLeft = keys.current.left || martRuntime.virtualKeys.left;
    const isRight = keys.current.right || martRuntime.virtualKeys.right;
    const isForward = keys.current.forward || martRuntime.virtualKeys.forward;
    const isBackward = keys.current.backward || martRuntime.virtualKeys.backward;
    const hasManualInput = isForward || isBackward || isLeft || isRight;

    if (activeAutoNav && hasManualInput) {
      cancelAutoNav();
    }

    if (isAutoNavigatingToExit) {
      // Smoothly guide customer and trolley through the main supermarket aisle towards exit gate at x = 0, z = -22.5
      posRef.current.x = THREE.MathUtils.damp(posRef.current.x, 0, 4, delta);
      posRef.current.z = THREE.MathUtils.damp(posRef.current.z, -22.5, 3.5, delta);
      posRef.current.y = THREE.MathUtils.damp(posRef.current.y, 1.5, 6, delta);
      yawRef.current = THREE.MathUtils.damp(yawRef.current, Math.PI, 6, delta);
      targetYawRef.current = Math.PI;

      // Once reached the exit sensor gate
      if (posRef.current.z <= -21.6) {
        finishExitAnimation();
      }
    } else if (activeAutoNav && !hasManualInput) {
      // -------------------------------------------------------------------------
      // SMOOTH HYPERMARKET AUTO-NAVIGATION ("slow -> little fast -> decelerate to arrive")
      // -------------------------------------------------------------------------
      const now = performance.now();
      const elapsed = (now - activeAutoNav.startTime) / 1000;

      const waypoints = activeAutoNav.waypoints;
      let wpIdx = activeAutoNav.currentWaypointIndex;
      if (wpIdx >= waypoints.length) wpIdx = waypoints.length - 1;
      const currentWP = waypoints[wpIdx] || { x: activeAutoNav.targetX, z: activeAutoNav.targetZ };
      const isFinalWaypoint = wpIdx >= waypoints.length - 1;

      // Distance to intermediate waypoint
      const toWpX = currentWP.x - posRef.current.x;
      const toWpZ = currentWP.z - posRef.current.z;
      const distToWp = Math.hypot(toWpX, toWpZ);

      // Distance to ultimate destination
      const toFinalX = activeAutoNav.targetX - posRef.current.x;
      const toFinalZ = activeAutoNav.targetZ - posRef.current.z;
      const distToFinal = Math.hypot(toFinalX, toFinalZ);

      // Smooth acceleration curve:
      // 1. Initial ease-in (0.0s -> 0.75s: "go slow")
      const easeIn = Math.min(1.0, elapsed / 0.75);
      const accelFactor = Math.sin(easeIn * Math.PI * 0.5);

      // 2. Approach deceleration (distToFinal < 2.2m: "slow down to arrive")
      const decelFactor = Math.min(1.0, Math.max(0.22, distToFinal / 2.2));

      // Cruise speed: 5.4 m/s ("little fast")
      const cruiseSpeed = 5.4;
      const navSpeed = cruiseSpeed * accelFactor * decelFactor;

      // Switch to next waypoint once close enough to intermediate waypoint
      if (!isFinalWaypoint && distToWp < 0.9) {
        activeAutoNav.currentWaypointIndex++;
      }

      if (distToFinal > 0.16) {
        // Continuous steering towards next waypoint
        const desiredYaw = Math.atan2(toWpX, toWpZ);
        let yawDiff = desiredYaw - yawRef.current;
        while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
        while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
        yawRef.current += yawDiff * Math.min(1.0, delta * 6.5);
        targetYawRef.current = yawRef.current;

        const dirX = toWpX / (distToWp || 1);
        const dirZ = toWpZ / (distToWp || 1);
        posRef.current.x += dirX * navSpeed * delta;
        posRef.current.z += dirZ * navSpeed * delta;
        velocityRef.current.x = dirX * navSpeed;
        velocityRef.current.z = dirZ * navSpeed;
      } else {
        // Arrived at walkway location: smoothly align trolley to face the shelf directly
        let finalYawDiff = activeAutoNav.targetYaw - yawRef.current;
        while (finalYawDiff < -Math.PI) finalYawDiff += Math.PI * 2;
        while (finalYawDiff > Math.PI) finalYawDiff -= Math.PI * 2;
        yawRef.current += finalYawDiff * Math.min(1.0, delta * 8.5);
        targetYawRef.current = activeAutoNav.targetYaw;
        velocityRef.current.x = 0;
        velocityRef.current.z = 0;

        // When yaw alignment completes (within 0.08 rad / ~4 deg)
        if (Math.abs(finalYawDiff) < 0.08) {
          const productToAdd = activeAutoNav.product;
          const shouldAdd = activeAutoNav.autoAddToCart;

          // Clear autonav first so it does not re-enter
          useMartStore.setState({ activeAutoNav: null });

          if (shouldAdd) {
            // Adds exact product to cart and spawns 3D parabolic FlyingProductArc from shelf into trolley basket
            useCartStore.getState().addItem(productToAdd, 1);
            sounds.playScanBeep();
          }

          useMartStore.getState().showToast(
            'Arrived at Shelf',
            `${productToAdd.name} placed in shopping trolley`,
            'success',
            productToAdd.imageUrl
          );
        }
      }
    } else {
      if (turn360Ref.current?.active) {
        const elapsed = performance.now() - turn360Ref.current.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / turn360Ref.current.duration));
        // easeInOutCubic:
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        targetYawRef.current = turn360Ref.current.startYaw + eased * turn360Ref.current.targetDelta;
        yawRef.current = targetYawRef.current;
        pitchRef.current = THREE.MathUtils.damp(pitchRef.current, 0, 12, delta);

        if (progress >= 1) {
          turn360Ref.current = null;
        }
      } else {
        // Smoothly damp yaw and pitch towards target angles for butter-smooth camera rotation (only mouse-look modifies target angles)
        yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYawRef.current, 90, delta);
        pitchRef.current = THREE.MathUtils.damp(pitchRef.current, targetPitchRef.current, 90, delta);
      }

      // Fast, ultra-smooth movement speed (22.0 base, 32.0 on Shift turbo push)
      const speed = keys.current.sprint ? 32.0 : 22.0;
      staticMoveVector.set(0, 0, 0);

      const isLeft = keys.current.left || martRuntime.virtualKeys.left;
      const isRight = keys.current.right || martRuntime.virtualKeys.right;
      const isForward = keys.current.forward || martRuntime.virtualKeys.forward;
      const isBackward = keys.current.backward || martRuntime.virtualKeys.backward;

      // 1. Forward & Backward motion (Up / Down Arrows / W / S)
      if (isForward) staticMoveVector.z += 1;
      if (isBackward) staticMoveVector.z -= 1;

      // 2. Lateral side motion (Left Arrow -> Left side, Right Arrow -> Right side)
      if (isLeft) staticMoveVector.x -= 1;
      if (isRight) staticMoveVector.x += 1;

      // 3. Two-Finger Trackpad / Mouse Scroll Momentum
      staticMoveVector.z += wheelMomentum.current.z;
      staticMoveVector.x += wheelMomentum.current.x;

      // Smoothly damp wheel momentum
      wheelMomentum.current.z = THREE.MathUtils.damp(wheelMomentum.current.z, 0, 10, delta);
      wheelMomentum.current.x = THREE.MathUtils.damp(wheelMomentum.current.x, 0, 10, delta);

      const isMoving = staticMoveVector.lengthSq() > 0.001;
      if (isMoving) {
        if (!hasMovedTrolley) {
          setHasMovedTrolley(true);
        }
        if (staticMoveVector.lengthSq() > 1) {
          staticMoveVector.normalize();
        }
      }

      // Camera-relative velocity projection:
      // Forward vector F = (sin(yaw), 0, cos(yaw))
      // Right vector R = (-cos(yaw), 0, sin(yaw))
      const sin = Math.sin(yawRef.current);
      const cos = Math.cos(yawRef.current);
      const targetVelX = (-staticMoveVector.x * cos + staticMoveVector.z * sin) * speed;
      const targetVelZ = (staticMoveVector.x * sin + staticMoveVector.z * cos) * speed;

      // Instant 0ms acceleration for immediate, punchy pickup without sluggish delay
      const accelRate = isMoving ? 120 : 65;
      velocityRef.current.x = THREE.MathUtils.damp(velocityRef.current.x, targetVelX, accelRate, delta);
      velocityRef.current.z = THREE.MathUtils.damp(velocityRef.current.z, targetVelZ, accelRate, delta);

      const worldDX = velocityRef.current.x * delta;
      const worldDZ = velocityRef.current.z * delta;

      // -------------------------------------------------------------
      // AAA Buttery-Smooth Unified Character Capsule Sliding
      // 2 streamlined convex spheres: Front Basket Nose, Player/Trolley Center
      // Eliminates internal friction, edge catching, corner snags, and collision chatter
      // -------------------------------------------------------------
      const boxes = STATIC_OBSTACLES_FLOOR1;
      const sinYaw = Math.sin(yawRef.current);
      const cosYaw = Math.cos(yawRef.current);

      // --- Decoupled Axis Sliding Physics: Guaranteed Never-Stuck Movement ---
      // 1. Move along X axis and resolve X-axis collisions
      let nextX = posRef.current.x + worldDX;
        for (let s = 0; s < STATIC_SPHERES.length; s++) {
          const sp = STATIC_SPHERES[s];
          const sx = nextX + sinYaw * sp.fwdDist;
          const sz = posRef.current.z + cosYaw * sp.fwdDist;

          for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            if (sx < b.minX - 2.5 || sx > b.maxX + 2.5 || sz < b.minZ - 2.5 || sz > b.maxZ + 2.5) continue;
            const res = getCircleBoxDepenetration(sx, sz, sp.radius, b);
            if (res.overlap) {
              nextX += res.pX;
              velocityRef.current.x = 0;
            }
          }
        }

        // 2. Move along Z axis and resolve Z-axis collisions
        let nextZ = posRef.current.z + worldDZ;
        for (let s = 0; s < STATIC_SPHERES.length; s++) {
          const sp = STATIC_SPHERES[s];
          const sx = nextX + sinYaw * sp.fwdDist;
          const sz = nextZ + cosYaw * sp.fwdDist;

          for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            if (sx < b.minX - 2.5 || sx > b.maxX + 2.5 || sz < b.minZ - 2.5 || sz > b.maxZ + 2.5) continue;
            const res = getCircleBoxDepenetration(sx, sz, sp.radius, b);
            if (res.overlap) {
              nextZ += res.pZ;
              velocityRef.current.z = 0;
            }
          }
        }

        posRef.current.x = nextX;
        posRef.current.z = nextZ;

      // Store outer boundaries safety clamp (72m x 72m hypermarket: -35m to +35m)
      posRef.current.x = Math.max(-34.8, Math.min(34.8, posRef.current.x));
      posRef.current.z = Math.max(-34.8, Math.min(34.8, posRef.current.z));

      // Track previous Z to detect directional crossing across the yellow checkout sensor line (z = 15.6)
      const prevZ = prevZRef.current;
      const currZ = posRef.current.z;
      const currX = posRef.current.x;
      prevZRef.current = currZ;

      const billingPhase = useBillingStore.getState().phase;
      const activeCartItems = useCartStore.getState().items;
      const isCartPaid = useCartStore.getState().isPaid;

      // The Yellow Checkout Sensor Line spans all 6 lanes (x: -17.5 to +17.5, z: 15.6)
      const isWithinBillingWidth = Math.abs(currX) <= 17.5;

      // 1. FORWARD CROSSING: User pushes trolley forward across the line into the scan dock (z >= 16.5)
      // Automatically takes items from trolley and scans them!
      const isCrossingForward =
        isWithinBillingWidth &&
        currZ >= 16.5 &&
        currZ <= 20.0 &&
        (prevZ < 16.5 || velocityRef.current.z > 0.04 || keys.current.forward || martRuntime.virtualKeys.forward);

      if (
        isCrossingForward &&
        activeCartItems.length > 0 &&
        !isCartPaid &&
        billingPhase === 'idle' &&
        Date.now() > martRuntime.billingCooldownUntil
      ) {
        martRuntime.billingCooldownUntil = Date.now() + 2500;
        startCheckout(activeCartItems);
      }

      // 2. RETREATING BACKWARD: User pulls trolley far back out of the dock (currZ < 13.8)
      // When coming back, do NOT take items! If a scan was active, cancel and keep items in trolley
      const isRetreatingBackward =
        isWithinBillingWidth &&
        currZ < 13.8 &&
        (prevZ >= 13.8 || velocityRef.current.z < -0.04 || keys.current.backward || martRuntime.virtualKeys.backward);

      if (isRetreatingBackward && billingPhase === 'scanning') {
        useBillingStore.getState().resetBilling();
        martRuntime.billingCooldownUntil = Date.now() + 2500;
      }
    }

    // Fixed ground floor height (1.45m eye level)
    posRef.current.y = THREE.MathUtils.damp(posRef.current.y, 1.45, 8, delta);

    // High-frequency zero-rerender runtime update (0ms lockstep synchronization with all 3D systems)
    martRuntime.playerPos[0] = posRef.current.x;
    martRuntime.playerPos[1] = posRef.current.y;
    martRuntime.playerPos[2] = posRef.current.z;
    martRuntime.playerYaw = yawRef.current;

    // Proximity checks for HUD prompt
    const now = performance.now();
    const px = posRef.current.x;
    const pz = posRef.current.z;

    const nearBilling = Math.abs(pz - 22.0) < 4.0 && Math.abs(px) < 18.0;
    const nearExit = pz <= -32.5 && Math.abs(px) < 8.0;

    let prompt: string | null = null;
    let targetPos: [number, number, number] | null = null;

    if (nearBilling) {
      prompt = null; // Do NOT show prompt banner per user request
    } else if (nearExit) {
      const activeCart = useCartStore.getState().items;
      const isCartPaid = useCartStore.getState().isPaid;
      prompt = isCartPaid || activeCart.length === 0 ? 'Press [E] to Exit Supermarket' : 'Exit Locked: Please pay at the billing counter!';
    } else if (now - lastProximityCheck.current > 250) {
      lastProximityCheck.current = now;
      const nearbyProd = products.find((p) => {
        if (!p.placement) return false;
        const dx = p.placement.worldX - px;
        const dz = p.placement.worldZ - pz;
        return (dx * dx + dz * dz) < 6.25; // 2.5m squared (zero Math.sqrt)
      });

      if (nearbyProd && nearbyProd.placement) {
        prompt = `Press [E] or Click to Inspect ${nearbyProd.name} (₹${nearbyProd.price})`;
        targetPos = [nearbyProd.placement.worldX, nearbyProd.placement.worldY, nearbyProd.placement.worldZ];
      }
    } else {
      prompt = proximityCache.current.prompt?.startsWith('Press [E] or Click to Inspect') ? proximityCache.current.prompt : null;
    }

    // Cached proximity update to eliminate unnecessary Zustand dispatches
    if (
      proximityCache.current.prompt !== prompt ||
      proximityCache.current.nearBilling !== nearBilling ||
      proximityCache.current.nearExit !== nearExit
    ) {
      proximityCache.current = { prompt, nearBilling, nearExit };
      setProximity(nearBilling, nearExit, prompt, targetPos);
    }

    // Camera positioning based on cameraMode
    if (cameraMode === 'billing') {
      // Normal full-size trolley framing: camera sits at standard third-person distance right behind the handle
      const camDist = 0.55;
      const fwdX = Math.sin(yawRef.current);
      const fwdZ = Math.cos(yawRef.current);
      const targetCamX = posRef.current.x - fwdX * camDist;
      const targetCamZ = posRef.current.z - fwdZ * camDist;
      const targetCamY = posRef.current.y - 0.05;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 22, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 22, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 22, delta);
      camera.lookAt(posRef.current.x + fwdX * 4.0, posRef.current.y - 0.35, posRef.current.z + fwdZ * 4.0);
    } else if (cameraMode === 'exit') {
      // Exit gate cinematic view
      camera.position.set(0, 2.2, -26.5);
      camera.lookAt(0, 1.5, -31.0);
    } else {
      // Smooth 0.4s eased transition between 1st Person (0.0) and 3rd Person (1.0)
      const targetProgress = cameraMode === 'first_person' ? 0.0 : 1.0;
      const transitionDuration = 0.4;
      if (cameraProgressRef.current < targetProgress) {
        cameraProgressRef.current = Math.min(targetProgress, cameraProgressRef.current + delta / transitionDuration);
      } else if (cameraProgressRef.current > targetProgress) {
        cameraProgressRef.current = Math.max(targetProgress, cameraProgressRef.current - delta / transitionDuration);
      }

      // Hermite smoothstep cubic easing: 3*t^2 - 2*t^3
      const t = cameraProgressRef.current;
      const easeT = t * t * (3 - 2 * t);

      const fwdX = Math.sin(yawRef.current);
      const fwdZ = Math.cos(yawRef.current);

      // --- 1. First-Person Camera Coordinates (Player holding trolley handle) ---
      const fpCamX = posRef.current.x + fwdX * 0.12;
      const fpCamY = posRef.current.y + 0.12;
      const fpCamZ = posRef.current.z + fwdZ * 0.12;

      // First-person look: slight natural downward tilt (-8 deg) so trolley handle & basket front sit at bottom edge
      const fpPitch = pitchRef.current - 0.14;
      const fpLookDist = 5.0;
      const fpLookX = fpCamX + fwdX * Math.cos(fpPitch) * fpLookDist;
      const fpLookY = fpCamY + Math.sin(fpPitch) * fpLookDist;
      const fpLookZ = fpCamZ + fwdZ * Math.cos(fpPitch) * fpLookDist;

      // --- 2. Third-Person Camera Coordinates (Sitting just behind trolley at ~1.45m high, matching reference) ---
      const rayDirX = -fwdX;
      const rayDirZ = -fwdZ;
      const isCloseInspect = typeof window !== 'undefined' && Boolean((window as any).__martverseInspectTrolleyActive);
      const baseDist = isCloseInspect ? 0.35 : 0.55; // 1.70m total distance behind trolley
      const currentObstacles = STATIC_OBSTACLES_FLOOR1;
      const safeObstacleDist = isCloseInspect ? 0.35 : checkCameraObstacleDistance(posRef.current.x, posRef.current.z, rayDirX, rayDirZ, baseDist, currentObstacles);

      camDistRef.current = THREE.MathUtils.damp(camDistRef.current, safeObstacleDist, 22, delta);

      const tpCamX = posRef.current.x + rayDirX * camDistRef.current;
      const tpCamY = posRef.current.y - 0.05; // 1.45m high (matches reference photo)
      const tpCamZ = posRef.current.z + rayDirZ * camDistRef.current;

      const tpLookX = posRef.current.x + fwdX * (isCloseInspect ? 1.5 : 5.0);
      const tpLookY = posRef.current.y - (isCloseInspect ? 0.55 : 0.45) + Math.sin(pitchRef.current) * 2.8;
      const tpLookZ = posRef.current.z + fwdZ * (isCloseInspect ? 1.5 : 5.0);

      // --- 3. Eased Interpolation for Seamless 0.4s Toggle ---
      const targetCamX = THREE.MathUtils.lerp(fpCamX, tpCamX, easeT);
      const targetCamY = THREE.MathUtils.lerp(fpCamY, tpCamY, easeT);
      const targetCamZ = THREE.MathUtils.lerp(fpCamZ, tpCamZ, easeT);

      const targetLookX = THREE.MathUtils.lerp(fpLookX, tpLookX, easeT);
      const targetLookY = THREE.MathUtils.lerp(fpLookY, tpLookY, easeT);
      const targetLookZ = THREE.MathUtils.lerp(fpLookZ, tpLookZ, easeT);

      // Smooth camera damping to prevent any camera jerk
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 45, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 45, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 45, delta);

      currentLookTarget.current.x = THREE.MathUtils.damp(currentLookTarget.current.x, targetLookX, 45, delta);
      currentLookTarget.current.y = THREE.MathUtils.damp(currentLookTarget.current.y, targetLookY, 45, delta);
      currentLookTarget.current.z = THREE.MathUtils.damp(currentLookTarget.current.z, targetLookZ, 45, delta);

      camera.lookAt(currentLookTarget.current);
    }
  });

  return null;
};
