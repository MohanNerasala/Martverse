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
  const playerPos = useMartStore((state) => state.playerPos);
  const playerYaw = useMartStore((state) => state.playerYaw);
  const setFloors = useMartStore((state) => state.setFloors);
  const setProducts = useMartStore((state) => state.setProducts);

  // Fetch live layout and products from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [floorsData, productsData] = await Promise.all([
          api.getFloors(),
          api.getProducts(),
        ]);
        if (floorsData && floorsData.length > 0) setFloors(floorsData);
        if (productsData && productsData.length > 0) setProducts(productsData);
      } catch {
        // Fallback silently
      }
    }
    loadData();
  }, [setFloors, setProducts]);

  const groundFloor = floors.find((f) => f.floorNumber === 1);
  const firstFloor = floors.find((f) => f.floorNumber === 2);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows="percentage"
        camera={{ position: [0, 4, -24], fov: 65, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 35, 65]} />

        {/* --- Global Illumination --- */}
        <ambientLight intensity={0.8} />
        <hemisphereLight args={['#ffffff', '#334155', 0.6]} />

        {/* Main Sun Spotlight for soft depth shadows */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={60}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
        />

        {/* Ground Floor Fluorescent Point Lights */}
        <pointLight position={[-10, 4.2, 0]} intensity={1.2} distance={18} decay={2} color="#ffffff" />
        <pointLight position={[0, 4.2, 0]} intensity={1.2} distance={18} decay={2} color="#ffffff" />
        <pointLight position={[10, 4.2, 0]} intensity={1.2} distance={18} decay={2} color="#ffffff" />

        {/* First Floor Lighting */}
        <pointLight position={[-8, 9.2, 0]} intensity={1.5} distance={20} decay={2} color="#fef08a" />
        <pointLight position={[8, 9.2, 0]} intensity={1.5} distance={20} decay={2} color="#fef08a" />

        <Suspense fallback={null}>
          {/* Store Shell */}
          <StoreArchitecture activeFloor={activeFloor} />

          {/* Ground Floor Aisles (Aisles 1 - 5) */}
          {groundFloor?.aisles.map((aisle) => (
            <ShelfUnit
              key={aisle.id}
              aisle={aisle}
              products={products}
              floorYOffset={0}
            />
          ))}

          {/* First Floor Aisles (Aisles 6 - 10) */}
          {firstFloor?.aisles.map((aisle) => (
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

          {/* Interactive Player Trolley */}
          <TrolleyModel targetPos={playerPos} targetYaw={playerYaw} />

          {/* 3D Flying Item Parabolic Arc */}
          <FlyingProductArc trolleyPos={playerPos} />

          {/* Player Navigation & Camera Controller */}
          <PlayerController />
        </Suspense>
      </Canvas>
    </div>
  );
};
