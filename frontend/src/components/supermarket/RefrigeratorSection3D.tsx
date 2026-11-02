'use client';

import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useMartStore } from '@/store/useMartStore';
import { Product } from '@/types';
import { REFRIGERATOR_PRODUCTS } from '@/lib/refrigeratorData';

// Pre-allocated shared geometries for commercial refrigeration units
const sharedFridgeGeos = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  cylBottle: new THREE.CylinderGeometry(0.045, 0.048, 0.22, 14),
  cylCap: new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10),
  cylCan: new THREE.CylinderGeometry(0.038, 0.038, 0.14, 14),
  cylTub: new THREE.CylinderGeometry(0.065, 0.052, 0.09, 14),
  boxPack: new THREE.BoxGeometry(0.12, 0.18, 0.08),
  boxFlat: new THREE.BoxGeometry(0.14, 0.04, 0.11),
};

// Static shared materials to prevent shader recompilations
const sharedFridgeMats = {
  cabinetOuter: new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.85, roughness: 0.25 }),
  cabinetInner: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.2, roughness: 0.2 }),
  kickplate: new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8, roughness: 0.4 }),
  grillSlat: new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.8 }),
  glassDoor: new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    transparent: true,
    opacity: 0.24,
    roughness: 0.05,
    metalness: 0.1,
  }),
  doorFrame: new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.2 }),
  handleChrome: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.1 }),
  gasketBlack: new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.9 }),
  ledDaylight: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: new THREE.Color('#e0f2fe'),
    emissiveIntensity: 0.95,
    roughness: 0.1,
  }),
  canopyDairy: new THREE.MeshStandardMaterial({ color: '#0369a1', metalness: 0.3, roughness: 0.2 }),
  canopyBev: new THREE.MeshStandardMaterial({ color: '#047857', metalness: 0.3, roughness: 0.2 }),
  canopyFrozen: new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.3, roughness: 0.2 }),
  priceTagRail: new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3 }),
  wireGrid: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 }),
  whiteCap: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
  whiteLabel: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
};

const fridgeItemMatCache = new Map<string, THREE.MeshStandardMaterial>();
function getFridgeItemMaterial(color: string, isCan: boolean): THREE.MeshStandardMaterial {
  const key = `${color}_${isCan}`;
  let mat = fridgeItemMatCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: isCan ? 0.25 : 0.4,
      metalness: isCan ? 0.8 : 0.1,
    });
    fridgeItemMatCache.set(key, mat);
  }
  return mat;
}

// Reusable single product item renderer inside refrigerator
const FridgeProductItem: React.FC<{
  product: Product;
  position: [number, number, number];
}> = React.memo(({ product, position }) => {
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const [hovered, setHovered] = useState(false);

  const modelType = product.placement?.modelType || 'bottle';
  const color = product.placement?.color || '#3b82f6';
  const itemMat = getFridgeItemMaterial(color, modelType === 'can');
  const capMat = sharedFridgeMats.whiteCap;
  const labelMat = sharedFridgeMats.whiteLabel;

  return (
    <group
      position={position}
      scale={hovered ? [1.12, 1.12, 1.12] : [1, 1, 1]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        setHoveredProduct(product);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'default';
        setHoveredProduct(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        openProductModal(product);
      }}
    >
      {/* Primary Front Product Facing (Oriented towards +X aisle walkway) */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {modelType === 'bottle' ? (
          <group position={[0, 0.11, 0]}>
            {/* Bottle Body */}
            <mesh geometry={sharedFridgeGeos.cylBottle} material={itemMat} />
            {/* White Bottle Cap */}
            <mesh position={[0, 0.12, 0]} geometry={sharedFridgeGeos.cylCap} material={capMat} />
            {/* Front Label Strip */}
            <mesh position={[0, 0, 0.046]} geometry={sharedFridgeGeos.box} scale={[0.07, 0.12, 0.005]} material={labelMat} />
          </group>
        ) : modelType === 'can' ? (
          <group position={[0, 0.07, 0]}>
            {/* Metallic Beverage / Dairy Can or Yogurt Tub */}
            <mesh geometry={sharedFridgeGeos.cylCan} material={itemMat} />
            {/* Silver Rim */}
            <mesh position={[0, 0.072, 0]} geometry={sharedFridgeGeos.cylCap} scale={[2.1, 0.4, 2.1]} material={sharedFridgeMats.handleChrome} />
            <mesh position={[0, 0, 0.04]} geometry={sharedFridgeGeos.box} scale={[0.06, 0.09, 0.005]} material={labelMat} />
          </group>
        ) : modelType === 'bag' ? (
          <group position={[0, 0.09, 0]}>
            {/* Frozen / Dairy Pouch */}
            <mesh geometry={sharedFridgeGeos.boxPack} scale={[1, 0.9, 0.8]} material={itemMat} />
            {/* Top Seal Seam */}
            <mesh position={[0, 0.09, 0]} geometry={sharedFridgeGeos.box} scale={[0.13, 0.015, 0.02]} material={capMat} />
          </group>
        ) : (
          <group position={[0, 0.04, 0]}>
            {/* Butter / Cheese Carton Box */}
            <mesh geometry={sharedFridgeGeos.boxFlat} material={itemMat} />
            <mesh position={[0, 0.022, 0]} geometry={sharedFridgeGeos.box} scale={[0.12, 0.002, 0.09]} material={labelMat} />
          </group>
        )}
      </group>

      {/* Realistic Depth Facing (Second row behind front row along -X) */}
      <group position={[-0.16, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {modelType === 'bottle' ? (
          <mesh position={[0, 0.11, 0]} geometry={sharedFridgeGeos.cylBottle} material={itemMat} />
        ) : modelType === 'can' ? (
          <mesh position={[0, 0.07, 0]} geometry={sharedFridgeGeos.cylCan} material={itemMat} />
        ) : modelType === 'bag' ? (
          <mesh position={[0, 0.09, 0]} geometry={sharedFridgeGeos.boxPack} scale={[1, 0.9, 0.8]} material={itemMat} />
        ) : (
          <mesh position={[0, 0.04, 0]} geometry={sharedFridgeGeos.boxFlat} material={itemMat} />
        )}
      </group>

      {/* D-Mart style promotional yellow price tag below product on the shelf rail */}
      <group position={[0.10, -0.04, 0]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
        <mesh geometry={sharedFridgeGeos.box} scale={[0.22, 0.042, 0.01]} material={sharedFridgeMats.priceTagRail} />
        <Text
          position={[0, 0, 0.008]}
          fontSize={0.024}
          color="#09090b"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`₹${product.price} | MRP ₹${product.mrp}`}
        </Text>
      </group>
    </group>
  );
});
FridgeProductItem.displayName = 'FridgeProductItem';

// Single commercial multi-door refrigerator unit
interface RefrigeratorCabinetProps {
  sectionTitle: string;
  categoryTag: string;
  tempReading: string;
  canopyMaterial: THREE.MeshStandardMaterial;
  centerX: number;
  centerZ: number;
  length: number;
  products: Product[];
}

const RefrigeratorCabinet: React.FC<RefrigeratorCabinetProps> = React.memo(({
  sectionTitle,
  categoryTag,
  tempReading,
  canopyMaterial,
  centerX,
  centerZ,
  length,
  products,
}) => {
  const height = 3.2;
  const depth = 1.05;

  // Door count along the unit length (4 large glass doors per 6.4m unit)
  const doorCount = 4;
  const doorWidth = length / doorCount;

  // Shelf tier heights from floor
  const shelfHeights = [0.65, 1.35, 2.05, 2.65];

  return (
    <group position={[centerX, 0, centerZ]}>
      {/* --- Heavy-Duty Commercial Steel Frame & Cabinet --- */}
      {/* Back Wall (Facing outer store wall at -X) */}
      <mesh position={[-depth / 2, height / 2, 0]} geometry={sharedFridgeGeos.box} scale={[0.08, height, length]} material={sharedFridgeMats.cabinetOuter} />
      {/* North Endwall */}
      <mesh position={[0, height / 2, -length / 2]} geometry={sharedFridgeGeos.box} scale={[depth, height, 0.08]} material={sharedFridgeMats.cabinetOuter} />
      {/* South Endwall */}
      <mesh position={[0, height / 2, length / 2]} geometry={sharedFridgeGeos.box} scale={[depth, height, 0.08]} material={sharedFridgeMats.cabinetOuter} />
      {/* Top Roof Cap */}
      <mesh position={[0, height + 0.04, 0]} geometry={sharedFridgeGeos.box} scale={[depth + 0.08, 0.08, length + 0.08]} material={sharedFridgeMats.cabinetOuter} />
      {/* Interior White Enamel Backing */}
      <mesh position={[-depth / 2 + 0.05, height / 2, 0]} geometry={sharedFridgeGeos.box} scale={[0.02, height - 0.2, length - 0.1]} material={sharedFridgeMats.cabinetInner} />

      {/* --- Bottom Kickplate & Condenser Air Ventilation Louvers --- */}
      <group position={[depth / 2 - 0.02, 0.22, 0]}>
        {/* Dark Kickplate Base Plate */}
        <mesh geometry={sharedFridgeGeos.box} scale={[0.04, 0.44, length]} material={sharedFridgeMats.kickplate} />
        {/* Horizontal Ventilation Louver Slats */}
        {[-0.12, -0.04, 0.04, 0.12].map((yOff, idx) => (
          <mesh key={`slat-${idx}`} position={[0.022, yOff, 0]} geometry={sharedFridgeGeos.box} scale={[0.01, 0.018, length * 0.92]} material={sharedFridgeMats.grillSlat} />
        ))}
      </group>

      {/* --- Top Illuminated Commercial Canopy Lightbox --- */}
      <group position={[depth / 2, height - 0.26, 0]}>
        {/* Canopy Backbox */}
        <mesh geometry={sharedFridgeGeos.box} scale={[0.12, 0.48, length]} material={canopyMaterial} />
        {/* Emissive Under-Canopy Glow Bar */}
        <mesh position={[0, -0.24, 0]} geometry={sharedFridgeGeos.box} scale={[0.08, 0.02, length * 0.98]} material={sharedFridgeMats.ledDaylight} />
        {/* Main Section Header Text (Facing aisle walkway +X) */}
        <Text
          position={[0.07, 0.06, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="extrabold"
        >
          {sectionTitle}
        </Text>
        {/* Subtitle / Category Tag & Temperature Display */}
        <Text
          position={[0.07, -0.12, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.12}
          color="#bae6fd"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`${categoryTag}  •  ${tempReading}`}
        </Text>
      </group>

      {/* --- Internal Cantilever Wire Shelves & Under-Shelf LED Strips --- */}
      {shelfHeights.map((sH, sIdx) => (
        <group key={`fridge-shelf-${sIdx}`} position={[0, sH, 0]}>
          {/* Wire Shelf Grid Base */}
          <mesh geometry={sharedFridgeGeos.box} scale={[depth - 0.18, 0.02, length - 0.12]} material={sharedFridgeMats.wireGrid} />
          {/* Under-Shelf Linear LED Strip */}
          <mesh position={[depth / 2 - 0.14, -0.015, 0]} geometry={sharedFridgeGeos.box} scale={[0.04, 0.012, length - 0.16]} material={sharedFridgeMats.ledDaylight} />
          {/* Front Yellow/Red Price Strip Channel */}
          <mesh position={[depth / 2 - 0.1, 0.01, 0]} geometry={sharedFridgeGeos.box} scale={[0.01, 0.035, length - 0.12]} material={sharedFridgeMats.priceTagRail} />
        </group>
      ))}

      {/* --- Clear Glass Reach-in Doors & Aluminum Pull Handles --- */}
      {Array.from({ length: doorCount }).map((_, dIdx) => {
        const doorZ = -length / 2 + (dIdx + 0.5) * doorWidth;
        const doorH = height - 0.82;
        const doorY = 0.44 + doorH / 2;

        return (
          <group key={`door-${dIdx}`} position={[depth / 2 - 0.02, doorY, doorZ]}>
            {/* Magnetic Black Perimeter Gasket Frame */}
            <mesh geometry={sharedFridgeGeos.box} scale={[0.03, doorH - 0.02, doorWidth - 0.02]} material={sharedFridgeMats.gasketBlack} />
            {/* Aluminum Outer Door Rim */}
            <mesh position={[0.005, 0, 0]} geometry={sharedFridgeGeos.box} scale={[0.02, doorH - 0.04, doorWidth - 0.04]} material={sharedFridgeMats.doorFrame} />
            {/* Crystal-Clear Double Pane Glass Panel */}
            <mesh position={[0.008, 0, 0]} geometry={sharedFridgeGeos.box} scale={[0.012, doorH - 0.12, doorWidth - 0.12]} material={sharedFridgeMats.glassDoor} raycast={() => null} />
            {/* Full-Height Vertical Chrome Pull Handle */}
            <group position={[0.04, 0, doorWidth / 2 - 0.12]}>
              <mesh geometry={sharedFridgeGeos.cyl} scale={[0.018, 0.95, 0.018]} material={sharedFridgeMats.handleChrome} raycast={() => null} />
              {/* Handle Mount Brackets */}
              <mesh position={[0, 0.42, -0.02]} geometry={sharedFridgeGeos.box} scale={[0.03, 0.02, 0.04]} material={sharedFridgeMats.handleChrome} raycast={() => null} />
              <mesh position={[0, -0.42, -0.02]} geometry={sharedFridgeGeos.box} scale={[0.03, 0.02, 0.04]} material={sharedFridgeMats.handleChrome} raycast={() => null} />
            </group>
          </group>
        );
      })}

      {/* --- Display Products Neatly Arranged on the Shelves --- */}
      <group position={[0, 0, 0]}>
        {products.map((p, idx) => {
          // Arrange across 2 primary middle tiers (1.35 and 0.65) and 4 doors
          const tierIdx = idx < 4 ? 1 : 0;
          const colIdx = idx % 4;
          const posX = depth / 2 - 0.28;
          const posY = shelfHeights[tierIdx] + 0.02;
          const posZ = -length / 2 + (colIdx + 0.5) * (length / 4);

          return (
            <FridgeProductItem
              key={p.id}
              product={p}
              position={[posX, posY, posZ]}
            />
          );
        })}
      </group>
    </group>
  );
});
RefrigeratorCabinet.displayName = 'RefrigeratorCabinet';

export const RefrigeratorSection3D: React.FC = () => {
  const activeFloor = useMartStore((state) => state.activeFloor);

  // Group products by refrigerator section
  const dairyProducts = useMemo(() => {
    return REFRIGERATOR_PRODUCTS.filter((p) => p.placement?.aisleId === 'refrig-dairy');
  }, []);

  const beverageProducts = useMemo(() => {
    return REFRIGERATOR_PRODUCTS.filter((p) => p.placement?.aisleId === 'refrig-bev');
  }, []);

  const frozenProducts = useMemo(() => {
    return REFRIGERATOR_PRODUCTS.filter((p) => p.placement?.aisleId === 'refrig-froz');
  }, []);

  // Commercial chillers are on Ground Floor (Floor 1) along Right Wall (X = 34.6, facing inward)
  if (activeFloor !== 1) return null;

  return (
    <group position={[34.6, 0, 0]} rotation={[0, Math.PI, 0]}>
      {/* SECTION 1: DAIRY & FRESH MILK (World Z = 10 when rotated) */}
      <RefrigeratorCabinet
        sectionTitle="DAIRY, MILK & FRESH CHEESE"
        categoryTag="100% PURE FARM FRESH DAIRY"
        tempReading="CHILLED 3.2°C"
        canopyMaterial={sharedFridgeMats.canopyDairy}
        centerX={0}
        centerZ={-10.0}
        length={6.4}
        products={dairyProducts}
      />

      {/* SECTION 2: CHILLED BEVERAGES & COLD DRINKS (World Z = 0) */}
      <RefrigeratorCabinet
        sectionTitle="CHILLED BEVERAGES & SOFT DRINKS"
        categoryTag="COLD SODAS, JUICES & ENERGY DRINKS"
        tempReading="CHILLED 2.4°C"
        canopyMaterial={sharedFridgeMats.canopyBev}
        centerX={0}
        centerZ={0}
        length={6.4}
        products={beverageProducts}
      />

      {/* SECTION 3: FROZEN FOODS & ICE CREAM (World Z = -10 when rotated) */}
      <RefrigeratorCabinet
        sectionTitle="FROZEN FOODS & ICE CREAM"
        categoryTag="DEEP FREEZE DESSERTS & READY-TO-COOK"
        tempReading="DEEP FREEZE -18.5°C"
        canopyMaterial={sharedFridgeMats.canopyFrozen}
        centerX={0}
        centerZ={10.0}
        length={6.4}
        products={frozenProducts}
      />
    </group>
  );
};
