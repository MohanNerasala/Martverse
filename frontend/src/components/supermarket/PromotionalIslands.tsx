'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useMartStore } from '@/store/useMartStore';
import { Product, ProductPlacement } from '@/types';
import {
  getProductPackagingTexture,
  getProductBodyMaterial,
  getShelfMaterial,
  sharedGeometries,
} from './ShelfUnit';

// Pre-allocated static materials for promotional display islands
const islandMaterials = {
  // Island 1: Luxury Chocolates (Cadbury Purple & Gold)
  chocPodium: new THREE.MeshStandardMaterial({ color: '#4a044e', roughness: 0.25, metalness: 0.15 }),
  goldTrim: new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.2, metalness: 0.8 }),
  chocHeader: new THREE.MeshStandardMaterial({ color: '#581c87', roughness: 0.2, metalness: 0.2 }),

  // Island 2: Artisan Tea & Coffee (Natural Oak Wood & Brass)
  woodPodium: new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.65, metalness: 0.05 }),
  brassTrim: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.25, metalness: 0.75 }),
  coffeeHeader: new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.2, metalness: 0.2 }),

  // Island 3: Festive Sweets & Dry Fruits (Emerald & Ruby Crimson)
  sweetPodium: new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.3, metalness: 0.15 }),
  rubyTrim: new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.25, metalness: 0.3 }),
  sweetHeader: new THREE.MeshStandardMaterial({ color: '#831843', roughness: 0.2, metalness: 0.2 }),

  // Common
  acrylicLip: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.1 }),
  contactShadow: new THREE.MeshBasicMaterial({ color: '#090d16', transparent: true, opacity: 0.24, depthWrite: false }),
};

// ---------------------------------------------------------------------------
// ISLAND 1: LUXURY CHOCOLATES & CONFECTIONERY SHOWCASE (x = 0, z = -15)
// ---------------------------------------------------------------------------
const ChocolatesPromotionalIsland: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const center: [number, number, number] = [0, 0, -15];

  // Filter chocolates and confectionery
  const chocProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      return (
        name.includes('silk') ||
        name.includes('dairy milk') ||
        name.includes('kitkat') ||
        name.includes('chocolate') ||
        name.includes('5 star') ||
        name.includes('celebrations') ||
        slug.includes('dairy-milk') ||
        slug.includes('kitkat') ||
        brand.includes('cadbury')
      );
    });
  }, [products]);

  // Stepped circular display: 3 tiers
  // Tier 1: radius 1.4m, height 0.40m, 12 items around perimeter
  // Tier 2: radius 0.95m, height 0.80m, 8 items around perimeter
  // Tier 3: radius 0.55m, height 1.20m, 4 items around perimeter
  const slots = useMemo(() => {
    if (chocProducts.length === 0) return [];
    const pool = chocProducts;
    const poolLen = pool.length;
    const arr: Array<{
      key: string;
      product: Product;
      x: number;
      y: number;
      z: number;
      rotY: number;
    }> = [];

    // Tier 1
    const t1Count = 12;
    for (let i = 0; i < t1Count; i++) {
      const angle = (i / t1Count) * Math.PI * 2;
      const r = 1.22;
      const x = center[0] + Math.cos(angle) * r;
      const z = center[2] + Math.sin(angle) * r;
      const y = 0.40;
      const prod = pool[i % poolLen];

      const slotPlacement: ProductPlacement = {
        id: `choc-island-t1-${i}`,
        productId: prod.id,
        productName: prod.name,
        productSlug: prod.slug,
        productPrice: prod.price,
        productMrp: prod.mrp,
        floorNumber: 1,
        aisleId: 'island-choc',
        aisleNumber: 5,
        aisleName: 'Luxury Chocolates Island',
        aisleCategory: 'Chocolates & Confectionery',
        shelfSide: 'RIGHT',
        shelfTier: 1,
        shelfPosition: i + 1,
        worldX: x,
        worldY: y,
        worldZ: z,
        rotationY: -angle - Math.PI / 2,
        color: '#4a044e',
        modelType: 'chocolate',
      };

      arr.push({
        key: `choc-t1-${i}-${prod.id}`,
        product: { ...prod, placement: slotPlacement },
        x,
        y,
        z,
        rotY: -angle - Math.PI / 2,
      });
    }

    // Tier 2
    const t2Count = 8;
    for (let i = 0; i < t2Count; i++) {
      const angle = (i / t2Count) * Math.PI * 2 + 0.2;
      const r = 0.82;
      const x = center[0] + Math.cos(angle) * r;
      const z = center[2] + Math.sin(angle) * r;
      const y = 0.80;
      const prod = pool[(i + 3) % poolLen];

      const slotPlacement: ProductPlacement = {
        id: `choc-island-t2-${i}`,
        productId: prod.id,
        productName: prod.name,
        productSlug: prod.slug,
        productPrice: prod.price,
        productMrp: prod.mrp,
        floorNumber: 1,
        aisleId: 'island-choc',
        aisleNumber: 5,
        aisleName: 'Luxury Chocolates Island',
        aisleCategory: 'Chocolates & Confectionery',
        shelfSide: 'RIGHT',
        shelfTier: 2,
        shelfPosition: i + 1,
        worldX: x,
        worldY: y,
        worldZ: z,
        rotationY: -angle - Math.PI / 2,
        color: '#4a044e',
        modelType: 'chocolate',
      };

      arr.push({
        key: `choc-t2-${i}-${prod.id}`,
        product: { ...prod, placement: slotPlacement },
        x,
        y,
        z,
        rotY: -angle - Math.PI / 2,
      });
    }

    return arr;
  }, [chocProducts, center]);

  // Group by product
  const batches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof slots }>();
    slots.forEach((s) => {
      const pid = s.product.id;
      let b = map.get(pid);
      if (!b) {
        b = { product: s.product, slots: [] };
        map.set(pid, b);
      }
      b.slots.push(s);
    });
    return Array.from(map.values());
  }, [slots]);

  return (
    <group position={center}>
      {/* Tier 1 Podium Cylinder (Radius 1.4m, Height 0.40m) */}
      <mesh position={[0, 0.20, 0]} geometry={sharedGeometries.cyl16} scale={[1.40, 0.40, 1.40]} material={islandMaterials.chocPodium} raycast={() => null} />
      {/* Tier 1 Gold Outer Lip Accent */}
      <mesh position={[0, 0.395, 0]} geometry={sharedGeometries.cyl16} scale={[1.42, 0.02, 1.42]} material={islandMaterials.goldTrim} raycast={() => null} />

      {/* Tier 2 Podium Cylinder (Radius 0.95m, Height 0.40m on top of Tier 1) */}
      <mesh position={[0, 0.60, 0]} geometry={sharedGeometries.cyl16} scale={[0.95, 0.40, 0.95]} material={islandMaterials.chocPodium} raycast={() => null} />
      {/* Tier 2 Gold Lip */}
      <mesh position={[0, 0.795, 0]} geometry={sharedGeometries.cyl16} scale={[0.97, 0.02, 0.97]} material={islandMaterials.goldTrim} raycast={() => null} />

      {/* Tier 3 Pyramid Crown Podium (Radius 0.55m, Height 0.40m on top of Tier 2) */}
      <mesh position={[0, 1.00, 0]} geometry={sharedGeometries.cyl16} scale={[0.55, 0.40, 0.55]} material={islandMaterials.chocPodium} raycast={() => null} />
      {/* Tier 3 Gold Lip */}
      <mesh position={[0, 1.195, 0]} geometry={sharedGeometries.cyl16} scale={[0.57, 0.02, 0.57]} material={islandMaterials.goldTrim} raycast={() => null} />

      {/* Central Rotating Topper Sign Stand */}
      <group position={[0, 1.65, 0]} raycast={() => null}>
        {/* Brass Support Rod */}
        <mesh position={[0, -0.25, 0]} geometry={sharedGeometries.cyl8} scale={[0.025, 0.50, 0.025]} material={islandMaterials.goldTrim} />
        {/* Double-sided Oval Signboard */}
        <mesh geometry={sharedGeometries.box} scale={[1.60, 0.46, 0.06]} material={islandMaterials.goldTrim} />
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[1.54, 0.40, 0.07]} material={islandMaterials.chocHeader} />
        <Text position={[0, 0.08, 0.038]} fontSize={0.095} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'CHOCOLATE CARNIVAL'}
        </Text>
        <Text position={[0, -0.08, 0.038]} fontSize={0.065} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ CADBURY SILK & KITKAT SPECIALS ★'}
        </Text>
        {/* Back face text */}
        <Text position={[0, 0.08, -0.038]} rotation={[0, Math.PI, 0]} fontSize={0.095} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'CHOCOLATE CARNIVAL'}
        </Text>
        <Text position={[0, -0.08, -0.038]} rotation={[0, Math.PI, 0]} fontSize={0.065} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ CADBURY SILK & KITKAT SPECIALS ★'}
        </Text>
      </group>

      {/* Interactive Instanced Chocolates */}
      <group position={[-center[0], 0, -center[2]]}>
        {batches.map((batch) => (
          <IslandProductBatch key={`choc-batch-${batch.product.id}`} product={batch.product} slots={batch.slots} openModal={openProductModal} setHover={setHoveredProduct} isChoc={true} />
        ))}
      </group>
    </group>
  );
});
ChocolatesPromotionalIsland.displayName = 'ChocolatesPromotionalIsland';

// ---------------------------------------------------------------------------
// ISLAND 2: PREMIUM TEA & COFFEE PAVILION (x = 0, z = -2)
// ---------------------------------------------------------------------------
const TeaCoffeePromotionalIsland: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const center: [number, number, number] = [0, 0, -2];

  // Filter tea & coffee products
  const teaCoffeeProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      return (
        name.includes('tea') ||
        name.includes('coffee') ||
        name.includes('nescafe') ||
        name.includes('bru') ||
        name.includes('taj mahal') ||
        name.includes('red label') ||
        slug.includes('tea') ||
        slug.includes('coffee')
      );
    });
  }, [products]);

  // Rectangular 2-Tier Natural Wood Display Table (3.2m x 2.2m)
  const slots = useMemo(() => {
    if (teaCoffeeProducts.length === 0) return [];
    const pool = teaCoffeeProducts;
    const poolLen = pool.length;
    const arr: Array<{
      key: string;
      product: Product;
      x: number;
      y: number;
      z: number;
      rotY: number;
    }> = [];

    // Lower Deck Perimeter (Tier 1: y = 0.42m)
    // North side (facing -Z)
    [-1.1, -0.55, 0, 0.55, 1.1].forEach((xOff, idx) => {
      const prod = pool[idx % poolLen];
      const x = center[0] + xOff;
      const z = center[2] - 0.95;
      const y = 0.42;

      arr.push({
        key: `tc-t1-n-${idx}-${prod.id}`,
        product: {
          ...prod,
          placement: {
            id: `tc-n-${idx}`,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productPrice: prod.price,
            productMrp: prod.mrp,
            floorNumber: 1,
            aisleId: 'island-tea-coffee',
            aisleNumber: 4,
            aisleName: 'Artisan Tea & Coffee Pavilion',
            aisleCategory: 'Tea & Coffee Essentials',
            shelfSide: 'LEFT',
            shelfTier: 1,
            shelfPosition: idx + 1,
            worldX: x,
            worldY: y,
            worldZ: z,
            rotationY: 0,
            color: '#78350f',
            modelType: 'box',
          },
        },
        x,
        y,
        z,
        rotY: 0,
      });
    });

    // South side (facing +Z)
    [-1.1, -0.55, 0, 0.55, 1.1].forEach((xOff, idx) => {
      const prod = pool[(idx + 4) % poolLen];
      const x = center[0] + xOff;
      const z = center[2] + 0.95;
      const y = 0.42;

      arr.push({
        key: `tc-t1-s-${idx}-${prod.id}`,
        product: {
          ...prod,
          placement: {
            id: `tc-s-${idx}`,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productPrice: prod.price,
            productMrp: prod.mrp,
            floorNumber: 1,
            aisleId: 'island-tea-coffee',
            aisleNumber: 4,
            aisleName: 'Artisan Tea & Coffee Pavilion',
            aisleCategory: 'Tea & Coffee Essentials',
            shelfSide: 'RIGHT',
            shelfTier: 1,
            shelfPosition: idx + 6,
            worldX: x,
            worldY: y,
            worldZ: z,
            rotationY: Math.PI,
            color: '#78350f',
            modelType: 'box',
          },
        },
        x,
        y,
        z,
        rotY: Math.PI,
      });
    });

    // Upper Raised Deck (Tier 2: y = 0.85m)
    [-0.7, 0, 0.7].forEach((xOff, idx) => {
      const prod = pool[(idx + 2) % poolLen];
      const x = center[0] + xOff;
      const z = center[2] - 0.35;
      const y = 0.85;

      arr.push({
        key: `tc-t2-n-${idx}-${prod.id}`,
        product: {
          ...prod,
          placement: {
            id: `tc-t2n-${idx}`,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productPrice: prod.price,
            productMrp: prod.mrp,
            floorNumber: 1,
            aisleId: 'island-tea-coffee',
            aisleNumber: 4,
            aisleName: 'Artisan Tea & Coffee Pavilion',
            aisleCategory: 'Tea & Coffee Essentials',
            shelfSide: 'LEFT',
            shelfTier: 2,
            shelfPosition: idx + 11,
            worldX: x,
            worldY: y,
            worldZ: z,
            rotationY: 0,
            color: '#78350f',
            modelType: 'box',
          },
        },
        x,
        y,
        z,
        rotY: 0,
      });
    });

    return arr;
  }, [teaCoffeeProducts, center]);

  const batches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof slots }>();
    slots.forEach((s) => {
      const pid = s.product.id;
      let b = map.get(pid);
      if (!b) {
        b = { product: s.product, slots: [] };
        map.set(pid, b);
      }
      b.slots.push(s);
    });
    return Array.from(map.values());
  }, [slots]);

  return (
    <group position={center}>
      {/* Lower Wood Deck Platform (3.2m x 2.2m x 0.42m) */}
      <mesh position={[0, 0.21, 0]} geometry={sharedGeometries.box} scale={[3.20, 0.42, 2.20]} material={islandMaterials.woodPodium} raycast={() => null} />
      {/* Brass Edge Bezel */}
      <mesh position={[0, 0.415, 0]} geometry={sharedGeometries.box} scale={[3.24, 0.02, 2.24]} material={islandMaterials.brassTrim} raycast={() => null} />

      {/* Upper Tier Riser (2.2m x 1.2m x 0.42m on top of lower deck) */}
      <mesh position={[0, 0.63, 0]} geometry={sharedGeometries.box} scale={[2.20, 0.42, 1.20]} material={islandMaterials.woodPodium} raycast={() => null} />
      <mesh position={[0, 0.845, 0]} geometry={sharedGeometries.box} scale={[2.24, 0.02, 1.24]} material={islandMaterials.brassTrim} raycast={() => null} />

      {/* Central Brass Signpost Header */}
      <group position={[0, 1.55, 0]} raycast={() => null}>
        <mesh position={[-0.9, -0.3, 0]} geometry={sharedGeometries.cyl8} scale={[0.02, 0.60, 0.02]} material={islandMaterials.brassTrim} />
        <mesh position={[0.9, -0.3, 0]} geometry={sharedGeometries.cyl8} scale={[0.02, 0.60, 0.02]} material={islandMaterials.brassTrim} />
        <mesh geometry={sharedGeometries.box} scale={[2.0, 0.44, 0.06]} material={islandMaterials.brassTrim} />
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[1.94, 0.38, 0.07]} material={islandMaterials.coffeeHeader} />
        <Text position={[0, 0.07, 0.038]} fontSize={0.09} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'PREMIUM TEA & COFFEE PAVILION'}
        </Text>
        <Text position={[0, -0.07, 0.038]} fontSize={0.062} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ TATA TEA GOLD • NESCAFE • BRU ROAST ★'}
        </Text>
        <Text position={[0, 0.07, -0.038]} rotation={[0, Math.PI, 0]} fontSize={0.09} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'PREMIUM TEA & COFFEE PAVILION'}
        </Text>
        <Text position={[0, -0.07, -0.038]} rotation={[0, Math.PI, 0]} fontSize={0.062} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ TATA TEA GOLD • NESCAFE • BRU ROAST ★'}
        </Text>
      </group>

      {/* Interactive Products */}
      <group position={[-center[0], 0, -center[2]]}>
        {batches.map((batch) => (
          <IslandProductBatch key={`tc-batch-${batch.product.id}`} product={batch.product} slots={batch.slots} openModal={openProductModal} setHover={setHoveredProduct} isChoc={false} />
        ))}
      </group>
    </group>
  );
});
TeaCoffeePromotionalIsland.displayName = 'TeaCoffeePromotionalIsland';

// ---------------------------------------------------------------------------
// ISLAND 3: FESTIVE SWEETS & ROYAL DRY FRUITS DISPLAY (x = 0, z = 11)
// ---------------------------------------------------------------------------
const SweetsDryFruitsIsland: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const center: [number, number, number] = [0, 0, 11];

  // Filter sweets & dry fruits
  const sweetProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      return (
        name.includes('gulab jamun') ||
        name.includes('soan papdi') ||
        name.includes('almond') ||
        name.includes('cashew') ||
        name.includes('happilo') ||
        name.includes('sweet') ||
        slug.includes('gulab') ||
        slug.includes('soan') ||
        slug.includes('happilo')
      );
    });
  }, [products]);

  // Stepped Emerald & Ruby 3-Tier Octagonal Table (3.0m x 2.6m)
  const slots = useMemo(() => {
    if (sweetProducts.length === 0) return [];
    const pool = sweetProducts;
    const poolLen = pool.length;
    const arr: Array<{
      key: string;
      product: Product;
      x: number;
      y: number;
      z: number;
      rotY: number;
    }> = [];

    // North side facings (y = 0.42m)
    [-1.0, -0.5, 0, 0.5, 1.0].forEach((xOff, idx) => {
      const prod = pool[idx % poolLen];
      const x = center[0] + xOff;
      const z = center[2] - 1.05;
      const y = 0.42;

      arr.push({
        key: `sw-t1-n-${idx}-${prod.id}`,
        product: {
          ...prod,
          placement: {
            id: `sw-n-${idx}`,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productPrice: prod.price,
            productMrp: prod.mrp,
            floorNumber: 1,
            aisleId: 'island-sweets',
            aisleNumber: 10,
            aisleName: 'Festive Sweets & Dry Fruits Island',
            aisleCategory: 'Festive Sweets & Gifting',
            shelfSide: 'LEFT',
            shelfTier: 1,
            shelfPosition: idx + 1,
            worldX: x,
            worldY: y,
            worldZ: z,
            rotationY: 0,
            color: '#831843',
            modelType: 'box',
          },
        },
        x,
        y,
        z,
        rotY: 0,
      });
    });

    // South side facings (y = 0.42m)
    [-1.0, -0.5, 0, 0.5, 1.0].forEach((xOff, idx) => {
      const prod = pool[(idx + 2) % poolLen];
      const x = center[0] + xOff;
      const z = center[2] + 1.05;
      const y = 0.42;

      arr.push({
        key: `sw-t1-s-${idx}-${prod.id}`,
        product: {
          ...prod,
          placement: {
            id: `sw-s-${idx}`,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productPrice: prod.price,
            productMrp: prod.mrp,
            floorNumber: 1,
            aisleId: 'island-sweets',
            aisleNumber: 10,
            aisleName: 'Festive Sweets & Dry Fruits Island',
            aisleCategory: 'Festive Sweets & Gifting',
            shelfSide: 'RIGHT',
            shelfTier: 1,
            shelfPosition: idx + 6,
            worldX: x,
            worldY: y,
            worldZ: z,
            rotationY: Math.PI,
            color: '#831843',
            modelType: 'box',
          },
        },
        x,
        y,
        z,
        rotY: Math.PI,
      });
    });

    // Mid Riser Facings (y = 0.85m)
    [-0.6, 0, 0.6].forEach((xOff, idx) => {
      const prod = pool[(idx + 3) % poolLen];
      const x = center[0] + xOff;
      const z = center[2] - 0.45;
      const y = 0.85;

      arr.push({
        key: `sw-t2-n-${idx}-${prod.id}`,
        product: {
          ...prod,
          placement: {
            id: `sw-t2-${idx}`,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productPrice: prod.price,
            productMrp: prod.mrp,
            floorNumber: 1,
            aisleId: 'island-sweets',
            aisleNumber: 10,
            aisleName: 'Festive Sweets & Dry Fruits Island',
            aisleCategory: 'Festive Sweets & Gifting',
            shelfSide: 'LEFT',
            shelfTier: 2,
            shelfPosition: idx + 11,
            worldX: x,
            worldY: y,
            worldZ: z,
            rotationY: 0,
            color: '#831843',
            modelType: 'box',
          },
        },
        x,
        y,
        z,
        rotY: 0,
      });
    });

    return arr;
  }, [sweetProducts, center]);

  const batches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof slots }>();
    slots.forEach((s) => {
      const pid = s.product.id;
      let b = map.get(pid);
      if (!b) {
        b = { product: s.product, slots: [] };
        map.set(pid, b);
      }
      b.slots.push(s);
    });
    return Array.from(map.values());
  }, [slots]);

  return (
    <group position={center}>
      {/* Lower Emerald Deck (3.0m x 2.6m x 0.42m) */}
      <mesh position={[0, 0.21, 0]} geometry={sharedGeometries.box} scale={[3.00, 0.42, 2.60]} material={islandMaterials.sweetPodium} raycast={() => null} />
      <mesh position={[0, 0.415, 0]} geometry={sharedGeometries.box} scale={[3.04, 0.02, 2.64]} material={islandMaterials.rubyTrim} raycast={() => null} />

      {/* Upper Mid Deck (2.0m x 1.6m x 0.42m) */}
      <mesh position={[0, 0.63, 0]} geometry={sharedGeometries.box} scale={[2.00, 0.42, 1.60]} material={islandMaterials.sweetPodium} raycast={() => null} />
      <mesh position={[0, 0.845, 0]} geometry={sharedGeometries.box} scale={[2.04, 0.02, 1.64]} material={islandMaterials.rubyTrim} raycast={() => null} />

      {/* Central Festive Signpost */}
      <group position={[0, 1.55, 0]} raycast={() => null}>
        <mesh position={[-0.8, -0.3, 0]} geometry={sharedGeometries.cyl8} scale={[0.02, 0.60, 0.02]} material={islandMaterials.goldTrim} />
        <mesh position={[0.8, -0.3, 0]} geometry={sharedGeometries.cyl8} scale={[0.02, 0.60, 0.02]} material={islandMaterials.goldTrim} />
        <mesh geometry={sharedGeometries.box} scale={[1.8, 0.44, 0.06]} material={islandMaterials.rubyTrim} />
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[1.74, 0.38, 0.07]} material={islandMaterials.sweetHeader} />
        <Text position={[0, 0.07, 0.038]} fontSize={0.09} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'FESTIVE SWEETS & DRY FRUITS'}
        </Text>
        <Text position={[0, -0.07, 0.038]} fontSize={0.06} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ HALDIRAM GULAB JAMUN • ROYAL NUTS ★'}
        </Text>
        <Text position={[0, 0.07, -0.038]} rotation={[0, Math.PI, 0]} fontSize={0.09} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'FESTIVE SWEETS & DRY FRUITS'}
        </Text>
        <Text position={[0, -0.07, -0.038]} rotation={[0, Math.PI, 0]} fontSize={0.06} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ HALDIRAM GULAB JAMUN • ROYAL NUTS ★'}
        </Text>
      </group>

      {/* Interactive Products */}
      <group position={[-center[0], 0, -center[2]]}>
        {batches.map((batch) => (
          <IslandProductBatch key={`sw-batch-${batch.product.id}`} product={batch.product} slots={batch.slots} openModal={openProductModal} setHover={setHoveredProduct} isChoc={false} />
        ))}
      </group>
    </group>
  );
});
SweetsDryFruitsIsland.displayName = 'SweetsDryFruitsIsland';

// Batched Instanced Product for Island Displays
const IslandProductBatch: React.FC<{
  product: Product;
  slots: Array<{ x: number; y: number; z: number; rotY: number; key: string }>;
  openModal: (p: Product) => void;
  setHover: (p: Product | null) => void;
  isChoc?: boolean;
}> = React.memo(({ product, slots, openModal, setHover, isChoc = false }) => {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);

  const plcColor = product.placement?.color || '#3b82f6';
  const bodyMat = useMemo(() => {
    return isChoc
      ? getProductBodyMaterial('#4a044e', 0.3, 0.12)
      : getProductBodyMaterial(plcColor, 0.35, 0.08);
  }, [plcColor, isChoc]);

  const frontTex = useMemo(() => getProductPackagingTexture(product), [product]);
  const labelMat = useMemo(() => getShelfMaterial(frontTex, `pkg-${product.slug || product.id}`, 'standard'), [frontTex, product]);

  const bw = isChoc ? 0.28 : 0.26;
  const bh = isChoc ? 0.24 : 0.34;
  const bd = isChoc ? 0.08 : 0.14;
  const yOff = bh / 2;

  useEffect(() => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const labelDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      // 3D Body
      dummy.position.set(slot.x, slot.y + yOff, slot.z);
      dummy.rotation.set(0, slot.rotY, 0);
      dummy.scale.set(bw, bh, bd);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(idx, dummy.matrix);

      // Label Faceplate
      labelDummy.position.set(
        slot.x + Math.sin(slot.rotY) * (bd / 2 + 0.003),
        slot.y + yOff,
        slot.z + Math.cos(slot.rotY) * (bd / 2 + 0.003)
      );
      labelDummy.rotation.set(0, slot.rotY, 0);
      labelDummy.scale.set(bw * 0.94, bh * 0.94, 1);
      labelDummy.updateMatrix();
      labelRef.current!.setMatrixAt(idx, labelDummy.matrix);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    labelRef.current.instanceMatrix.needsUpdate = true;
  }, [slots, bw, bh, bd, yOff]);

  if (slots.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[sharedGeometries.box, bodyMat, slots.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          setHover(product);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          setHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openModal(product);
        }}
      />
      <instancedMesh ref={labelRef} args={[sharedGeometries.plane, labelMat, slots.length]} raycast={() => null} />
    </group>
  );
});
IslandProductBatch.displayName = 'IslandProductBatch';

// Combined PromotionalIslands Component
export const PromotionalIslands: React.FC = React.memo(() => {
  return (
    <group>
      <ChocolatesPromotionalIsland />
      <TeaCoffeePromotionalIsland />
      <SweetsDryFruitsIsland />
    </group>
  );
});
PromotionalIslands.displayName = 'PromotionalIslands';
