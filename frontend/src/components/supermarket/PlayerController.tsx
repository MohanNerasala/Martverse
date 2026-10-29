'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMartStore } from '@/store/useMartStore';
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

  const playerPos = useMartStore((state) => state.playerPos);
  const activeFloor = useMartStore((state) => state.activeFloor);
  const cameraMode = useMartStore((state) => state.cameraMode);
  const products = useMartStore((state) => state.products);
  const setPlayerPos = useMartStore((state) => state.setPlayerPos);
  const setActiveFloor = useMartStore((state) => state.setActiveFloor);
  const setProximity = useMartStore((state) => state.setProximity);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setCameraMode = useMartStore((state) => state.setCameraMode);
  const openUnpaidExitAlert = useMartStore((state) => state.openUnpaidExitAlert);
  const showToast = useMartStore((state) => state.showToast);

  const startCheckout = useBillingStore((state) => state.startCheckout);
  const cartItems = useCartStore((state) => state.items);
  const isPaid = useCartStore((state) => state.isPaid);

  // Motion physics refs
  const posRef = useRef(new THREE.Vector3(...playerPos));
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });

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

      yawRef.current -= dx * 0.0035;
      pitchRef.current = Math.max(-0.6, Math.min(0.6, pitchRef.current - dy * 0.003));
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

    // Check Billing Counter (around z = 17, x between -4 and 4)
    if (Math.abs(pz - 17) < 3.2 && Math.abs(px) < 4.5) {
      if (cartItems.length > 0) {
        setCameraMode('billing');
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

  useFrame((_, delta) => {
    const isAutoNavigatingToExit = useMartStore.getState().isAutoNavigatingToExit;
    const finishExitAnimation = useMartStore.getState().finishExitAnimation;

    if (isAutoNavigatingToExit) {
      // Smoothly guide customer and trolley through the main supermarket aisle towards exit gate at x = 0, z = -22.5
      posRef.current.x = THREE.MathUtils.damp(posRef.current.x, 0, 4, delta);
      posRef.current.z = THREE.MathUtils.damp(posRef.current.z, -22.5, 3.5, delta);
      posRef.current.y = THREE.MathUtils.damp(posRef.current.y, 1.5, 6, delta);
      yawRef.current = THREE.MathUtils.damp(yawRef.current, Math.PI, 6, delta);

      // Once reached the exit sensor gate
      if (posRef.current.z <= -21.6) {
        finishExitAnimation();
      }
    } else {
      const speed = 7.5; // m/s walking speed
      const moveVector = new THREE.Vector3();

      if (keys.current.forward) moveVector.z += 1;
      if (keys.current.backward) moveVector.z -= 1;
      if (keys.current.left) moveVector.x += 1;
      if (keys.current.right) moveVector.x -= 1;

      // Obstacle & Shelf Collision Checker
      const checkObstacle = (testPx: number, testPz: number, floor: number): boolean => {
        // Outer store walls (width 36, length 52)
        if (testPx < -17.2 || testPx > 17.2 || testPz < -24.2 || testPz > 24.2) return true;

        // Escalator shaft walkway (allow passing through escalator entrance and ramp)
        if (Math.abs(testPx - 14.7) < 1.6 && testPz > -8.0 && testPz < 6.5) {
          return false;
        }

        // Shelf Rows AABB Collision
        const aisleXs =
          floor === 1
            ? [-10, -5, 0, 5, 10]
            : [-11.0, -6.5, -2.0, 2.5, 7.0, 11.5];

        for (const ax of aisleXs) {
          // Half-width rack (0.85m) + player radius (0.35m) = 1.2m
          if (Math.abs(testPx - ax) < 1.15 && testPz >= -12.3 && testPz <= 12.3) {
            return true;
          }
        }

        // Floor 1 Billing Counter obstacles (avoid walking into the POS tables)
        if (floor === 1) {
          for (const cx of [-3, 0, 3]) {
            if (Math.abs(testPx - cx) < 0.65 && Math.abs(testPz - 17.0) < 1.25) {
              return true;
            }
          }

          // Exit Turnstile barrier (locked shut if cart is unpaid)
          if (cartItems.length > 0 && !isPaid && testPz < -21.8 && Math.abs(testPx) < 2.2) {
            return true;
          }
        }

        return false;
      };

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize();
        // Apply yaw rotation to move direction
        const sin = Math.sin(yawRef.current);
        const cos = Math.cos(yawRef.current);
        const worldDX = (moveVector.x * cos + moveVector.z * sin) * speed * delta;
        const worldDZ = (-moveVector.x * sin + moveVector.z * cos) * speed * delta;

        const currentFloor = posRef.current.y > 4.5 ? 2 : 1;

        // Axis-independent collision sliding (allows sliding along shelf faces smoothly)
        const newX = posRef.current.x + worldDX;
        if (!checkObstacle(newX, posRef.current.z, currentFloor)) {
          posRef.current.x = newX;
        }

        const newZ = posRef.current.z + worldDZ;
        if (!checkObstacle(posRef.current.x, newZ, currentFloor)) {
          posRef.current.z = newZ;
        }
      }

      // Store outer boundaries safety clamp
      posRef.current.x = Math.max(-17.0, Math.min(17.0, posRef.current.x));
      posRef.current.z = Math.max(-23.8, Math.min(23.8, posRef.current.z));
    }

    // Escalator Transition logic (at x = 14.7, z between -7.5 and 6.0)
    const nearEscalator =
      Math.abs(posRef.current.x - 14.7) < 1.6 &&
      posRef.current.z > -7.5 &&
      posRef.current.z < 6.0;

    if (nearEscalator) {
      // Ramp y smoothly between 1.5 (Floor 1) and 6.5 (Floor 2)
      const t = Math.max(0, Math.min(1, (posRef.current.z - (-7.5)) / 13.5)); // 0 at bottom, 1 at top
      const desiredY = 1.5 + t * 5.0;
      posRef.current.y = THREE.MathUtils.damp(posRef.current.y, desiredY, 5, delta);

      if (posRef.current.y > 4.5 && activeFloor !== 2) {
        setActiveFloor(2);
      } else if (posRef.current.y <= 4.5 && activeFloor !== 1) {
        setActiveFloor(1);
      }
    } else {
      // Fixed floor height
      const targetFloorY = activeFloor === 2 ? 6.5 : 1.5;
      posRef.current.y = THREE.MathUtils.damp(posRef.current.y, targetFloorY, 6, delta);
    }

    // Update global store
    setPlayerPos([posRef.current.x, posRef.current.y, posRef.current.z], yawRef.current);

    // Proximity checks for HUD prompt
    const px = posRef.current.x;
    const pz = posRef.current.z;

    const nearBilling = Math.abs(pz - 17) < 3.2 && Math.abs(px) < 4.5;
    const nearExit = Math.abs(pz - (-22)) < 3.5 && Math.abs(px) < 3.5;

    let prompt: string | null = null;
    let targetPos: [number, number, number] | null = null;

    if (nearBilling) {
      prompt = cartItems.length > 0 ? 'Press [E] to Scan Items at POS Counter' : 'Trolley is empty. Add items to checkout!';
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

    setProximity(nearBilling, nearExit, prompt, targetPos);

    // Camera positioning based on cameraMode
    if (cameraMode === 'billing') {
      // Fixed POS counter cinematic view
      camera.position.set(0, 2.4, 15.2);
      camera.lookAt(0, 1.2, 18.0);
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
      // Third Person (Over the shoulder with trolley in front)
      const camDist = 3.8;
      const camHeight = 2.4;
      const camX = posRef.current.x - Math.sin(yawRef.current) * camDist;
      const camY = posRef.current.y + camHeight;
      const camZ = posRef.current.z - Math.cos(yawRef.current) * camDist;

      camera.position.set(camX, camY, camZ);
      const lookTargetY = posRef.current.y + 0.4 + Math.sin(pitchRef.current) * 3;
      camera.lookAt(posRef.current.x, lookTargetY, posRef.current.z);
    }
  });

  return null;
};
