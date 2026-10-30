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
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);
  const currentLookTarget = useRef(new THREE.Vector3(0, 1.85, -17.7));
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const lastSyncTime = useRef(0);
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

  // Synchronize position if floor switched via HUD
  useEffect(() => {
    const targetY = activeFloor === 2 ? 6.5 : 1.5;
    posRef.current.y = targetY;
  }, [activeFloor]);

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
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

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

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
      yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYawRef.current, 28, delta);
      pitchRef.current = THREE.MathUtils.damp(pitchRef.current, targetPitchRef.current, 28, delta);

      const speed = 7.5; // m/s walking speed
      const moveVector = new THREE.Vector3();

      if (keys.current.forward) moveVector.z += 1;
      if (keys.current.backward) moveVector.z -= 1;
      if (keys.current.left) moveVector.x += 1;
      if (keys.current.right) moveVector.x -= 1;

      const isMoving = moveVector.lengthSq() > 0;
      if (isMoving) {
        if (!hasMovedTrolley) {
          setHasMovedTrolley(true);
        }
        moveVector.normalize();
      }

      // Smooth acceleration and deceleration (rate 15/18 for responsive fluid motion without snapping)
      const sin = Math.sin(yawRef.current);
      const cos = Math.cos(yawRef.current);
      const targetVelX = (moveVector.x * cos + moveVector.z * sin) * speed;
      const targetVelZ = (-moveVector.x * sin + moveVector.z * cos) * speed;

      const accelRate = isMoving ? 15 : 18;
      velocityRef.current.x = THREE.MathUtils.damp(velocityRef.current.x, targetVelX, accelRate, delta);
      velocityRef.current.z = THREE.MathUtils.damp(velocityRef.current.z, targetVelZ, accelRate, delta);

      const worldDX = velocityRef.current.x * delta;
      const worldDZ = velocityRef.current.z * delta;

      const currentFloor = posRef.current.y > 4.5 ? 2 : 1;

      // Circle vs Axis-Aligned Bounding Box intersection test
      const circleIntersectsAABB = (
        cx: number,
        cz: number,
        r: number,
        minX: number,
        maxX: number,
        minZ: number,
        maxZ: number
      ): boolean => {
        const closestX = Math.max(minX, Math.min(cx, maxX));
        const closestZ = Math.max(minZ, Math.min(cz, maxZ));
        const dx = cx - closestX;
        const dz = cz - closestZ;
        return dx * dx + dz * dz < r * r;
      };

      // Comprehensive Obstacle & Shelf Collision Checker (checks Player + full Trolley footprint)
      const checkObstacle = (testPx: number, testPz: number, floor: number, yaw: number): boolean => {
        const sin = Math.sin(yaw);
        const cos = Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        // Escalator Ramp Walkway: Allow completely free movement on the moving ramp
        const onRampCorridor = testPx >= 14.0 && testPx <= 15.4 && testPz >= -7.5 && testPz <= 5.5;
        if (onRampCorridor) {
          return false; // Escalator moving walkway is completely clear
        }

        // Escalator Landing Zones: Ground Floor landing and Floor 2 landing are completely open
        const onEscalatorLanding =
          testPx >= 13.8 && testPx <= 15.6 &&
          ((floor === 1 && testPz >= -9.2 && testPz <= -7.2) ||
           (floor === 2 && testPz >= 5.3 && testPz <= 7.8));
        if (onEscalatorLanding) {
          return false; // Landing zones are wide open walkways
        }

        // Compound assembly test circles (Player + Trolley)
        const testCircles = [
          // 1. Player body cylinder
          { x: testPx, z: testPz, r: 0.38 },
          // 2. Trolley front bumper
          { x: testPx + sin * 1.45, z: testPz + cos * 1.45, r: 0.44 },
          // 3. Trolley center chassis
          { x: testPx + sin * 0.95, z: testPz + cos * 0.95, r: 0.44 },
          // 4. Trolley front-left corner
          { x: testPx + sin * 1.40 - rightX * 0.36, z: testPz + cos * 1.40 - rightZ * 0.36, r: 0.22 },
          // 5. Trolley front-right corner
          { x: testPx + sin * 1.40 + rightX * 0.36, z: testPz + cos * 1.40 + rightZ * 0.36, r: 0.22 },
        ];

        // 1. Outer store perimeter walls (width 36, length 52)
        for (const c of testCircles) {
          if (c.x - c.r < -17.1 || c.x + c.r > 17.1) return true;
          if (c.z - c.r < -24.6) {
            // Front doorway opening allowed
            if (Math.abs(c.x) > 3.8 || c.z - c.r < -25.8) return true;
          }
          if (c.z + c.r > 24.6) return true;
        }

        // 2. Escalator outer structure barrier on Floor 1 (stops walking into side balustrade from aisle 5)
        if (floor === 1) {
          for (const c of testCircles) {
            if (circleIntersectsAABB(c.x, c.z, c.r, 12.8, 13.6, -7.4, 5.4)) {
              return true;
            }
          }
        }

        // 3. Floor 2 Escalator void opening guardrails (left side and south back wall protecting atrium void)
        if (floor === 2) {
          for (const c of testCircles) {
            if (circleIntersectsAABB(c.x, c.z, c.r, 13.0, 13.4, -6.6, 5.4)) return true; // Left side glass rail
            if (circleIntersectsAABB(c.x, c.z, c.r, 13.0, 16.5, -6.8, -6.3)) return true; // South back glass rail
          }
        }

        // 4. Shelf Rows Physical Collision Boxes (stops player and cart from entering shelves or edges)
        const aisleXs =
          floor === 1
            ? [-10, -5, 0, 5, 10]
            : [-11.0, -6.5, -2.0, 2.5, 7.0, 11.5];

        for (const ax of aisleXs) {
          // Rack width: 1.9m (±0.95m from center ax), length: 24.8m (-12.4m to +12.4m)
          const minX = ax - 0.95;
          const maxX = ax + 0.95;
          const minZ = -12.4;
          const maxZ = 12.4;

          for (const c of testCircles) {
            if (circleIntersectsAABB(c.x, c.z, c.r, minX, maxX, minZ, maxZ)) {
              return true;
            }
          }
        }

        // 5. Floor 1 Billing Counters Zone (spacious 3.8m spacing between desks)
        if (floor === 1) {
          for (const cx of [-3.8, 0, 3.8]) {
            const minX = cx - 0.68;
            const maxX = cx + 0.68;
            const minZ = 16.4;
            const maxZ = 19.6;
            for (const c of testCircles) {
              if (circleIntersectsAABB(c.x, c.z, c.r, minX, maxX, minZ, maxZ)) {
                return true;
              }
            }
          }

          // Exit Turnstile barrier (locked shut if cart has unpaid items)
          if (cartItems.length > 0 && !isPaid) {
            for (const c of testCircles) {
              if (circleIntersectsAABB(c.x, c.z, c.r, -2.4, 2.4, -22.5, -21.5)) {
                return true;
              }
            }
          }
        }

        return false;
      };

      if (Math.abs(worldDX) > 0.0001 || Math.abs(worldDZ) > 0.0001) {
        const canMoveX = !checkObstacle(posRef.current.x + worldDX, posRef.current.z, currentFloor, yawRef.current);
        const canMoveZ = !checkObstacle(posRef.current.x, posRef.current.z + worldDZ, currentFloor, yawRef.current);

        if (canMoveX && canMoveZ) {
          // Both axes free: verify combined diagonal step doesn't hit a corner
          if (!checkObstacle(posRef.current.x + worldDX, posRef.current.z + worldDZ, currentFloor, yawRef.current)) {
            posRef.current.x += worldDX;
            posRef.current.z += worldDZ;
          } else {
            // Smoothly slide along dominant motion axis
            if (Math.abs(worldDX) > Math.abs(worldDZ)) {
              posRef.current.x += worldDX;
              velocityRef.current.z = 0;
            } else {
              posRef.current.z += worldDZ;
              velocityRef.current.x = 0;
            }
          }
        } else if (canMoveX) {
          // Smooth wall sliding along X axis: cancel blocked Z momentum
          posRef.current.x += worldDX;
          velocityRef.current.z = 0;
        } else if (canMoveZ) {
          // Smooth aisle gliding along Z axis: cancel blocked X momentum
          posRef.current.z += worldDZ;
          velocityRef.current.x = 0;
        } else {
          // Blocked on both axes: zero velocity to prevent momentum accumulation
          velocityRef.current.x = 0;
          velocityRef.current.z = 0;
        }
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
      const forwardInput = keys.current.forward ? 2.5 : 0;
      const isAscending = Math.cos(yawRef.current) >= -0.2;

      if (isAscending) {
        posRef.current.z += (2.4 + forwardInput) * delta;
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
        posRef.current.z -= (2.4 + forwardInput) * delta;
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
    } else {
      const nearbyProd = products.find((p) => {
        if (!p.placement) return false;
        const dx = p.placement.worldX - px;
        const dz = p.placement.worldZ - pz;
        return Math.sqrt(dx * dx + dz * dz) < 2.5;
      });

      if (nearbyProd && nearbyProd.placement) {
        prompt = `Press [E] or Click to Inspect ${nearbyProd.name} (₹${nearbyProd.price})`;
        targetPos = [nearbyProd.placement.worldX, nearbyProd.placement.worldY, nearbyProd.placement.worldZ];
      }
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
      // Third Person (Over the shoulder with smooth camera dampening to prevent viewport stutter)
      const camDist = 3.0;
      const camHeight = 1.95;
      let targetCamX = posRef.current.x - Math.sin(yawRef.current) * camDist;
      let targetCamY = posRef.current.y + camHeight;
      let targetCamZ = posRef.current.z - Math.cos(yawRef.current) * camDist;

      // Prevent camera from clipping through store perimeter walls
      targetCamX = Math.max(-17.2, Math.min(17.2, targetCamX));
      targetCamZ = Math.max(-25.2, Math.min(25.2, targetCamZ));
      targetCamY = Math.max(0.4, targetCamY);

      const lookTargetX = posRef.current.x + Math.sin(yawRef.current) * 2.3;
      const lookTargetY = posRef.current.y + 0.35 + Math.sin(pitchRef.current) * 2.0;
      const lookTargetZ = posRef.current.z + Math.cos(yawRef.current) * 2.3;

      if (resetPending.current) {
        resetPending.current = false;
        camera.position.set(targetCamX, targetCamY, targetCamZ);
        currentLookTarget.current.set(lookTargetX, lookTargetY, lookTargetZ);
      } else {
        // Synchronized camera position and lookAt dampening for butter-smooth gliding motion without viewport stutter or wobble
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 22, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 22, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 22, delta);

        currentLookTarget.current.x = THREE.MathUtils.damp(currentLookTarget.current.x, lookTargetX, 22, delta);
        currentLookTarget.current.y = THREE.MathUtils.damp(currentLookTarget.current.y, lookTargetY, 22, delta);
        currentLookTarget.current.z = THREE.MathUtils.damp(currentLookTarget.current.z, lookTargetZ, 22, delta);
      }

      camera.lookAt(currentLookTarget.current.x, currentLookTarget.current.y, currentLookTarget.current.z);
    }
  });

  return null;
};
