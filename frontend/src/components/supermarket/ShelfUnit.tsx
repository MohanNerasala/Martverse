'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { SupermarketAisle, Product } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';

// Shared texture cache to prevent duplicate fetches across shelf units
const shelfTextureCache = new Map<string, THREE.Texture>();

// Cached Canvas Textures for ESL digital price tags (replaces 792 heavy SDF Text components)
const eslTextureCache = new Map<string, THREE.CanvasTexture>();

function getEslTexture(price: number, brand: string): THREE.CanvasTexture {
  const key = `${price}-${brand}`;
  const existing = eslTextureCache.get(key);
  if (existing) return existing;

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // High-tech dark e-ink background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 256, 128);

    // Subtle casing bezel
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 244, 116);

    // Glowing electric sapphire accent line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 236, 108);

    // Digital ESL Yellow Price
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`₹${price}`, 18, 52);

    // Brand Label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const cleanBrand = brand && brand.length > 12 ? brand.slice(0, 11) + '..' : (brand || 'Martverse');
    ctx.fillText(cleanBrand, 18, 96);

    // High-tech Digital Barcode pattern on right
    ctx.fillStyle = '#94a3b8';
    const barX = 180;
    const barWidths = [2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 4, 2];
    let currX = barX;
    for (let i = 0; i < barWidths.length; i++) {
      ctx.fillRect(currX, 26, barWidths[i], 76);
      currX += barWidths[i] + (i % 2 === 0 ? 2 : 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  eslTextureCache.set(key, texture);
  return texture;
}

const ProductSmallImage: React.FC<{
  url: string | any;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
  materialType?: 'basic' | 'standard';
  roughness?: number;
  metalness?: number;
  alphaTest?: number;
}> = ({ url, position, scale, rotation, materialType = 'basic', roughness = 0.25, metalness = 0.12, alphaTest = 0.02 }) => {
  const resolvedUrl: string = typeof url === 'object' && url && 'src' in url ? url.src : (url || '/products/sweets/DairyMilk.png');

  const [texture, setTexture] = useState<THREE.Texture | null>(() => {
    return resolvedUrl ? (shelfTextureCache.get(resolvedUrl) || null) : null;
  });

  useEffect(() => {
    if (!resolvedUrl) return;
    if (shelfTextureCache.has(resolvedUrl)) {
      setTexture(shelfTextureCache.get(resolvedUrl)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      resolvedUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        shelfTextureCache.set(resolvedUrl, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        if (resolvedUrl !== '/products/sweets/DairyMilk.png') {
          loader.load('/products/sweets/DairyMilk.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = 16;
            tex.needsUpdate = true;
            shelfTextureCache.set(resolvedUrl, tex);
            setTexture(tex);
          });
        }
      }
    );
  }, [resolvedUrl]);

  return (
    <mesh position={position} rotation={rotation} raycast={() => null}>
      <planeGeometry args={scale} />
      {texture ? (
        materialType === 'standard' ? (
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={alphaTest}
            roughness={roughness}
            metalness={metalness}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshBasicMaterial map={texture} transparent alphaTest={alphaTest} toneMapped={false} side={THREE.DoubleSide} />
        )
      ) : (
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      )}
    </mesh>
  );
};

interface ShelfUnitProps {
  aisle: SupermarketAisle;
  products: Product[];
  floorYOffset: number;
}

export const ShelfUnit: React.FC<ShelfUnitProps> = ({ aisle, products, floorYOffset }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);
  const activeFloor = useMartStore((state) => state.activeFloor);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);

  // Active floor culling: render full detailed product items only on the player's active floor
  const isFloorActive = (floorYOffset > 2 ? 2 : 1) === activeFloor;

  const aisleProducts = useMemo(() => {
    return products.filter(
      (p) => p.placement && p.placement.aisleNumber === aisle.aisleNumber
    );
  }, [products, aisle.aisleNumber]);

  const length = Math.abs(aisle.endZ - aisle.startZ);
  const centerX = (aisle.startX + aisle.endX) / 2;
  const centerZ = (aisle.startZ + aisle.endZ) / 2;
  const centerY = floorYOffset + aisle.shelfHeight / 2;

  // ─────────────────────────────────────────────────────────────
  // 6 DISTINCT BLOCKS DEFINED BY UPRIGHT SUPPORT POLES
  // Total shelf length = 24m, divided into exactly 6 blocks of 4m each.
  // 7 poles at: [-12, -8, -4, 0, 4, 8, 12]
  // ─────────────────────────────────────────────────────────────
  const BLOCK_COUNT = 6;
  const blockWidth = length / BLOCK_COUNT; // 4.0m

  const blockCenters = useMemo(() => {
    return Array.from(
      { length: BLOCK_COUNT },
      (_, b) => -length / 2 + (b + 0.5) * blockWidth
    ); // [-10, -6, -2, 2, 6, 10]
  }, [length, blockWidth]);

  // Inside each block (between one pole and the next pole), exactly 3 items are shown
  // Offsets from block center: -1.15m, 0m, +1.15m (0.85m margin to the poles on either side)
  const itemOffsets = [-1.15, 0, 1.15];

  // Height for products sitting directly on the middle shelf tier (tier 2 at height 1.3m)
  const shelfTierY = 1.3 - aisle.shelfHeight / 2 + 0.02;

  // Generate 6 blocks x 3 items = 18 item display positions for both LEFT and RIGHT shelf faces
  const displaySlots = useMemo(() => {
    if (!aisleProducts || aisleProducts.length === 0) return [];

    const slots: Array<{
      key: string;
      product: Product;
      side: 'LEFT' | 'RIGHT';
      blockIdx: number;
      slotIdx: number;
      relX: number;
      relY: number;
      relZ: number;
      rotationY: number;
    }> = [];

    const sides: Array<{ side: 'LEFT' | 'RIGHT'; relX: number; rotationY: number }> = [
      { side: 'LEFT', relX: -0.45, rotationY: -Math.PI / 2 },
      { side: 'RIGHT', relX: 0.45, rotationY: Math.PI / 2 },
    ];

    sides.forEach((s) => {
      for (let b = 0; b < BLOCK_COUNT; b++) {
        for (let k = 0; k < 3; k++) {
          const zRel = blockCenters[b] + itemOffsets[k];
          // Cycle through aisleProducts evenly so each block has 3 distinct, beautiful items
          const prodIdx = (b * 3 + k + (s.side === 'RIGHT' ? 2 : 0)) % aisleProducts.length;
          const product = aisleProducts[prodIdx];

          slots.push({
            key: `${s.side}-b${b}-s${k}-${product.id}`,
            product,
            side: s.side,
            blockIdx: b,
            slotIdx: k,
            relX: s.relX,
            relY: shelfTierY,
            relZ: zRel,
            rotationY: s.rotationY,
          });
        }
      }
    });

    return slots;
  }, [aisleProducts, blockCenters, shelfTierY]);

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* --- Overhead Aisle Hanging Signboard --- */}
      <group position={[0, aisle.shelfHeight / 2 + 1.2, 0]}>
        {/* Signboard background (Icy Sapphire Blue) */}
        <mesh>
          <boxGeometry args={[2.8, 0.7, 0.08]} />
          <meshStandardMaterial color="#0369a1" metalness={0.4} roughness={0.2} />
        </mesh>
        {/* Cyan/Blue glow header strip */}
        <mesh position={[0, 0.28, 0.05]}>
          <boxGeometry args={[2.7, 0.08, 0.02]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
        </mesh>
        {/* Soft Aisle Downlight Glow (Illuminates walkway between shelves realistically) */}
        <pointLight position={[0, -0.2, 0]} color="#bae6fd" intensity={0.45} distance={7.5} decay={2} />
        {/* Hanging chrome metal chains */}
        <mesh position={[-1.1, 0.8, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[1.1, 0.8, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* 3D Signboard Text */}
        <Text
          position={[0, -0.05, 0.065]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          {`AISLE ${aisle.aisleNumber}\n${aisle.categoryName.toUpperCase()}`}
        </Text>
        {/* Backside Text */}
        <Text
          position={[0, -0.05, -0.065]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          {`AISLE ${aisle.aisleNumber}\n${aisle.categoryName.toUpperCase()}`}
        </Text>
      </group>

      {/* --- Central Shelving Rack --- */}
      {/* Central Back Divider Wall (Pristine White) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, aisle.shelfHeight, length]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.3} />
      </mesh>

      {/* 3 Horizontal Shelves for LEFT and RIGHT sides */}
      {[0.5, 1.3, 2.1].map((shelfH, sIdx) => {
        const yRel = shelfH - aisle.shelfHeight / 2;
        return (
          <group key={`shelf-tier-${sIdx}`} position={[0, yRel, 0]}>
            {/* Left Shelf Plank (High-gloss White) */}
            <mesh position={[-0.45, 0, 0]} receiveShadow>
              <boxGeometry args={[0.85, 0.04, length]} />
              <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.2} />
            </mesh>
            {/* Left Under-Shelf Linear LED Glow Strip */}
            <mesh position={[-0.45, -0.024, 0]}>
              <boxGeometry args={[0.06, 0.012, length]} />
              <meshStandardMaterial color="#bae6fd" emissive="#0284c7" emissiveIntensity={0.75} roughness={0.1} />
            </mesh>
            {/* Left Price Tag Rail (Electric Sapphire LED Rail with Luminous Glow) */}
            <mesh position={[-0.88, 0, 0]}>
              <boxGeometry args={[0.02, 0.06, length]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.55} />
            </mesh>
            {/* Left Slim Cyan Neon Accent Edge Line */}
            <mesh position={[-0.892, 0, 0]}>
              <boxGeometry args={[0.004, 0.018, length]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Right Shelf Plank (High-gloss White) */}
            <mesh position={[0.45, 0, 0]} receiveShadow>
              <boxGeometry args={[0.85, 0.04, length]} />
              <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.2} />
            </mesh>
            {/* Right Under-Shelf Linear LED Glow Strip */}
            <mesh position={[0.45, -0.024, 0]}>
              <boxGeometry args={[0.06, 0.012, length]} />
              <meshStandardMaterial color="#bae6fd" emissive="#0284c7" emissiveIntensity={0.75} roughness={0.1} />
            </mesh>
            {/* Right Price Tag Rail (Electric Sapphire LED Rail with Luminous Glow) */}
            <mesh position={[0.88, 0, 0]}>
              <boxGeometry args={[0.02, 0.06, length]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.55} />
            </mesh>
            {/* Right Slim Cyan Neon Accent Edge Line */}
            <mesh position={[0.892, 0, 0]}>
              <boxGeometry args={[0.004, 0.018, length]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        );
      })}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* UPRIGHT SUPPORT POLES: 7 poles defining exactly 6 distinct blocks */}
      {/* Positions: [-12, -8, -4, 0, 4, 8, 12] across 24m shelf length */}
      {/* With Luminous Vertical Section Indicator Glow Strips */}
      {/* ───────────────────────────────────────────────────────────── */}
      {[-length / 2, -length / 3, -length / 6, 0, length / 6, length / 3, length / 2].map((zPos, pIdx) => (
        <group key={`post-${pIdx}`} position={[0, 0, zPos]}>
          {/* Left Support Pole (Crisp dark industrial metal finish with Glowing Cyan Neon Strip) */}
          <group position={[-0.86, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.05, aisle.shelfHeight, 0.05]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Vertical Section Indicator Glow Strip */}
            <mesh position={[-0.028, 0, 0]}>
              <boxGeometry args={[0.006, aisle.shelfHeight * 0.94, 0.02]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
            </mesh>
          </group>

          {/* Right Support Pole (Crisp dark industrial metal finish with Glowing Cyan Neon Strip) */}
          <group position={[0.86, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.05, aisle.shelfHeight, 0.05]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Vertical Section Indicator Glow Strip */}
            <mesh position={[0.028, 0, 0]}>
              <boxGeometry args={[0.006, aisle.shelfHeight * 0.94, 0.02]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6 BLOCKS × 3 ITEMS PER BLOCK (POLE TO POLE PERFECTION) */}
      {/* Kept mounted in GPU memory; visibility toggled for 0ms lag-free floor switching */}
      {/* ───────────────────────────────────────────────────────────── */}
      <group visible={isFloorActive}>
        {displaySlots.map((slot) => {
        const prod = slot.product;
        const plc = prod.placement || {
          color: '#3b82f6',
          modelType: 'box',
        };
        const relX = slot.relX;
        const relY = slot.relY;
        const relZ = slot.relZ;
        const finalRotationY = slot.rotationY;
        const slotKey = slot.key;

        const isHovered = hoveredSlotKey === slotKey;
        const color = plc.color || '#3b82f6';
        const isSweetsAisle = aisle.aisleNumber === 2;
        const isDairyMilk = prod.slug.includes('dairy-milk') ||
                            prod.name.toLowerCase().includes('dairy milk') ||
                            prod.brand?.toLowerCase().includes('cadbury') ||
                            isSweetsAisle;
        const packagingUrl = isDairyMilk
          ? '/products/sweets/DairyMilk_cropped.png'
          : (prod.imageUrl || '/products/fallback.svg');

        // Pre-cached crisp canvas texture for ESL digital price tag
        const eslTexture = getEslTexture(prod.price, prod.brand || 'Cadbury');

        return (
          <group
            key={slotKey}
            position={[relX, relY + (isHovered ? 0.04 : 0), relZ]}
            scale={isHovered ? [1.04, 1.04, 1.04] : [1, 1, 1]}
            rotation={[0, finalRotationY, 0]}
          >
            {/* Lightweight Invisible Interaction Hitbox for ultra-smooth pointer raycasting */}
            <mesh
              visible={false}
              position={[0, 0.16, 0.05]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredSlotKey(slotKey);
                setHoveredProduct(prod);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredSlotKey(null);
                setHoveredProduct(null);
                document.body.style.cursor = 'default';
              }}
              onClick={(e) => {
                e.stopPropagation();
                openProductModal(prod);
              }}
            >
              <boxGeometry args={[isDairyMilk ? 0.68 : 0.55, 0.40, 0.35]} />
            </mesh>

            {/* Hover Floating Instruction Tag (Rendered only on active hovered item) */}
            {isHovered && (
              <group position={[0, isDairyMilk ? 0.38 : 0.48, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.48, 0.09, 0.02]} />
                  <meshBasicMaterial color="#1d4ed8" />
                </mesh>
                <Text
                  position={[0, 0, 0.015]}
                  fontSize={0.042}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {isDairyMilk ? 'Cadbury Dairy Milk • ₹40' : `${prod.name.slice(0, 20)} • ₹${prod.price}`}
                </Text>
              </group>
            )}

            {/* 3D Product Mesh based on modelType */}
            {plc.modelType === 'bottle' ? (
              <group position={[0, 0, 0]}>
                {/* Cylindrical Main Bottle Body */}
                <mesh castShadow position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.08, 0.085, 0.24, 14]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.15}
                    metalness={0.1}
                    emissive={isHovered ? color : '#000000'}
                    emissiveIntensity={isHovered ? 0.35 : 0}
                  />
                </mesh>
                {/* Tapered Bottle Shoulder */}
                <mesh position={[0, 0.27, 0]}>
                  <cylinderGeometry args={[0.038, 0.08, 0.06, 14]} />
                  <meshStandardMaterial color={color} roughness={0.15} metalness={0.1} />
                </mesh>
                {/* Bottle Neck & Cap */}
                <mesh position={[0, 0.34, 0]}>
                  <cylinderGeometry args={[0.034, 0.034, 0.06, 12]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                </mesh>
                {/* Real Product Artwork on Bottle Label */}
                <ProductSmallImage
                  url={packagingUrl}
                  position={[0, 0.12, 0.088]}
                  scale={[0.13, 0.14]}
                />
              </group>
            ) : plc.modelType === 'shirt' || plc.modelType === 'hanger' ? (
              <group position={[0, 0, 0]}>
                {/* Polished Chrome Hanger Hook */}
                <mesh position={[0, 0.44, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.1, 8]} />
                  <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
                </mesh>
                {/* Dark Hanger Bar */}
                <mesh position={[0, 0.38, 0]}>
                  <boxGeometry args={[0.42, 0.02, 0.02]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.5} />
                </mesh>
                {/* Realistic Folded Garment Body */}
                <mesh castShadow position={[0, 0.18, 0]}>
                  <boxGeometry args={[0.36, 0.36, 0.09]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.7}
                    metalness={0.05}
                    emissive={isHovered ? color : '#000000'}
                    emissiveIntensity={isHovered ? 0.3 : 0}
                  />
                </mesh>
                {/* Clean Inner Collar Trim */}
                <mesh position={[0, 0.34, 0]}>
                  <boxGeometry args={[0.14, 0.03, 0.11]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.5} />
                </mesh>
              </group>
            ) : plc.modelType === 'chocolate' || plc.modelType === 'bar' || isDairyMilk ? (
              // Realistic Big-Size 3D Chocolate Bar Package (Authentic Cadbury Dairy Milk Packaging)
              <group position={[0, 0, 0]}>
                {/* Clear Acrylic Confectionery Shelf Tray directly on shelf plank */}
                <mesh position={[0, 0.008, 0.02]}>
                  <boxGeometry args={[0.70, 0.016, 0.16]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    metalness={0.05}
                  />
                </mesh>
                {/* Front Acrylic Retaining Lip */}
                <mesh position={[0, 0.026, 0.095]}>
                  <boxGeometry args={[0.70, 0.036, 0.006]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.35}
                    roughness={0.1}
                  />
                </mesh>

                {/* --- Front Featured Chocolate Bar: BIG Prominent Packaging with ZERO Black Borders --- */}
                <group position={[0, 0.155, 0.02]} rotation={[-0.04, 0, 0]}>
                  {/* Slim 3D Chocolate Packaging Body (Cadbury Royal Purple - perfectly hidden behind texture) */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.65, 0.296, 0.022]} />
                    <meshStandardMaterial
                      color="#4a044e"
                      roughness={0.3}
                      metalness={0.1}
                      emissive={isHovered ? '#6b21a8' : '#000000'}
                      emissiveIntensity={isHovered ? 0.3 : 0}
                    />
                  </mesh>

                  {/* Complete Cadbury Dairy Milk High-Resolution Packaging Artwork Plane */}
                  {/* Exact 2.1845 aspect ratio matches 1409x645 packaging artwork with edge-to-edge clarity */}
                  <ProductSmallImage
                    url={packagingUrl}
                    position={[0, 0, 0.012]}
                    scale={[0.66, 0.302]}
                    materialType="basic"
                    alphaTest={0.01}
                  />

                  {/* Subtle Glossy Foil Reflection Sheen Strip */}
                  <mesh position={[0, 0.06, 0.013]}>
                    <planeGeometry args={[0.62, 0.03]} />
                    <meshBasicMaterial
                      color="#ffffff"
                      transparent
                      opacity={isHovered ? 0.3 : 0.12}
                    />
                  </mesh>
                </group>
              </group>
            ) : (
              // Standard Premium Box (Biscuits, Tea, Atta, Snacks, etc.)
              <group position={[0, 0, 0]}>
                {/* Premium Carton Box */}
                <mesh castShadow position={[0, 0.18, 0]}>
                  <boxGeometry args={[0.26, 0.36, 0.18]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.05}
                    emissive={isHovered ? color : '#000000'}
                    emissiveIntensity={isHovered ? 0.35 : 0}
                  />
                </mesh>
                {/* Front White Backer Faceplate */}
                <mesh position={[0, 0.18, 0.093]}>
                  <boxGeometry args={[0.24, 0.32, 0.005]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.2} />
                </mesh>
                {/* Real Product Image on Carton */}
                <ProductSmallImage
                  url={packagingUrl}
                  position={[0, 0.18, 0.096]}
                  scale={[0.23, 0.30]}
                />
                {/* Top Fold Seal Flap */}
                <mesh position={[0, 0.363, 0]}>
                  <boxGeometry args={[0.23, 0.008, 0.14]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
                </mesh>
              </group>
            )}

            {/* Shelf Edge ESL (Electronic Shelf Label) Tag mounted directly on blue LED rail */}
            <group position={[0, -0.01, 0.44]}>
              {/* Sleek Digital ESL Casing */}
              <mesh>
                <boxGeometry args={[0.32, 0.12, 0.018]} />
                <meshStandardMaterial
                  color={isHovered ? '#047857' : '#0f172a'}
                  roughness={0.4}
                  metalness={0.2}
                />
              </mesh>
              {/* Ultra-Fast High-Contrast Pre-Rendered Digital E-Ink Display Face */}
              <mesh position={[0, 0, 0.011]}>
                <planeGeometry args={[0.30, 0.10]} />
                <meshBasicMaterial map={eslTexture} toneMapped={false} />
              </mesh>
            </group>
          </group>
        );
      })}
      </group>
    </group>
  );
};
