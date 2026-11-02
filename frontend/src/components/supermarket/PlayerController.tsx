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
  { minX: -37.0, maxX: -6.0, minZ: -37.0, maxZ: -35.2 }, // Front Entrance Wall (Left of grand portal)
  { minX: 6.0, maxX: 37.0, minZ: -37.0, maxZ: -35.2 },  // Front Entrance Wall (Right of grand portal)
  { minX: -6.0, maxX: 6.0, minZ: -37.5, maxZ: -36.2 },  // Front Doorway Backstop

  // Shelves Floor 1: 10 Parallel Double-Sided Aisles
  // Positions: [-24.3, -18.9, -13.5, -8.1, -2.7, 2.7, 8.1, 13.5, 18.9, 24.3], halfW = 1.05, Z: [-16.6, 16.6]
  { minX: -25.35, maxX: -23.25, minZ: -16.6, maxZ: 16.6 }, // Aisle 1: Household & Cleaning
  { minX: -19.95, maxX: -17.85, minZ: -16.6, maxZ: 16.6 }, // Aisle 2: Personal Care & Beauty
  { minX: -14.55, maxX: -12.45, minZ: -16.6, maxZ: 16.6 }, // Aisle 3: Biscuits & Snacks
  { minX: -9.15, maxX: -7.05, minZ: -16.6, maxZ: 16.6 },   // Aisle 4: Tea & Coffee Essentials
  { minX: -3.75, maxX: -1.65, minZ: -16.6, maxZ: 16.6 },   // Aisle 5: Chocolates & Sweets
  { minX: 1.65, maxX: 3.75, minZ: -16.6, maxZ: 16.6 },     // Aisle 6: Flours, Rice & Dals
  { minX: 7.05, maxX: 9.15, minZ: -16.6, maxZ: 16.6 },     // Aisle 7: Cooking Oils & Spices
  { minX: 12.45, maxX: 14.55, minZ: -16.6, maxZ: 16.6 },   // Aisle 8: Soft Drinks & Beverages
  { minX: 17.85, maxX: 19.95, minZ: -16.6, maxZ: 16.6 },   // Aisle 9: Snack Packs & Namkeen
  { minX: 23.25, maxX: 25.35, minZ: -16.6, maxZ: 16.6 },   // Aisle 10: Festive Gifting & Sweets

  // Commercial Refrigerator Sections on Right Wall
  { minX: 33.20, maxX: 35.80, minZ: -14.20, maxZ: 14.20 },

  // 6 Commercial Checkout Billing Counter Desks at [-15, -9, -3, 3, 9, 15], Z ~ 22.0
  { minX: -16.15, maxX: -13.85, minZ: 20.8, maxZ: 23.2 },
  { minX: -10.15, maxX: -7.85, minZ: 20.8, maxZ: 23.2 },
  { minX: -4.15, maxX: -1.85, minZ: 20.8, maxZ: 23.2 },
  { minX: 1.85, maxX: 4.15, minZ: 20.8, maxZ: 23.2 },
  { minX: 7.85, maxX: 10.15, minZ: 20.8, maxZ: 23.2 },
  { minX: 13.85, maxX: 16.15, minZ: 20.8, maxZ: 23.2 },
];

const STATIC_OBSTACLES_FLOOR2: ObstacleBox[] = [
  // Outer Store Perimeter Walls
  { minX: -22.0, maxX: -17.2, minZ: -27.0, maxZ: 27.0 },  // Left Wall
  { minX: 17.2, maxX: 22.0, minZ: -27.0, maxZ: 27.0 },   // Right Wall
  { minX: -22.0, maxX: 22.0, minZ: 24.6, maxZ: 28.0 },   // Back Wall
  { minX: -22.0, maxX: 22.0, minZ: -28.0, maxZ: -24.8 }, // Front Wall

  // Shelves Floor 2: [-11.0, -6.5, -2.0, 2.5, 7.0, 11.5], halfW = 0.96, Z: [-12.1, 12.1]
  { minX: -11.96, maxX: -10.04, minZ: -12.1, maxZ: 12.1 }, // Aisle 6
  { minX: -7.46, maxX: -5.54, minZ: -12.1, maxZ: 12.1 },  // Aisle 7
  { minX: -2.96, maxX: -1.04, minZ: -12.1, maxZ: 12.1 },  // Aisle 8
  { minX: 1.54, maxX: 3.46, minZ: -12.1, maxZ: 12.1 },    // Aisle 9
  { minX: 6.04, maxX: 7.96, minZ: -12.1, maxZ: 12.1 },    // Aisle 10
  { minX: 10.54, maxX: 12.46, minZ: -12.1, maxZ: 12.1 },  // Aisle 11

  // Floor 2 Escalator void opening guardrails
  { minX: 13.0, maxX: 13.4, minZ: -6.5, maxZ: 5.2 },
  { minX: 13.0, maxX: 16.5, minZ: -6.7, maxZ: -6.3 },
];

const UNPAID_EXIT_BARRIER: ObstacleBox = {
  minX: -1.75,
  maxX: 1.75,
  minZ: -31.15,
  maxZ: -30.85,
};

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
  const lastSyncTime = useRef(0);
  const lastProximityCheck = useRef(0);
  const camDistRef = useRef(3.0);
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
    const camDist = 3.0;
    const camHeight = 1.95;
    const rayDirX = -Math.sin(initYaw);
    const rayDirZ = -Math.cos(initYaw);
    camera.position.set(initX + rayDirX * camDist, initY + camHeight, initZ + rayDirZ * camDist);
    camera.lookAt(
      initX + Math.sin(initYaw) * 2.3,
      initY + 0.35,
      initZ + Math.cos(initYaw) * 2.3
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
    currentLookTarget.current.set(0, 1.85, -25.7);
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

    const handleMouseDown = (e: MouseEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      if (e.button === 0) {
        isDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 2) {
        isRightDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

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

    const handleMouseUp = (e: MouseEvent) => {
      if (!useMartStore.getState().hasEnteredStore) return;
      if (e.button === 0) isDragging.current = false;
      if (e.button === 2) isRightDragging.current = false;
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

      // Two-finger trackpad swipe or mouse wheel roll:
      // deltaY < 0 is rolling up / swiping up -> move forward (+Z)
      // deltaY > 0 is rolling down / swiping down -> move backward (-Z)
      // deltaX < 0 is swiping left -> move left
      // deltaX > 0 is swiping right -> move right
      const factor = 0.012;
      wheelMomentum.current.z -= e.deltaY * factor;
      wheelMomentum.current.x += e.deltaX * factor;

      wheelMomentum.current.z = THREE.MathUtils.clamp(wheelMomentum.current.z, -3.5, 3.5);
      wheelMomentum.current.x = THREE.MathUtils.clamp(wheelMomentum.current.x, -3.5, 3.5);

      if (Math.abs(e.deltaY) > 2 || Math.abs(e.deltaX) > 2) {
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
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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

    // Check Exit Gate (around z = -31, x between -3 and 3)
    if (Math.abs(pz - (-31.0)) < 3.5 && Math.abs(px) < 3.5) {
      if (currentCart.length === 0 || currentPaid) {
        sounds.playGateOpen();
        setCameraMode('exit');
      } else {
        sounds.playWarningBuzz();
        openUnpaidExitAlert();
      }
      return;
    }

    // Check Escalator Entrance (Floor 1 entrance at z ~ -8, Floor 2 entrance at z ~ 6)
    const isFloor2 = posRef.current.y > 4.5 || activeFloor === 2;
    const nearEscalatorGround = !isFloor2 && Math.abs(px - 14.7) < 2.2 && pz >= -10.5 && pz <= -6.8;
    const nearEscalatorFloor2 = isFloor2 && Math.abs(px - 14.7) < 2.2 && pz >= 5.0 && pz <= 8.5;

    if (nearEscalatorGround) {
      posRef.current.x = 14.7;
      posRef.current.z = -7.0;
      yawRef.current = 0; // face forward up the ramp
      targetYawRef.current = 0;
      sounds.playPickSound();
      return;
    }

    if (nearEscalatorFloor2) {
      posRef.current.x = 14.7;
      posRef.current.z = 5.0;
      yawRef.current = Math.PI; // face down the ramp
      targetYawRef.current = Math.PI;
      sounds.playPickSound();
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
    } else {
      // Smoothly damp yaw and pitch towards target angles for butter-smooth camera rotation (only mouse-look modifies target angles)
      yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYawRef.current, 90, delta);
      pitchRef.current = THREE.MathUtils.damp(pitchRef.current, targetPitchRef.current, 90, delta);

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

      const currentFloor = posRef.current.y > 4.5 ? 2 : 1;

      // -------------------------------------------------------------
      // AAA Buttery-Smooth Unified Character Capsule Sliding
      // 2 streamlined convex spheres: Front Basket Nose, Player/Trolley Center
      // Eliminates internal friction, edge catching, corner snags, and collision chatter
      // -------------------------------------------------------------
      const onRampCorridor =
        posRef.current.x >= 13.8 &&
        posRef.current.x <= 15.6 &&
        posRef.current.z >= -9.5 &&
        posRef.current.z <= 7.5;

      if (onRampCorridor) {
        posRef.current.x += worldDX;
        posRef.current.z += worldDZ;
      } else {
        const boxes = currentFloor === 1 ? STATIC_OBSTACLES_FLOOR1 : STATIC_OBSTACLES_FLOOR2;
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
            const res = getCircleBoxDepenetration(sx, sz, sp.radius, boxes[i]);
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
            const res = getCircleBoxDepenetration(sx, sz, sp.radius, boxes[i]);
            if (res.overlap) {
              nextZ += res.pZ;
              velocityRef.current.z = 0;
            }
          }
        }

        // Unpaid exit barrier check
        const activeCart = useCartStore.getState().items;
        const activePaid = useCartStore.getState().isPaid;
        if (activeCart.length > 0 && !activePaid && currentFloor === 1) {
          const frontSp = STATIC_SPHERES[1]; // Front Bumper
          const fx = nextX + sinYaw * frontSp.fwdDist;
          const fz = nextZ + cosYaw * frontSp.fwdDist;
          const resExit = getCircleBoxDepenetration(fx, fz, frontSp.radius, UNPAID_EXIT_BARRIER);
          if (resExit.overlap) {
            nextZ += resExit.pZ;
            velocityRef.current.z = 0;
          }
        }

        posRef.current.x = nextX;
        posRef.current.z = nextZ;
      }

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

      // The Yellow Checkout Sensor Line spans all 3 lanes (x: -7.2 to +7.2, z: 15.6)
      const isWithinBillingWidth = currentFloor === 1 && Math.abs(currX) <= 7.2;

      // 1. FORWARD CROSSING: User pushes trolley forward across the yellow line (z >= 15.5) into the scan dock
      // Automatically takes items from trolley and scans them!
      const isCrossingForward =
        isWithinBillingWidth &&
        currZ >= 15.5 &&
        currZ <= 19.5 &&
        (prevZ < 15.5 || velocityRef.current.z > 0.04 || keys.current.forward || martRuntime.virtualKeys.forward);

      if (
        isCrossingForward &&
        activeCartItems.length > 0 &&
        !isCartPaid &&
        billingPhase === 'idle' &&
        Date.now() > martRuntime.billingCooldownUntil
      ) {
        startCheckout(activeCartItems);
      }

      // 2. RETREATING BACKWARD: User pulls trolley back across that line (currZ < 15.4)
      // When coming back, do NOT take items! If a scan was active, cancel and keep items in trolley
      const isRetreatingBackward =
        isWithinBillingWidth &&
        currZ < 15.4 &&
        (prevZ >= 15.4 || velocityRef.current.z < -0.04 || keys.current.backward || martRuntime.virtualKeys.backward);

      if (isRetreatingBackward && billingPhase === 'scanning') {
        useBillingStore.getState().resetBilling();
        martRuntime.billingCooldownUntil = Date.now() + 1000;
      }
    }

    // Escalator Transition & Automatic Moving Walkway logic (at x = 14.7, z between -7.4 and 5.4)
    const onEscalatorRamp =
      Math.abs(posRef.current.x - 14.7) < 1.2 &&
      posRef.current.z >= -7.4 &&
      posRef.current.z <= 5.4;

    if (onEscalatorRamp) {
      // 1. Center lateral position gently on the walkway
      posRef.current.x = THREE.MathUtils.damp(posRef.current.x, 14.70, 10, delta);

      // 2. Automatic moving walkway propulsion:
      const forwardInput = keys.current.forward ? 3.5 : 0;
      const isAscending = Math.cos(yawRef.current) >= -0.2;

      if (isAscending) {
        posRef.current.z += (3.2 + forwardInput) * delta;
        targetYawRef.current = 0;
        yawRef.current = THREE.MathUtils.clamp(yawRef.current, -0.4, 0.4);
        yawRef.current = THREE.MathUtils.damp(yawRef.current, 0, 8, delta);

        // When reaching Floor 2 landing
        if (posRef.current.z >= 5.4) {
          posRef.current.z = 5.9;
          posRef.current.y = 6.5;
          targetYawRef.current = 0;
          setActiveFloor(2);
          sounds.playPickSound();
        }
      } else {
        posRef.current.z -= (3.2 + forwardInput) * delta;
        targetYawRef.current = Math.PI;
        yawRef.current = THREE.MathUtils.clamp(yawRef.current, Math.PI - 0.4, Math.PI + 0.4);
        yawRef.current = THREE.MathUtils.damp(yawRef.current, Math.PI, 8, delta);

        // When reaching Ground Floor landing
        if (posRef.current.z <= -7.4) {
          posRef.current.z = -9.2;
          posRef.current.y = 1.5;
          yawRef.current = 0; // Turn around to face forward in front of the escalator!
          targetYawRef.current = 0;
          setActiveFloor(1);
          sounds.playPickSound();
        }
      }

      // 3. Ramp y smoothly between 1.5 (Floor 1) and 6.5 (Floor 2)
      const t = Math.max(0, Math.min(1, (posRef.current.z - (-7.4)) / (5.4 - (-7.4))));
      const desiredY = 1.5 + t * 5.0;
      posRef.current.y = THREE.MathUtils.damp(posRef.current.y, desiredY, 12, delta);

      if (posRef.current.y > 4.5 && activeFloor !== 2) {
        setActiveFloor(2);
      } else if (posRef.current.y <= 4.5 && activeFloor !== 1) {
        setActiveFloor(1);
      }
    } else {
      // Fixed floor height
      const targetFloorY = activeFloor === 2 ? 6.5 : 1.5;
      posRef.current.y = THREE.MathUtils.damp(posRef.current.y, targetFloorY, 8, delta);

      // Floor height synchronization outside escalator ramp
      const physicalFloor = posRef.current.y > 3.8 ? 2 : 1;
      if (activeFloor !== physicalFloor) {
        setActiveFloor(physicalFloor);
        proximityCache.current.prompt = null;
      }
    }

    // High-frequency zero-rerender runtime update (0ms lockstep synchronization with all 3D systems)
    martRuntime.playerPos[0] = posRef.current.x;
    martRuntime.playerPos[1] = posRef.current.y;
    martRuntime.playerPos[2] = posRef.current.z;
    martRuntime.playerYaw = yawRef.current;

    // Proximity checks for HUD prompt
    const now = performance.now();
    const px = posRef.current.x;
    const pz = posRef.current.z;

    const nearBilling = activeFloor === 1 && Math.abs(pz - 22.0) < 4.0 && Math.abs(px) < 18.0;
    const nearExit = activeFloor === 1 && Math.abs(pz - (-31.0)) < 3.5 && Math.abs(px) < 3.5;
    const nearEscalatorGround = activeFloor === 1 && Math.abs(px - 14.7) < 2.2 && pz >= -10.5 && pz <= -6.8;
    const nearEscalatorFloor2 = activeFloor === 2 && Math.abs(px - 14.7) < 2.2 && pz >= 5.0 && pz <= 8.5;

    let prompt: string | null = null;
    let targetPos: [number, number, number] | null = null;

    if (onEscalatorRamp) {
      prompt = 'Escalator Moving Walkway • Gliding automatically between floors...';
    } else if (nearEscalatorGround) {
      prompt = 'Press [E] or Step On: ↑ Ride to 2nd Floor (Upper Level)';
      targetPos = [14.7, 1.5, -7.0];
    } else if (nearEscalatorFloor2) {
      prompt = 'Press [E] or Step On: ↓ Ride to Ground Floor (Groceries & POS)';
      targetPos = [14.7, 6.5, 5.0];
    } else if (nearBilling) {
      prompt = null; // Do NOT show prompt banner per user request
    } else if (nearExit) {
      const activeCart = useCartStore.getState().items;
      const isCartPaid = useCartStore.getState().isPaid;
      prompt = isCartPaid || activeCart.length === 0 ? 'Press [E] to Exit Supermarket' : 'Exit Locked: Please pay at the billing counter!';
    } else if (now - lastProximityCheck.current > 250) {
      lastProximityCheck.current = now;
      const nearbyProd = products.find((p) => {
        if (!p.placement) return false;
        const prodFloor = p.placement.floorNumber ?? 1;
        if (prodFloor !== activeFloor) return false;
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

    // Camera positioning based on cameraMode (No auto zoom during billing per user request)
    if (cameraMode === 'billing') {
      const camDist = 3.2;
      const camHeight = 1.9;
      const targetCamX = posRef.current.x - Math.sin(yawRef.current) * camDist - 0.35;
      const targetCamZ = posRef.current.z - Math.cos(yawRef.current) * camDist;
      const targetCamY = posRef.current.y + camHeight;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 10, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 10, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 10, delta);
      camera.lookAt(posRef.current.x + 0.85, posRef.current.y + 0.35, posRef.current.z + 1.2);
    } else if (cameraMode === 'exit') {
      // Exit gate cinematic view
      camera.position.set(0, 2.2, -26.5);
      camera.lookAt(0, 1.5, -31.0);
    } else if (cameraMode === 'first_person') {
      camera.position.set(posRef.current.x, posRef.current.y + 0.3, posRef.current.z);
      const lookDist = 5;
      const targetLookX = posRef.current.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current) * lookDist;
      const targetLookY = posRef.current.y + 0.3 + Math.sin(pitchRef.current) * lookDist;
      const targetLookZ = posRef.current.z + Math.cos(yawRef.current) * Math.cos(pitchRef.current) * lookDist;
      camera.lookAt(targetLookX, targetLookY, targetLookZ);
    } else {
      // Third Person (Orbit lock with smooth perimeter wall avoidance across 72m footprint)
      const camDist = 3.0;
      const camHeight = 1.95;
      const rayDirX = -Math.sin(yawRef.current);
      const rayDirZ = -Math.cos(yawRef.current);

      let effectiveCamDist = camDist;
      if (rayDirX < -0.001) {
        const dX = (-35.0 - posRef.current.x) / rayDirX;
        if (dX > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dX - 0.25));
      } else if (rayDirX > 0.001) {
        const dX = (35.0 - posRef.current.x) / rayDirX;
        if (dX > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dX - 0.25));
      }

      if (rayDirZ < -0.001) {
        const dZ = (-35.0 - posRef.current.z) / rayDirZ;
        if (dZ > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dZ - 0.25));
      } else if (rayDirZ > 0.001) {
        const dZ = (35.0 - posRef.current.z) / rayDirZ;
        if (dZ > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dZ - 0.25));
      }

      camDistRef.current = THREE.MathUtils.damp(camDistRef.current, effectiveCamDist, 22, delta);

      const targetCamX = posRef.current.x + rayDirX * camDistRef.current;
      const targetCamY = posRef.current.y + camHeight;
      const targetCamZ = posRef.current.z + rayDirZ * camDistRef.current;

      const lookTargetX = posRef.current.x + Math.sin(yawRef.current) * 2.3;
      const lookTargetY = posRef.current.y + 0.35 + Math.sin(pitchRef.current) * 2.0;
      const lookTargetZ = posRef.current.z + Math.cos(yawRef.current) * 2.3;

      // Ultra-smooth high-frequency camera and look-target interpolation (fast 90 damping for zero camera lag behind trolley)
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 90, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 90, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 90, delta);

      currentLookTarget.current.x = THREE.MathUtils.damp(currentLookTarget.current.x, lookTargetX, 90, delta);
      currentLookTarget.current.y = THREE.MathUtils.damp(currentLookTarget.current.y, lookTargetY, 90, delta);
      currentLookTarget.current.z = THREE.MathUtils.damp(currentLookTarget.current.z, lookTargetZ, 90, delta);

      camera.lookAt(currentLookTarget.current);
    }
  });

  return null;
};
