'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
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

  // Fetch live layout and products from backend on mount and poll only if offline
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
            const currentProds = useMartStore.getState().products;
            // Only update store if products changed or wasn't set, avoiding heavy Three.js re-renders!
            if (currentProds.length !== productsData.length || currentProds[0]?.id !== productsData[0]?.id) {
              setProducts(productsData);
            }
          }
        }
      } catch {
        // Keep existing loaded state on transient network blip
      } finally {
        isFetching = false;
      }
    }
    loadData();

    // Check backend connection:
    // If products are loaded, keep polling dormant (zero lag & zero FPS drops).
    // If products are empty (backend was offline), poll every 3s until loaded.
    const timer = setInterval(() => {
      const hasProducts = useMartStore.getState().products.length > 0;
      if (!hasProducts) {
        loadData();
      }
    }, 3000);

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
        dpr={1}
        camera={{ position: [0, 4, -24], fov: 60, near: 0.1, far: 140 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          precision: 'mediump',
        }}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 40, 75]} />

        {/* --- High-Efficiency Commercial Retail Global Illumination (Silky 60+ FPS on all devices) --- */}
        <ambientLight intensity={1.3} />
        <hemisphereLight args={['#ffffff', '#64748b', 0.95]} />

        {/* Primary Crisp Ceiling Retail Light (Zero shadow map overhead) */}
        <directionalLight position={[12, 24, 8]} intensity={1.1} />
        {/* Fill Retail Illumination */}
        <directionalLight position={[-12, 20, -8]} intensity={0.65} />

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
