'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { StoreArchitecture } from './StoreArchitecture';
import { ShelfUnit } from './ShelfUnit';
import { BillingCounter3D } from './BillingCounter3D';
import { ExitGate3D } from './ExitGate3D';
import { TrolleyModel } from './TrolleyModel';
import { FlyingProductArc } from './FlyingProductArc';
import { PlayerController } from './PlayerController';
import { useMartStore } from '@/store/useMartStore';
import { api } from '@/lib/api';

export const SupermarketScene: React.FC = () => {
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
          } else {
            // Backend offline: empty shelves
            setProducts([]);
          }
        }
      } catch {
        if (!isCancelled) {
          setProducts([]);
        }
      } finally {
        isFetching = false;
      }
    }

    loadData();

    // Resilient backend monitoring:
    // - If shelves are empty, retry loading live products every 4s
    // - If shelves are populated, perform ultra-fast <1ms /api/health probes without DB load
    const timer = setInterval(async () => {
      if (isCancelled) return;
      const currentProds = useMartStore.getState().products;
      if (currentProds.length === 0) {
        loadData();
      } else {
        const isHealthy = await api.checkBackendHealth();
        if (!isHealthy && !isCancelled) {
          // Double-check with a 2nd probe to prevent momentary WAN jitter from clearing shelves
          const retryHealthy = await api.checkBackendHealth();
          if (!retryHealthy && !isCancelled) {
            setProducts([]);
          }
        }
      }
    }, 6000);

    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [setFloors, setProducts]);

  const groundFloor = floors.find((f) => f.floorNumber === 1);
  const firstFloor = floors.find((f) => f.floorNumber === 2);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 4, -24], fov: 60, near: 0.1, far: 140 }}
        raycaster={{ near: 0.1, far: 45 }}
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
        <color attach="background" args={['#0a0f1d']} />
        <fog attach="fog" args={['#0a0f1d', 55, 135]} />

        {/* --- Commercial Retail Lighting: Rich Contrast, Lustrous Metallic Sheen & Crisp Packaging --- */}
        <ambientLight intensity={1.05} />
        <hemisphereLight args={['#ffffff', '#475569', 0.85]} />

        {/* Primary Crisp Ceiling Retail Light with Specular Sheen */}
        <directionalLight position={[10, 26, 8]} intensity={1.3} />
        {/* Soft Cool-Tint Aisle Fill */}
        <directionalLight position={[-10, 20, -8]} intensity={0.7} />
        {/* Central Aisle Ambiance */}
        <directionalLight position={[0, 18, 0]} intensity={0.35} />

        <Suspense fallback={null}>
          {/* Store Shell */}
          <StoreArchitecture />

          {/* Ground Floor Aisles (Aisles 1 - 5) - Active Floor Culling */}
          {activeFloor === 1 && groundFloor?.aisles.map((aisle) => (
            <ShelfUnit
              key={aisle.id}
              aisle={aisle}
              products={products}
              floorYOffset={0}
            />
          ))}

          {/* First Floor Aisles (Aisles 6 - 10) - Active Floor Culling */}
          {activeFloor === 2 && firstFloor?.aisles.map((aisle) => (
            <ShelfUnit
              key={aisle.id}
              aisle={aisle}
              products={products}
              floorYOffset={5.0} // First floor elevated base
            />
          ))}

          {/* Billing Counters Zone on Ground Floor near z = 18 */}
          <BillingCounter3D position={[0, 0, 18]} />

          {/* Exit Gate on Ground Floor near z = -23 */}
          <ExitGate3D position={[0, 0, -23]} />

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
