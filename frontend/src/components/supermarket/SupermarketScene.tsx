'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StoreArchitecture } from './StoreArchitecture';
import { ShelfUnit } from './ShelfUnit';
import { BillingCounter3D } from './BillingCounter3D';
import { ExitGate3D } from './ExitGate3D';
import { TrolleyModel } from './TrolleyModel';
import { FlyingProductArc } from './FlyingProductArc';
import { PlayerController } from './PlayerController';
import { RefrigeratorSection3D } from './RefrigeratorSection3D';
import { useMartStore } from '@/store/useMartStore';
import { api } from '@/lib/api';

// Real-Time Scene Performance Monitor (Zero-overhead telemetry)
const ScenePerformanceMonitor: React.FC = () => {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);

  useFrame(() => {
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
          drawCalls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
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
  const firstFloor = floors.find((f) => f.floorNumber === 2);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        frameloop={isPaused ? 'never' : 'always'}
        dpr={[1, 1.25]}
        camera={{ position: [0, 4, -28], fov: 60, near: 0.15, far: 95 }}
        raycaster={{ near: 0.2, far: 25 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <color attach="background" args={['#e2e8f0']} />
        <fog attach="fog" args={['#e2e8f0', 55, 95]} />

        {/* --- Commercial Retail Lighting: Rich Contrast, Lustrous Metallic Sheen & Crisp Packaging --- */}
        <ambientLight intensity={1.1} />
        <hemisphereLight args={['#ffffff', '#94a3b8', 0.85]} />

        {/* Primary Crisp Ceiling Retail Light with Specular Sheen */}
        <directionalLight position={[10, 26, 8]} intensity={1.3} />
        {/* Soft Cool-Tint Aisle Fill */}
        <directionalLight position={[-10, 20, -8]} intensity={0.7} />
        {/* Central Aisle Ambiance */}
        <directionalLight position={[0, 18, 0]} intensity={0.35} />

        <Suspense fallback={null}>
          <ScenePerformanceMonitor />
          {/* Store Shell */}
          <StoreArchitecture />

          {/* Commercial Refrigerated Reach-in Display Sections on Ground Floor Right Wall */}
          {activeFloor === 1 && <RefrigeratorSection3D />}

          {/* Ground Floor Aisles (Aisles 1 - 10) - Active Floor Culling */}
          {activeFloor === 1 && groundFloor?.aisles.map((aisle) => (
            <ShelfUnit
              key={aisle.id}
              aisle={aisle}
              products={products}
              floorYOffset={0}
            />
          ))}

          {/* First Floor Aisles (Future Upper Level expansion) */}
          {activeFloor === 2 && firstFloor?.aisles.map((aisle) => (
            <ShelfUnit
              key={aisle.id}
              aisle={aisle}
              products={products}
              floorYOffset={5.0}
            />
          ))}

          {/* Billing Counters Zone on Ground Floor near z = 22 */}
          <BillingCounter3D position={[0, 0, 22]} />

          {/* Exit Gate on Ground Floor near z = -31 */}
          <ExitGate3D position={[0, 0, -31]} />

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
