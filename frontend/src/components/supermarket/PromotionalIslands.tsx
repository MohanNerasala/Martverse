'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
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
import { easeOutCubic, isReducedMotion, computeHoverMatrix, computeHoverLabelMatrix } from '@/lib/hoverProductTween';
import { HoverProductHighlightBadge } from './HoverProductHighlightBadge';

// Pre-allocated static matrices for zero-GC hover tweens
const _islandMat4 = new THREE.Matrix4();
const _islandLabelMat4 = new THREE.Matrix4();

// Pre-allocated static materials for promotional display islands (Bright Hypermarket Palette)
const islandMaterials = {
  whitePodium: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.25, metalness: 0.1 }),
  bluePodium: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.3, metalness: 0.15 }),
  goldTrim: new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.25, metalness: 0.6 }),
  blueHeader: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.2, metalness: 0.2 }),
  whitePlank: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 }),
  kickplate: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.35, metalness: 0.2 }),
  acrylicLip: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, roughness: 0.1 }),
  contactShadow: new THREE.MeshBasicMaterial({ color: '#090d16', transparent: true, opacity: 0.22, depthWrite: false }),

  // Clean Commercial Aliases (Zero dark purple, brown or black placeholders)
  chocPodium: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.25, metalness: 0.1 }),
  goldTrimOld: new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.2, metalness: 0.8 }),
  chocHeader: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.2, metalness: 0.2 }),
  woodPodium: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.1 }),
  brassTrim: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.25, metalness: 0.2 }),
  coffeeHeader: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.2, metalness: 0.2 }),
  sweetPodium: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.1 }),
  rubyTrim: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.25, metalness: 0.2 }),
  sweetHeader: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.2, metalness: 0.2 }),
};

// ---------------------------------------------------------------------------
// ISLAND 1: LUXURY CHOCOLATES & CONFECTIONERY SHOWCASE (x = 0, z = -22.5)
// ---------------------------------------------------------------------------
const ChocolatesPromotionalIsland: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const center: [number, number, number] = [0, 0, -22.5];

  // Filter chocolates and confectionery directly from database API products
  const chocProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
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

  // Clean Commercial Promotional Gondola: 3 Tiers (Matching Photo 2 Reference)
  const tiers = useMemo(() => [0.35, 0.85, 1.35], []);

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

    tiers.forEach((tierY, tIdx) => {
      // 1. North Face (Facing Entrance / -Z, placed 35mm behind 0.80m shelf lip)
      [-1.2, -0.6, 0, 0.6, 1.2].forEach((xOff, pIdx) => {
        const prod = pool[(tIdx * 8 + pIdx) % poolLen];
        const x = center[0] + xOff;
        const z = center[2] - 0.715;
        const y = tierY + 0.0175;

        const slotPlacement: ProductPlacement = {
          id: `choc-n-t${tIdx}-${pIdx}`,
          productId: prod.id,
          productName: prod.name,
          productSlug: prod.slug,
          productPrice: prod.price,
          productMrp: prod.mrp,
          floorNumber: 1,
          aisleId: 'island-promo-choc',
          aisleNumber: 1,
          aisleName: 'Promotions Feature Gondola',
          aisleCategory: 'Chocolates & Confectionery',
          shelfSide: 'LEFT',
          shelfTier: tIdx + 1,
          shelfPosition: pIdx + 1,
          worldX: x,
          worldY: y,
          worldZ: z,
          rotationY: Math.PI,
          color: '#2563eb',
          modelType: 'chocolate',
        };

        arr.push({
          key: `choc-n-${tIdx}-${pIdx}-${prod.id}`,
          product: { ...prod, placement: slotPlacement },
          x,
          y,
          z,
          rotY: Math.PI,
        });
      });

      // 2. South Face (Facing Aisles / +Z, placed 35mm behind 0.80m shelf lip)
      [-1.2, -0.6, 0, 0.6, 1.2].forEach((xOff, pIdx) => {
        const prod = pool[(tIdx * 8 + pIdx + 3) % poolLen];
        const x = center[0] + xOff;
        const z = center[2] + 0.715;
        const y = tierY + 0.0175;

        const slotPlacement: ProductPlacement = {
          id: `choc-s-t${tIdx}-${pIdx}`,
          productId: prod.id,
          productName: prod.name,
          productSlug: prod.slug,
          productPrice: prod.price,
          productMrp: prod.mrp,
          floorNumber: 1,
          aisleId: 'island-promo-choc',
          aisleNumber: 1,
          aisleName: 'Promotions Feature Gondola',
          aisleCategory: 'Chocolates & Confectionery',
          shelfSide: 'RIGHT',
          shelfTier: tIdx + 1,
          shelfPosition: pIdx + 1,
          worldX: x,
          worldY: y,
          worldZ: z,
          rotationY: 0,
          color: '#2563eb',
          modelType: 'chocolate',
        };

        arr.push({
          key: `choc-s-${tIdx}-${pIdx}-${prod.id}`,
          product: { ...prod, placement: slotPlacement },
          x,
          y,
          z,
          rotY: 0,
        });
      });

      // 3. West End-Cap (Facing Left / -X, placed 35mm behind 1.60m endcap shelf lip)
      [-0.4, 0.4].forEach((zOff, pIdx) => {
        const prod = pool[(tIdx * 8 + pIdx + 5) % poolLen];
        const x = center[0] - 1.515;
        const z = center[2] + zOff;
        const y = tierY + 0.0175;

        const slotPlacement: ProductPlacement = {
          id: `choc-w-t${tIdx}-${pIdx}`,
          productId: prod.id,
          productName: prod.name,
          productSlug: prod.slug,
          productPrice: prod.price,
          productMrp: prod.mrp,
          floorNumber: 1,
          aisleId: 'island-promo-choc',
          aisleNumber: 1,
          aisleName: 'Promotions Feature Gondola',
          aisleCategory: 'Chocolates & Confectionery',
          shelfSide: 'LEFT',
          shelfTier: tIdx + 1,
          shelfPosition: pIdx + 1,
          worldX: x,
          worldY: y,
          worldZ: z,
          rotationY: -Math.PI / 2,
          color: '#2563eb',
          modelType: 'chocolate',
        };

        arr.push({
          key: `choc-w-${tIdx}-${pIdx}-${prod.id}`,
          product: { ...prod, placement: slotPlacement },
          x,
          y,
          z,
          rotY: -Math.PI / 2,
        });
      });

      // 4. East End-Cap (Facing Right / +X, placed 35mm behind 1.60m endcap shelf lip)
      [-0.4, 0.4].forEach((zOff, pIdx) => {
        const prod = pool[(tIdx * 8 + pIdx + 6) % poolLen];
        const x = center[0] + 1.515;
        const z = center[2] + zOff;
        const y = tierY + 0.0175;

        const slotPlacement: ProductPlacement = {
          id: `choc-e-t${tIdx}-${pIdx}`,
          productId: prod.id,
          productName: prod.name,
          productSlug: prod.slug,
          productPrice: prod.price,
          productMrp: prod.mrp,
          floorNumber: 1,
          aisleId: 'island-promo-choc',
          aisleNumber: 1,
          aisleName: 'Promotions Feature Gondola',
          aisleCategory: 'Chocolates & Confectionery',
          shelfSide: 'RIGHT',
          shelfTier: tIdx + 1,
          shelfPosition: pIdx + 1,
          worldX: x,
          worldY: y,
          worldZ: z,
          rotationY: Math.PI / 2,
          color: '#2563eb',
          modelType: 'chocolate',
        };

        arr.push({
          key: `choc-e-${tIdx}-${pIdx}-${prod.id}`,
          product: { ...prod, placement: slotPlacement },
          x,
          y,
          z,
          rotY: Math.PI / 2,
        });
      });
    });

    return arr;
  }, [chocProducts, center, tiers]);

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
      {/* Royal Blue Base Skirt */}
      <mesh position={[0, 0.12, 0]} geometry={sharedGeometries.box} scale={[3.24, 0.24, 1.64]} material={islandMaterials.bluePodium} raycast={() => null} />

      {/* Pristine White Gondola Body Core */}
      <mesh position={[0, 0.85, 0]} geometry={sharedGeometries.box} scale={[3.0, 1.40, 1.4]} material={islandMaterials.whitePodium} raycast={() => null} />

      {/* 3 Commercial Retail White Shelves with Royal Blue Rails */}
      {tiers.map((ty, idx) => (
        <group key={`choc-shelf-${idx}`} position={[0, ty, 0]} raycast={() => null}>
          {/* White shelf platform */}
          <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[3.2, 0.035, 1.6]} material={islandMaterials.whitePlank} />
          {/* North royal blue edge rail */}
          <mesh position={[0, 0.015, -0.80]} geometry={sharedGeometries.box} scale={[3.2, 0.045, 0.02]} material={islandMaterials.bluePodium} />
          {/* South royal blue edge rail */}
          <mesh position={[0, 0.015, 0.80]} geometry={sharedGeometries.box} scale={[3.2, 0.045, 0.02]} material={islandMaterials.bluePodium} />
          {/* West royal blue edge rail */}
          <mesh position={[-1.60, 0.015, 0]} geometry={sharedGeometries.box} scale={[0.02, 0.045, 1.6]} material={islandMaterials.bluePodium} />
          {/* East royal blue edge rail */}
          <mesh position={[1.60, 0.015, 0]} geometry={sharedGeometries.box} scale={[0.02, 0.045, 1.6]} material={islandMaterials.bluePodium} />
        </group>
      ))}

      {/* Overhead Royal Blue Department Header Signboard (Matching Photo 2 Reference) */}
      <group position={[0, 1.95, 0]} raycast={() => null}>
        {/* Support Posts */}
        <mesh position={[-1.2, -0.25, 0]} geometry={sharedGeometries.box} scale={[0.05, 0.50, 0.05]} material={islandMaterials.bluePodium} />
        <mesh position={[1.2, -0.25, 0]} geometry={sharedGeometries.box} scale={[0.05, 0.50, 0.05]} material={islandMaterials.bluePodium} />

        {/* Double-Sided Royal Blue Signboard */}
        <mesh geometry={sharedGeometries.box} scale={[2.60, 0.48, 0.08]} material={islandMaterials.bluePodium} />
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[2.54, 0.42, 0.09]} material={islandMaterials.blueHeader} />

        {/* North Face Sign Text */}
        <Text position={[0, 0.08, 0.048]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.06}>
          {'01 PROMOTIONS • SPECIAL OFFERS'}
        </Text>
        <Text position={[0, -0.08, 0.048]} fontSize={0.075} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'★ CADBURY SILK • KITKAT • LUXURY CHOCOLATES ★'}
        </Text>

        {/* South Face Sign Text */}
        <Text position={[0, 0.08, -0.048]} rotation={[0, Math.PI, 0]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.06}>
          {'01 PROMOTIONS • SPECIAL OFFERS'}
        </Text>
        <Text position={[0, -0.08, -0.048]} rotation={[0, Math.PI, 0]} fontSize={0.075} color="#facc15" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'★ CADBURY SILK • KITKAT • LUXURY CHOCOLATES ★'}
        </Text>
      </group>

      {/* Interactive Instanced Front-Facing Catalogue Products */}
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
// ISLAND 2: PREMIUM TEA & COFFEE PAVILION (x = 0, z = -15)
// ---------------------------------------------------------------------------
const TeaCoffeePromotionalIsland: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const center: [number, number, number] = [0, 0, -15.0];

  // Filter tea & coffee products directly from database API products
  const teaCoffeeProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
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

  // Rectangular 2-Tier Display Table (3.2m x 2.2m)
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

    // Lower Deck Perimeter (Tier 1: y = 0.42m, placed 35mm behind lip)
    // North side (facing -Z)
    [-1.1, -0.55, 0, 0.55, 1.1].forEach((xOff, idx) => {
      const prod = pool[idx % poolLen];
      const x = center[0] + xOff;
      const z = center[2] - 0.715;
      const y = 0.42 + 0.0175;

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
// ISLAND 3: FESTIVE SWEETS & ROYAL DRY FRUITS DISPLAY (x = 0, z = -5)
// ---------------------------------------------------------------------------
const SweetsDryFruitsIsland: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const center: [number, number, number] = [0, 0, -5.0];

  // Filter sweets & dry fruits directly from database API products
  const sweetProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
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

  // Stepped 3-Tier Octagonal Table (3.0m x 2.6m, placed 35mm behind lip)
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
      const z = center[2] - 0.715;
      const y = 0.42 + 0.0175;

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

  // Hover Tween State (200ms easeOutCubic in, 160ms out, zero GC per frame)
  const hoveredIndexRef = useRef<number | null>(null);
  const animIndexRef = useRef<number | null>(null);
  const progressRef = useRef(0.0);
  const [activeBadge, setActiveBadge] = useState<{
    pos: [number, number, number];
    rotY: number;
    bw: number;
    bh: number;
    bd: number;
    progress: number;
  } | null>(null);

  const plcColor = product.placement?.color || (isChoc ? '#1d4ed8' : '#3b82f6');
  const bodyMat = useMemo(() => {
    return getProductBodyMaterial(plcColor, 0.3, 0.1);
  }, [plcColor]);

  const frontTex = useMemo(() => getProductPackagingTexture(product), [product]);
  const labelMat = useMemo(() => getShelfMaterial(frontTex, `pkg-${product.slug || product.id}`, 'standard'), [frontTex, product]);

  const bw = isChoc ? 0.28 : 0.26;
  const bh = isChoc ? 0.32 : 0.34;
  const bd = isChoc ? 0.08 : 0.12;
  const yOff = bh / 2;

  // Initial Matrix Population
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
    try {
      bodyRef.current.computeBoundingBox();
      bodyRef.current.computeBoundingSphere();
      labelRef.current.computeBoundingBox();
      labelRef.current.computeBoundingSphere();
    } catch {}
  }, [slots, bw, bh, bd, yOff]);

  // Smooth Render Loop Hover Tween (18mm pull-out forward, 3.5 deg tilt, 0 per-frame allocations)
  useFrame((_, delta) => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;

    const isHovered = hoveredIndexRef.current !== null;

    if (isHovered) {
      animIndexRef.current = hoveredIndexRef.current;
      if (progressRef.current < 1.0) {
        progressRef.current = Math.min(1.0, progressRef.current + delta / 0.200);
      }
    } else if (progressRef.current > 0.0) {
      progressRef.current = Math.max(0.0, progressRef.current - delta / 0.160);
    }

    if (animIndexRef.current !== null && animIndexRef.current < slots.length) {
      const idx = animIndexRef.current;
      const slot = slots[idx];
      const p = easeOutCubic(progressRef.current);
      const reduced = isReducedMotion();

      computeHoverMatrix(_islandMat4, {
        restX: slot.x,
        restY: slot.y + yOff,
        restZ: slot.z,
        rotY: slot.rotY,
        bw,
        bh,
        bd,
        progress: p,
        reducedMotion: reduced,
      });
      bodyRef.current.setMatrixAt(idx, _islandMat4);

      computeHoverLabelMatrix(_islandLabelMat4, {
        restX: slot.x,
        restY: slot.y + yOff,
        restZ: slot.z,
        rotY: slot.rotY,
        bw,
        bh,
        bd,
        lw: bw * 0.94,
        lh: bh * 0.94,
        progress: p,
        reducedMotion: reduced,
      });
      labelRef.current.setMatrixAt(idx, _islandLabelMat4);

      bodyRef.current.instanceMatrix.needsUpdate = true;
      labelRef.current.instanceMatrix.needsUpdate = true;

      if (progressRef.current > 0.02 && !activeBadge) {
        setActiveBadge({
          pos: [slot.x, slot.y + yOff, slot.z],
          rotY: slot.rotY,
          bw,
          bh,
          bd,
          progress: p,
        });
      } else if (progressRef.current <= 0.02 && activeBadge) {
        setActiveBadge(null);
      }

      if (progressRef.current === 0.0 && !isHovered) {
        animIndexRef.current = null;
      }
    }
  });

  if (slots.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        frustumCulled={false}
        args={[sharedGeometries.box, bodyMat, slots.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          const instanceId = e.instanceId;
          if (instanceId !== undefined && instanceId < slots.length) {
            hoveredIndexRef.current = instanceId;
          }
          setHover(product);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          const instanceId = e.instanceId;
          if (instanceId !== undefined && instanceId < slots.length) {
            hoveredIndexRef.current = instanceId;
          }
          setHover(product);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          hoveredIndexRef.current = null;
          setHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openModal(product);
        }}
      />
      <instancedMesh
        ref={labelRef}
        frustumCulled={false}
        args={[sharedGeometries.plane, labelMat, slots.length]}
        raycast={() => null}
      />
      {activeBadge && (
        <HoverProductHighlightBadge
          product={product}
          position={activeBadge.pos}
          rotY={activeBadge.rotY}
          bw={activeBadge.bw}
          bh={activeBadge.bh}
          bd={activeBadge.bd}
          progress={progressRef.current}
        />
      )}
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
