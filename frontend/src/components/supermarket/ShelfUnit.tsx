'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { SupermarketAisle, Product } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';
import { dairyMilkImg } from '@/assets';

// Shared texture cache to prevent duplicate fetches across shelf units
const shelfTextureCache = new Map<string, THREE.Texture>();

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
        tex.needsUpdate = true;
        shelfTextureCache.set(resolvedUrl, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback to DairyMilk.png if specific image not found
        if (resolvedUrl !== '/products/sweets/DairyMilk.png') {
          loader.load('/products/sweets/DairyMilk.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.needsUpdate = true;
            shelfTextureCache.set(resolvedUrl, tex);
            setTexture(tex);
          });
        }
      }
    );
  }, [resolvedUrl]);

  return (
    <mesh position={position} rotation={rotation}>
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
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);

  const aisleProducts = products.filter(
    (p) => p.placement && p.placement.aisleNumber === aisle.aisleNumber
  );

  const length = Math.abs(aisle.endZ - aisle.startZ) || 24;
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

  // Height for products sitting directly on the middle shelf tier (shelf tier 2 at height 1.3m)
  // Shelf plank yRel = 1.3 - aisle.shelfHeight / 2 = -0.1m. Top surface = -0.1 + 0.02 = -0.08m
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
        <mesh castShadow>
          <boxGeometry args={[2.8, 0.7, 0.08]} />
          <meshStandardMaterial color="#0369a1" metalness={0.4} roughness={0.2} />
        </mesh>
        {/* Cyan/Blue glow header strip */}
        <mesh position={[0, 0.28, 0.05]}>
          <boxGeometry args={[2.7, 0.08, 0.02]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
        </mesh>
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
            <mesh position={[-0.45, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.85, 0.04, length]} />
              <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.2} />
            </mesh>
            {/* Left Price Tag Rail (Electric Sapphire LED Rail) */}
            <mesh position={[-0.88, 0, 0]}>
              <boxGeometry args={[0.02, 0.06, length]} />
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.3} />
            </mesh>

            {/* Right Shelf Plank (High-gloss White) */}
            <mesh position={[0.45, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.85, 0.04, length]} />
              <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.2} />
            </mesh>
            {/* Right Price Tag Rail (Electric Sapphire LED Rail) */}
            <mesh position={[0.88, 0, 0]}>
              <boxGeometry args={[0.02, 0.06, length]} />
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* UPRIGHT SUPPORT POLES: 7 poles defining exactly 6 distinct blocks */}
      {/* Positions: [-12, -8, -4, 0, 4, 8, 12] across 24m shelf length */}
      {/* ───────────────────────────────────────────────────────────── */}
      {[-length / 2, -length / 3, -length / 6, 0, length / 6, length / 3, length / 2].map((zPos, pIdx) => (
        <group key={`post-${pIdx}`} position={[0, 0, zPos]}>
          {/* Left Support Pole (Crisp dark industrial metal finish) */}
          <mesh position={[-0.86, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, aisle.shelfHeight, 0.05]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Right Support Pole (Crisp dark industrial metal finish) */}
          <mesh position={[0.86, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, aisle.shelfHeight, 0.05]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6 BLOCKS × 3 ITEMS PER BLOCK (POLE TO POLE PERFECTION) */}
      {/* Exactly 3 items placed evenly between every single pair of poles */}
      {/* ───────────────────────────────────────────────────────────── */}
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
          ? '/products/sweets/DairyMilk.png'
          : (prod.imageUrl || '/products/fallback.svg');

        return (
          <group
            key={slotKey}
            position={[relX, relY + (isHovered ? 0.04 : 0), relZ]}
            scale={isHovered ? [1.04, 1.04, 1.04] : [1, 1, 1]}
            rotation={[0, finalRotationY, 0]}
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
            {/* Hover Floating Instruction Tag */}
            {isHovered && (
              <group position={[0, isDairyMilk ? 0.44 : 0.50, 0]}>
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
                  <cylinderGeometry args={[0.08, 0.085, 0.24, 18]} />
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
                  <cylinderGeometry args={[0.038, 0.08, 0.06, 18]} />
                  <meshStandardMaterial color={color} roughness={0.15} metalness={0.1} />
                </mesh>
                {/* Bottle Neck */}
                <mesh position={[0, 0.32, 0]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.04, 16]} />
                  <meshStandardMaterial color={color} roughness={0.15} metalness={0.1} />
                </mesh>
                {/* White / Gold Screw Cap */}
                <mesh position={[0, 0.355, 0]}>
                  <cylinderGeometry args={[0.036, 0.036, 0.03, 16]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                </mesh>
                {/* Printed Wrap-around Brand Label Band */}
                <mesh position={[0, 0.12, 0.086]}>
                  <planeGeometry args={[0.13, 0.14]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
                {/* Real Product Artwork on Bottle Label */}
                <ProductSmallImage
                  url={packagingUrl}
                  position={[0, 0.12, 0.088]}
                  scale={[0.12, 0.13]}
                />
              </group>
            ) : plc.modelType === 'shirt' || plc.modelType === 'hanger' ? (
              <group position={[0, 0, 0]}>
                {/* Polished Chrome Hanger Hook */}
                <mesh position={[0, 0.44, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.1, 10]} />
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
                <mesh position={[0, 0.01, 0.02]} receiveShadow>
                  <boxGeometry args={[0.62, 0.02, 0.22]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.35}
                    roughness={0.1}
                    metalness={0.1}
                  />
                </mesh>
                {/* Front Acrylic Retaining Lip (prevents chocolate bar slipping off shelf) */}
                <mesh position={[0, 0.035, 0.125]}>
                  <boxGeometry args={[0.62, 0.05, 0.008]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.4}
                    roughness={0.1}
                  />
                </mesh>

                {/* 2 Stocked Chocolate Bars Behind (Realistic retail shelf depth) */}
                {[-0.07, -0.035].map((zOffset, stackIdx) => (
                  <group key={`choc-stack-${stackIdx}`} position={[0, 0.19, zOffset]} rotation={[-0.07, 0, 0]}>
                    <mesh castShadow receiveShadow>
                      <boxGeometry args={[0.54, 0.36, 0.03]} />
                      <meshStandardMaterial
                        color="#1f053d"
                        roughness={0.25}
                        metalness={0.15}
                      />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]}>
                      <boxGeometry args={[0.018, 0.35, 0.006]} />
                      <meshStandardMaterial color="#1f053d" roughness={0.4} metalness={0.25} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]}>
                      <boxGeometry args={[0.018, 0.35, 0.006]} />
                      <meshStandardMaterial color="#1f053d" roughness={0.4} metalness={0.25} />
                    </mesh>
                  </group>
                ))}

                {/* --- Front Featured Chocolate Bar (Big Size with authentic DairyMilk.png packaging) --- */}
                <group position={[0, 0.19, 0.03]} rotation={[-0.05, 0, 0]}>
                  {/* Main Chocolate Bar Solid Slab Body (Authentic Royal Cadbury Purple Foil Wrapper) */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.54, 0.36, 0.035]} />
                    <meshStandardMaterial
                      color="#1f053d"
                      roughness={0.2}
                      metalness={0.15}
                      emissive={isHovered ? '#3b0764' : '#000000'}
                      emissiveIntensity={isHovered ? 0.4 : 0}
                    />
                  </mesh>

                  {/* Left Crimped Foil Seal Tab */}
                  <mesh position={[-0.28, 0, 0]} castShadow>
                    <boxGeometry args={[0.018, 0.35, 0.006]} />
                    <meshStandardMaterial color="#1f053d" roughness={0.35} metalness={0.25} />
                  </mesh>

                  {/* Right Crimped Foil Seal Tab */}
                  <mesh position={[0.28, 0, 0]} castShadow>
                    <boxGeometry args={[0.018, 0.35, 0.006]} />
                    <meshStandardMaterial color="#1f053d" roughness={0.35} metalness={0.25} />
                  </mesh>

                  {/* Complete Dairy Milk High-Resolution Packaging Texture Plane */}
                  {/* Aspect ratio 1.5 matches 1536x1024 original image in big prominent size */}
                  <ProductSmallImage
                    url={packagingUrl}
                    position={[0, 0, 0.019]}
                    scale={[0.54, 0.36]}
                    materialType="basic"
                    alphaTest={0.01}
                  />

                  {/* Subtle Glossy Foil Reflection Sheen Strip */}
                  <mesh position={[0, 0.08, 0.02]}>
                    <planeGeometry args={[0.50, 0.03]} />
                    <meshBasicMaterial
                      color="#ffffff"
                      transparent
                      opacity={isHovered ? 0.35 : 0.15}
                    />
                  </mesh>
                </group>
              </group>
            ) : (
              // Standard Premium Box (Biscuits, Tea, Atta, Chocolate, etc.)
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
                {/* Gold Quality Seal Ribbon */}
                <mesh position={[-0.07, 0.28, 0.098]}>
                  <cylinderGeometry args={[0.024, 0.024, 0.006, 12]} />
                  <meshBasicMaterial color="#f59e0b" />
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
              {/* High-Contrast E-Ink Digital Display Face */}
              <mesh position={[0, 0, 0.011]}>
                <boxGeometry args={[0.3, 0.1, 0.004]} />
                <meshBasicMaterial color={isHovered ? '#064e3b' : '#020617'} />
              </mesh>
              {/* Product Price Tag */}
              <Text
                position={[-0.04, 0.018, 0.016]}
                fontSize={0.052}
                color="#facc15"
                anchorX="center"
                anchorY="middle"
              >
                {`₹${prod.price}`}
              </Text>
              {/* Product Brand */}
              <Text
                position={[-0.04, -0.022, 0.016]}
                fontSize={0.038}
                color="#e2e8f0"
                anchorX="center"
                anchorY="middle"
                maxWidth={0.18}
              >
                {prod.brand}
              </Text>
              {/* Real Small Product Thumbnail or Barcode on Tag */}
              <ProductSmallImage
                url={packagingUrl}
                position={[0.09, 0, 0.015]}
                scale={[0.07, 0.07]}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
};
