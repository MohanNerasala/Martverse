'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { StoreArchitecture } from './StoreArchitecture';
import { ShelfUnit } from './ShelfUnit';
import { BillingCounter3D } from './BillingCounter3D';
import { TrolleyModel } from './TrolleyModel';
import { FlyingProductArc } from './FlyingProductArc';
import { PlayerController } from './PlayerController';
import { RefrigeratorSection3D } from './RefrigeratorSection3D';
import { WallShelves } from './WallShelves';
import { PromotionalIslands } from './PromotionalIslands';
import { WetFloorSign } from './WetFloorSign';
import { AmbientStoreLife } from './AmbientStoreLife';
import { useMartStore } from '@/store/useMartStore';
import { prewarmAllProductTextures } from '@/lib/productTextureAtlas';
import { api } from '@/lib/api';

// Real-Time Scene Performance Monitor (Zero-overhead telemetry)
const ScenePerformanceMonitor: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const lastCalls = useRef(0);
  const lastTriangles = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__threeScene = scene;
      (window as any).__threeRenderer = gl;
      // Phase 3: Pre-warm all product textures and pre-compile all scene shaders
      prewarmAllProductTextures(gl);
      if ('compileAsync' in gl) {
        (gl as any).compileAsync(scene, camera).catch(() => {});
      }
    }
  }, [scene, gl, camera]);

  useFrame(() => {
    // Capture render calls before autoReset
    if (gl.info.render.calls > 0) {
      lastCalls.current = gl.info.render.calls;
      lastTriangles.current = gl.info.render.triangles;
    }

    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    if (elapsed >= 1000) {
      const currentFps = Math.round((frameCount.current * 1000) / elapsed);
      fpsHistory.current.push(currentFps);
      if (fpsHistory.current.length > 30) fpsHistory.current.shift();

      const avgFps = Math.round(fpsHistory.current.reduce((a: number, b: number) => a + b, 0) / fpsHistory.current.length);
      const minFps = Math.min(...fpsHistory.current);
      const maxFps = Math.max(...fpsHistory.current);

      if (typeof window !== 'undefined') {
        (window as any).__martverseStats = {
          fps: currentFps,
          avgFps,
          minFps,
          maxFps,
          drawCalls: lastCalls.current || gl.info.render.calls,
          triangles: lastTriangles.current || gl.info.render.triangles,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          timestamp: Date.now(),
        };
      }

      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
};

// Pre-filtered Indoor Environment for Chrome & Floor Specular Reflections
const SceneEnvironmentController: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;

    return () => {
      scene.environment = null;
      envTexture.dispose();
      roomEnv.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
};

export const SupermarketScene: React.FC<{ isPaused?: boolean }> = ({ isPaused = false }) => {
  const floors = useMartStore((state) => state.floors);
  const products = useMartStore((state) => state.products);
  const activeFloor = useMartStore((state) => state.activeFloor);
  const setFloors = useMartStore((state) => state.setFloors);
  const setProducts = useMartStore((state) => state.setProducts);

  // Fetch live layout and products from backend on mount and maintain connection
  useEffect(() => {
    let isCancelled = false;
    let isFetching = false;

    async function loadData() {
      if (isFetching) return;
      isFetching = true;
      try {
        const [floorsData, productsData] = await Promise.all([
          api.getFloors(),
          api.getProducts(),
        ]);
        if (!isCancelled) {
          if (floorsData && floorsData.length > 0) setFloors(floorsData);
          if (productsData && productsData.length > 0) {
            setProducts(productsData);
          }
        }
      } catch {
        // Keep existing products intact on network blip
      } finally {
        isFetching = false;
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [setFloors, setProducts]);

  const groundFloor = floors.find((f) => f.floorNumber === 1);

  return (
    <div className="w-full h-full relative select-none touch-none" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        frameloop={isPaused ? 'never' : 'always'}
        dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 1.45, -28], fov: 60, near: 0.1, far: 200 }}
        raycaster={{ near: 0.2, far: 25 }}
        style={{ touchAction: 'none' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
        }}
      >
        {/* High-Key Bright Atmosphere (Matches Commercial Reference) */}
        <color attach="background" args={['#fafafa']} />
        <fog attach="fog" args={['#fafafa', 70, 150]} />

        {/* --- Maximum Balanced Commercial Lighting: Warm-Neutral White (4000-4500K), High Contrast & Specular Pop --- */}
        {/* 1. Balanced Hemisphere Light (Pure sky white, soft neutral floor bounce) */}
        <hemisphereLight args={['#ffffff', '#f1f5f9', 0.95]} />

        {/* 2. Primary High-Luminance Directional Key Light (North Entrance & Central Promenade) */}
        <directionalLight position={[12, 24, -12]} intensity={1.15} color="#fffdf5" />

        {/* 3. Balanced South Concourse & POS Billing Area Key Light */}
        <directionalLight position={[-12, 24, 22]} intensity={0.95} color="#fffdf5" />

        <Suspense fallback={null}>
          <SceneEnvironmentController />
          <ScenePerformanceMonitor />
          {/* Store Shell */}
          <StoreArchitecture />

          {/* Ambient Dust Motes & Realistic Atmospheric Tube Light Life */}
          <AmbientStoreLife />

          {/* Commercial Yellow A-Frame 'CAUTION: WET FLOOR' Sign in Aisle Walkway */}
          <WetFloorSign position={[-12.5, 0, -2.5]} rotationY={0.35} />

          {/* Commercial Refrigerated Reach-in Display Sections on Ground Floor Right Wall */}
          {activeFloor === 1 && <RefrigeratorSection3D />}

          {/* Left Wall Retail Shelving (Household & Personal Care) and Back Wall Bulk Pallet Racking */}
          {activeFloor === 1 && <WallShelves />}

          {/* Central Grand Promenade Feature Promotional Merchandising Islands */}
          {activeFloor === 1 && <PromotionalIslands />}

          {/* Ground Floor Double-Sided Gondola Aisles (Aisles 1 - 9) */}
          {groundFloor?.aisles.map((aisle) => (
            <ShelfUnit
              key={aisle.id}
              aisle={aisle}
              products={products}
              floorYOffset={0}
            />
          ))}

          {/* Billing Counters Zone on Ground Floor near z = 22 */}
          <BillingCounter3D position={[0, 0, 22]} />

          {/* Player Navigation & Camera Controller (Must execute first in useFrame loop to update positions) */}
          <PlayerController />

          {/* Interactive Player Trolley in front of customer (Executes in 100% sync with PlayerController) */}
          <TrolleyModel />

          {/* 3D Flying Item Parabolic Arc targeting the trolley basket */}
          <FlyingProductArc />
        </Suspense>
      </Canvas>
    </div>
  );
};
