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
}

interface ObstacleBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const STATIC_OBSTACLES_FLOOR1: ObstacleBox[] = [
  // Outer Store Perimeter Walls
  { minX: -22.0, maxX: -17.2, minZ: -27.0, maxZ: 27.0 },  // Left Wall
  { minX: 17.2, maxX: 22.0, minZ: -27.0, maxZ: 27.0 },   // Right Wall
  { minX: -22.0, maxX: 22.0, minZ: 24.6, maxZ: 28.0 },   // Back Wall
  { minX: -22.0, maxX: -3.8, minZ: -28.0, maxZ: -24.8 }, // Front Entrance Wall (Left of door)
  { minX: 3.8, maxX: 22.0, minZ: -28.0, maxZ: -24.8 },  // Front Entrance Wall (Right of door)
  { minX: -3.8, maxX: 3.8, minZ: -28.0, maxZ: -25.8 },  // Front Doorway Backstop

  // Shelves Floor 1: [-10, -5, 0, 5, 10], halfW = 0.85, z from -12.0 to 12.0
  { minX: -10.85, maxX: -9.15, minZ: -12.0, maxZ: 12.0 },
  { minX: -5.85, maxX: -4.15, minZ: -12.0, maxZ: 12.0 },
  { minX: -0.85, maxX: 0.85, minZ: -12.0, maxZ: 12.0 },
  { minX: 4.15, maxX: 5.85, minZ: -12.0, maxZ: 12.0 },
  { minX: 9.15, maxX: 10.85, minZ: -12.0, maxZ: 12.0 },

  // Billing Counter Desks at [-3.8, 0, 3.8]
  { minX: -4.45, maxX: -3.15, minZ: 16.5, maxZ: 19.5 },
  { minX: -0.65, maxX: 0.65, minZ: 16.5, maxZ: 19.5 },
  { minX: 3.15, maxX: 4.45, minZ: 16.5, maxZ: 19.5 },

  // Escalator Outer Barrier Balustrade (Separating Aisle 5 from Escalator Well)
  { minX: 13.0, maxX: 13.5, minZ: -7.0, maxZ: 5.0 },

  // Exit Turnstile Gate (At z = -23.0)
  { minX: -1.95, maxX: -1.65, minZ: -23.25, maxZ: -22.75 },
  { minX: 1.65, maxX: 1.95, minZ: -23.25, maxZ: -22.75 },
  { minX: -0.22, maxX: 0.22, minZ: -23.25, maxZ: -22.75 },
];

const STATIC_OBSTACLES_FLOOR2: ObstacleBox[] = [
  // Outer Store Perimeter Walls
  { minX: -22.0, maxX: -17.2, minZ: -27.0, maxZ: 27.0 },  // Left Wall
  { minX: 17.2, maxX: 22.0, minZ: -27.0, maxZ: 27.0 },   // Right Wall
  { minX: -22.0, maxX: 22.0, minZ: 24.6, maxZ: 28.0 },   // Back Wall
  { minX: -22.0, maxX: 22.0, minZ: -28.0, maxZ: -24.8 }, // Front Wall

  // Shelves Floor 2: [-11.0, -6.5, -2.0, 2.5, 7.0, 11.5]
  { minX: -11.85, maxX: -10.15, minZ: -12.0, maxZ: 12.0 },
  { minX: -7.35, maxX: -5.65, minZ: -12.0, maxZ: 12.0 },
  { minX: -2.85, maxX: -1.15, minZ: -12.0, maxZ: 12.0 },
  { minX: 1.65, maxX: 3.35, minZ: -12.0, maxZ: 12.0 },
  { minX: 6.15, maxX: 7.85, minZ: -12.0, maxZ: 12.0 },
  { minX: 10.65, maxX: 12.35, minZ: -12.0, maxZ: 12.0 },

  // Floor 2 Escalator void opening guardrails
  { minX: 13.0, maxX: 13.4, minZ: -6.5, maxZ: 5.2 },
  { minX: 13.0, maxX: 16.5, minZ: -6.7, maxZ: -6.3 },
];

const UNPAID_EXIT_BARRIER: ObstacleBox = {
  minX: -1.75,
  maxX: 1.75,
  minZ: -23.15,
  maxZ: -22.85,
};

function getCircleBoxDepenetration(
  cx: number,
  cz: number,
  cr: number,
  box: ObstacleBox
): { overlap: boolean; pX: number; pZ: number; normalX: number; normalZ: number } {
  const closestX = Math.max(box.minX, Math.min(cx, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(cz, box.maxZ));
  const dx = cx - closestX;
  const dz = cz - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= cr * cr) {
    return { overlap: false, pX: 0, pZ: 0, normalX: 0, normalZ: 0 };
  }

  const dist = Math.sqrt(distSq);
  if (dist < 0.0001) {
    const dL = cx - box.minX;
    const dR = box.maxX - cx;
    const dB = cz - box.minZ;
    const dT = box.maxZ - cz;
    const minD = Math.min(dL, dR, dB, dT);
    if (minD === dL) return { overlap: true, pX: -(dL + cr), pZ: 0, normalX: -1, normalZ: 0 };
    if (minD === dR) return { overlap: true, pX: (dR + cr), pZ: 0, normalX: 1, normalZ: 0 };
    if (minD === dB) return { overlap: true, pX: 0, pZ: -(dB + cr), normalX: 0, normalZ: -1 };
    return { overlap: true, pX: 0, pZ: (dT + cr), normalX: 0, normalZ: 1 };
  }

  const overlap = cr - dist;
  const normalX = dx / dist;
  const normalZ = dz / dist;
  return {
    overlap: true,
    pX: normalX * overlap,
    pZ: normalZ * overlap,
    normalX,
    normalZ,
  };
}

export const PlayerController: React.FC = () => {
  const { camera } = useThree();
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
  });

  const activeFloor = useMartStore((state) => state.activeFloor);
  const cameraMode = useMartStore((state) => state.cameraMode);
  const products = useMartStore((state) => state.products);
  const setActiveFloor = useMartStore((state) => state.setActiveFloor);
  const setProximity = useMartStore((state) => state.setProximity);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const openUnpaidExitAlert = useMartStore((state) => state.openUnpaidExitAlert);
  const hasMovedTrolley = useMartStore((state) => state.hasMovedTrolley);
  const setHasMovedTrolley = useMartStore((state) => state.setHasMovedTrolley);
  const showToast = useMartStore((state) => state.showToast);
  const resetTrigger = useMartStore((state) => state.resetTrigger);
  const teleportTrigger = useMartStore((state) => state.teleportTrigger);

  const startCheckout = useBillingStore((state) => state.startCheckout);
  const cartItems = useCartStore((state) => state.items);
  const isPaid = useCartStore((state) => state.isPaid);

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
  const resetPending = useRef(false);
  const proximityCache = useRef<{
    nearBilling: boolean;
    nearExit: boolean;
    prompt: string | null;
  }>({ nearBilling: false, nearExit: false, prompt: null });

  // Handle Reset to Original State & Starting Position (Entrance)
  useEffect(() => {
    if (resetTrigger === 0) return;
    posRef.current.set(0, 1.5, -20);
    velocityRef.current = { x: 0, z: 0 };
    yawRef.current = 0;
    pitchRef.current = 0;
    targetYawRef.current = 0;
    targetPitchRef.current = 0;
    currentLookTarget.current.set(0, 1.85, -17.7);
    martRuntime.playerPos[0] = 0;
    martRuntime.playerPos[1] = 1.5;
    martRuntime.playerPos[2] = -20;
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
      // Don't capture keys if typing in an input field
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
        case 'KeyE':
          keys.current.interact = false;
          break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 2) {
        isRightDragging.current = true;
        prevMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
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

      targetYawRef.current -= dx * 0.0032;
      targetPitchRef.current = Math.max(-0.55, Math.min(0.55, targetPitchRef.current - dy * 0.0028));

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
      if (e.button === 0) isDragging.current = false;
      if (e.button === 2) isRightDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.closest('.overflow-y-auto') ||
        target?.closest('.overflow-x-auto') ||
        ['INPUT', 'TEXTAREA'].includes(target?.tagName)
      ) {
        return;
      }
      e.preventDefault();

      // Two-finger trackpad swipe or mouse wheel roll:
      // deltaY < 0 is rolling up / swiping up -> move forward (+Z)
      // deltaY > 0 is rolling down / swiping down -> move backward (-Z)
      // deltaX < 0 is swiping left -> move left (+X)
      // deltaX > 0 is swiping right -> move right (-X)
      const factor = 0.0075;
      wheelMomentum.current.z -= e.deltaY * factor;
      wheelMomentum.current.x -= e.deltaX * factor;

      wheelMomentum.current.z = THREE.MathUtils.clamp(wheelMomentum.current.z, -1.2, 1.2);
      wheelMomentum.current.x = THREE.MathUtils.clamp(wheelMomentum.current.x, -1.2, 1.2);

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
  }, [products, cartItems, isPaid]);

  // Handle 'E' or Interaction
  const handleInteract = () => {
    const px = posRef.current.x;
    const pz = posRef.current.z;

    // Check Billing Counter (around z = 15.0 to 19.5, across lanes 1-3 from x = -6.8 to 3.5)
    if (pz >= 15.0 && pz <= 19.5 && px >= -6.8 && px <= 3.5) {
      if (cartItems.length > 0 && useBillingStore.getState().phase === 'idle') {
        startCheckout(cartItems);
      }
      return;
    }

    // Check Exit Gate (around z = -22, x between -3 and 3)
    if (Math.abs(pz - (-22)) < 3.5 && Math.abs(px) < 3.5) {
      if (cartItems.length === 0 || isPaid) {
        sounds.playGateOpen();
        setCameraMode('exit');
      } else {
        sounds.playWarningBuzz();
        showToast('Exit Gate Locked', 'Unpaid items in trolley! Please pay at Billing Counter.', 'warning');
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
      showToast('Escalator Moving Walkway', 'Gliding to 2nd Floor (Fashion Studio)...', 'info');
      sounds.playPickSound();
      return;
    }

    if (nearEscalatorFloor2) {
      posRef.current.x = 14.7;
      posRef.current.z = 5.0;
      yawRef.current = Math.PI; // face down the ramp
      targetYawRef.current = Math.PI;
      showToast('Escalator Moving Walkway', 'Gliding to Ground Floor (Groceries)...', 'info');
      sounds.playPickSound();
      return;
    }

    // Check nearest product
    const nearbyProd = products.find((p) => {
      if (!p.placement) return false;
      const dx = p.placement.worldX - px;
      const dz = p.placement.worldZ - pz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      return dist < 2.5;
    });

    if (nearbyProd) {
      openProductModal(nearbyProd);
    }
  };

  useFrame((_, rawDelta) => {
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
      // Smoothly damp yaw and pitch towards target angles for butter-smooth camera rotation
      yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYawRef.current, 45, delta);
      pitchRef.current = THREE.MathUtils.damp(pitchRef.current, targetPitchRef.current, 45, delta);

      const speed = 11.2; // Snappy, responsive walking speed with buttery smoothness
      const moveVector = new THREE.Vector3();

      // 1. Keyboard WASD & Arrow Keys
      if (keys.current.forward) moveVector.z += 1;
      if (keys.current.backward) moveVector.z -= 1;
      if (keys.current.left) moveVector.x += 1;
      if (keys.current.right) moveVector.x -= 1;

      // 2. On-Screen 4-Arrow Navigator (Virtual D-Pad)
      if (martRuntime.virtualKeys.forward) moveVector.z += 1;
      if (martRuntime.virtualKeys.backward) moveVector.z -= 1;
      if (martRuntime.virtualKeys.left) moveVector.x += 1;
      if (martRuntime.virtualKeys.right) moveVector.x -= 1;

      // 3. Two-Finger Trackpad / Mouse Scroll Momentum
      moveVector.z += wheelMomentum.current.z;
      moveVector.x += wheelMomentum.current.x;

      // Smoothly damp wheel momentum
      wheelMomentum.current.z = THREE.MathUtils.damp(wheelMomentum.current.z, 0, 10, delta);
      wheelMomentum.current.x = THREE.MathUtils.damp(wheelMomentum.current.x, 0, 10, delta);

      const isMoving = moveVector.lengthSq() > 0.001;
      if (isMoving) {
        if (!hasMovedTrolley) {
          setHasMovedTrolley(true);
        }
        if (moveVector.lengthSq() > 1) {
          moveVector.normalize();
        }
      }

      // Smooth acceleration and deceleration for instant, fluid movement
      const sin = Math.sin(yawRef.current);
      const cos = Math.cos(yawRef.current);
      const targetVelX = (moveVector.x * cos + moveVector.z * sin) * speed;
      const targetVelZ = (-moveVector.x * sin + moveVector.z * cos) * speed;

      const accelRate = isMoving ? 30 : 32;
      velocityRef.current.x = THREE.MathUtils.damp(velocityRef.current.x, targetVelX, accelRate, delta);
      velocityRef.current.z = THREE.MathUtils.damp(velocityRef.current.z, targetVelZ, accelRate, delta);

      const worldDX = velocityRef.current.x * delta;
      const worldDZ = velocityRef.current.z * delta;

      const currentFloor = posRef.current.y > 4.5 ? 2 : 1;

      // -------------------------------------------------------------
      // AAA Buttery-Smooth Tangent-Projected Collision Slide Resolver
      // -------------------------------------------------------------
      // Exclude escalator moving ramp & landing zones so movement between floors is 100% free
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
        const cartDist = 0.80;
        const cartRadius = 0.30;
        const playerRadius = 0.28;

        let nextX = posRef.current.x + worldDX;
        let nextZ = posRef.current.z + worldDZ;

        // 2-pass iterative relaxation for 100% impenetrable, ultra-smooth sliding
        for (let iter = 0; iter < 2; iter++) {
          // Pass 1: Player character body
          for (let i = 0; i < boxes.length; i++) {
            const res = getCircleBoxDepenetration(nextX, nextZ, playerRadius, boxes[i]);
            if (res.overlap) {
              nextX += res.pX;
              nextZ += res.pZ;
              // Project velocity along collision surface tangent (preserves 100% sliding speed)
              const vn = velocityRef.current.x * res.normalX + velocityRef.current.z * res.normalZ;
              if (vn < 0) {
                velocityRef.current.x -= vn * res.normalX;
                velocityRef.current.z -= vn * res.normalZ;
              }
            }
          }

          // Pass 2: Trolley body in front of player
          const tx = nextX + sinYaw * cartDist;
          const tz = nextZ + cosYaw * cartDist;
          for (let i = 0; i < boxes.length; i++) {
            const res = getCircleBoxDepenetration(tx, tz, cartRadius, boxes[i]);
            if (res.overlap) {
              nextX += res.pX;
              nextZ += res.pZ;
              const vn = velocityRef.current.x * res.normalX + velocityRef.current.z * res.normalZ;
              if (vn < 0) {
                velocityRef.current.x -= vn * res.normalX;
                velocityRef.current.z -= vn * res.normalZ;
              }
            }
          }

          // Unpaid exit barrier check
          if (cartItems.length > 0 && !isPaid && currentFloor === 1) {
            const resP = getCircleBoxDepenetration(nextX, nextZ, playerRadius, UNPAID_EXIT_BARRIER);
            if (resP.overlap) {
              nextX += resP.pX;
              nextZ += resP.pZ;
              const vn = velocityRef.current.x * resP.normalX + velocityRef.current.z * resP.normalZ;
              if (vn < 0) {
                velocityRef.current.x -= vn * resP.normalX;
                velocityRef.current.z -= vn * resP.normalZ;
              }
            }
            const curTx = nextX + sinYaw * cartDist;
            const curTz = nextZ + cosYaw * cartDist;
            const resT = getCircleBoxDepenetration(curTx, curTz, cartRadius, UNPAID_EXIT_BARRIER);
            if (resT.overlap) {
              nextX += resT.pX;
              nextZ += resT.pZ;
              const vn = velocityRef.current.x * resT.normalX + velocityRef.current.z * resT.normalZ;
              if (vn < 0) {
                velocityRef.current.x -= vn * resT.normalX;
                velocityRef.current.z -= vn * resT.normalZ;
              }
            }
          }
        }

        posRef.current.x = nextX;
        posRef.current.z = nextZ;
      }

      // Store outer boundaries safety clamp
      posRef.current.x = Math.max(-16.8, Math.min(16.8, posRef.current.x));
      posRef.current.z = Math.max(-24.2, Math.min(24.2, posRef.current.z));

      // Auto-trigger scanning when walking trolley into the checkout box or crossing the stop line
      const billingPhase = useBillingStore.getState().phase;
      const inCheckoutQueueBox =
        currentFloor === 1 &&
        posRef.current.z >= 15.2 &&
        posRef.current.z <= 18.5 &&
        (
          (posRef.current.x >= -6.5 && posRef.current.x <= -4.9) || // Box 1 (Left of Bench 1)
          (posRef.current.x >= -2.7 && posRef.current.x <= -1.1) || // Box 2 (Left of Bench 2)
          (posRef.current.x >= 1.1 && posRef.current.x <= 2.7)      // Box 3 (Left of Bench 3)
        );

      if (inCheckoutQueueBox && cartItems.length > 0 && !isPaid && billingPhase === 'idle') {
        startCheckout(cartItems);
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
          showToast('2nd Floor Reached', 'Welcome to Fashion Studio & Apparel!', 'success');
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
          showToast('Ground Floor Reached', 'Welcome back to Groceries & Billing!', 'success');
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
    }

    // High-frequency zero-rerender runtime update
    martRuntime.playerPos[0] = posRef.current.x;
    martRuntime.playerPos[1] = posRef.current.y;
    martRuntime.playerPos[2] = posRef.current.z;
    martRuntime.playerYaw = yawRef.current;

    // Throttled Zustand state synchronization to eliminate 60FPS React reconciliation lag
    const now = performance.now();
    const isMovingFast = Math.abs(velocityRef.current.x) > 0.05 || Math.abs(velocityRef.current.z) > 0.05;
    if (now - lastSyncTime.current > (isMovingFast ? 350 : 150)) {
      lastSyncTime.current = now;
      useMartStore.setState({
        playerPos: [posRef.current.x, posRef.current.y, posRef.current.z],
        playerYaw: yawRef.current,
      });
    }

    // Proximity checks for HUD prompt
    const px = posRef.current.x;
    const pz = posRef.current.z;

    const nearBilling = Math.abs(pz - 17.5) < 4.0 && Math.abs(px) < 7.8;
    const nearExit = Math.abs(pz - (-22)) < 3.5 && Math.abs(px) < 3.5;
    const nearEscalatorGround = activeFloor === 1 && Math.abs(px - 14.7) < 2.2 && pz >= -10.5 && pz <= -6.8;
    const nearEscalatorFloor2 = activeFloor === 2 && Math.abs(px - 14.7) < 2.2 && pz >= 5.0 && pz <= 8.5;

    let prompt: string | null = null;
    let targetPos: [number, number, number] | null = null;

    if (onEscalatorRamp) {
      prompt = 'Escalator Moving Walkway • Gliding automatically between floors...';
    } else if (nearEscalatorGround) {
      prompt = 'Press [E] or Step On: ↑ Ride to 2nd Floor (Fashion Studio)';
      targetPos = [14.7, 1.5, -7.0];
    } else if (nearEscalatorFloor2) {
      prompt = 'Press [E] or Step On: ↓ Ride to Ground Floor (Groceries & POS)';
      targetPos = [14.7, 6.5, 5.0];
    } else if (nearBilling) {
      prompt = null; // Do NOT show prompt banner per user request
    } else if (nearExit) {
      prompt = isPaid || cartItems.length === 0 ? 'Press [E] to Exit Supermarket' : 'Exit Locked: Please pay at the billing counter!';
    } else if (now - lastProximityCheck.current > 80) {
      lastProximityCheck.current = now;
      const nearbyProd = products.find((p) => {
        if (!p.placement) return false;
        // Floor filter: aisles 1-5 = Floor 1, aisles 6-10 = Floor 2
        const prodFloor = p.placement.aisleNumber <= 5 ? 1 : 2;
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
      prompt = proximityCache.current.prompt;
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
      const camHeight = 2.0;
      const targetCamX = posRef.current.x - Math.sin(yawRef.current) * camDist;
      const targetCamZ = posRef.current.z - Math.cos(yawRef.current) * camDist;
      const targetCamY = posRef.current.y + camHeight;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 10, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 10, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 10, delta);
      camera.lookAt(posRef.current.x, posRef.current.y + 0.4, posRef.current.z + 2.0);
    } else if (cameraMode === 'exit') {
      // Exit gate cinematic view
      camera.position.set(0, 2.2, -18.5);
      camera.lookAt(0, 1.5, -23.0);
    } else if (cameraMode === 'first_person') {
      camera.position.set(posRef.current.x, posRef.current.y + 0.3, posRef.current.z);
      const lookDist = 5;
      const targetLookX = posRef.current.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current) * lookDist;
      const targetLookY = posRef.current.y + 0.3 + Math.sin(pitchRef.current) * lookDist;
      const targetLookZ = posRef.current.z + Math.cos(yawRef.current) * Math.cos(pitchRef.current) * lookDist;
      camera.lookAt(targetLookX, targetLookY, targetLookZ);
    } else {
      // Third Person (Orbit lock with smooth perimeter wall avoidance - zero jitter / zero angle distortion)
      const camDist = 3.0;
      const camHeight = 1.95;
      const rayDirX = -Math.sin(yawRef.current);
      const rayDirZ = -Math.cos(yawRef.current);

      let effectiveCamDist = camDist;
      if (rayDirX < -0.001) {
        const dX = (-17.0 - posRef.current.x) / rayDirX;
        if (dX > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dX - 0.25));
      } else if (rayDirX > 0.001) {
        const dX = (17.0 - posRef.current.x) / rayDirX;
        if (dX > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dX - 0.25));
      }

      if (rayDirZ < -0.001) {
        const dZ = (-25.0 - posRef.current.z) / rayDirZ;
        if (dZ > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dZ - 0.25));
      } else if (rayDirZ > 0.001) {
        const dZ = (25.0 - posRef.current.z) / rayDirZ;
        if (dZ > 0) effectiveCamDist = Math.min(effectiveCamDist, Math.max(1.2, dZ - 0.25));
      }

      const targetCamX = posRef.current.x + rayDirX * effectiveCamDist;
      const targetCamY = posRef.current.y + camHeight;
      const targetCamZ = posRef.current.z + rayDirZ * effectiveCamDist;

      const lookTargetX = posRef.current.x + Math.sin(yawRef.current) * 2.3;
      const lookTargetY = posRef.current.y + 0.35 + Math.sin(pitchRef.current) * 2.0;
      const lookTargetZ = posRef.current.z + Math.cos(yawRef.current) * 2.3;

      camera.position.set(targetCamX, targetCamY, targetCamZ);
      currentLookTarget.current.set(lookTargetX, lookTargetY, lookTargetZ);
      camera.lookAt(currentLookTarget.current);
    }
  });

  return null;
};
