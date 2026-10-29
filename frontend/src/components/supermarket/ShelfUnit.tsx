'use client';

import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { SupermarketAisle, Product } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';

// Shared texture cache to prevent duplicate fetches across shelf units
const shelfTextureCache = new Map<string, THREE.Texture>();

const ProductSmallImage: React.FC<{
  url: string;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
}> = ({ url, position, scale, rotation }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(() => {
    return shelfTextureCache.get(url) || null;
  });

  useEffect(() => {
    if (!url) return;
    if (shelfTextureCache.has(url)) {
      setTexture(shelfTextureCache.get(url)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        shelfTextureCache.set(url, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback gracefully without throwing runtime exceptions
        setTexture(null);
      }
    );
  }, [url]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={scale} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
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
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const aisleProducts = products.filter(
    (p) => p.placement && p.placement.aisleNumber === aisle.aisleNumber
  );

  const length = Math.abs(aisle.endZ - aisle.startZ) || 24;
  const centerX = (aisle.startX + aisle.endX) / 2;
  const centerZ = (aisle.startZ + aisle.endZ) / 2;
  const centerY = floorYOffset + aisle.shelfHeight / 2;

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

      {/* Upright Metal Support Posts along length (Polished Chrome) */}
      {[-length / 2, -length / 4, 0, length / 4, length / 2].map((zPos, pIdx) => (
        <group key={`post-${pIdx}`} position={[0, 0, zPos]}>
          <mesh position={[-0.86, 0, 0]} castShadow>
            <boxGeometry args={[0.05, aisle.shelfHeight, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.86, 0, 0]} castShadow>
            <boxGeometry args={[0.05, aisle.shelfHeight, 0.05]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* --- Products on this Aisle Shelves --- */}
      {aisleProducts.map((prod) => {
        const plc = prod.placement!;
        // Relative coordinates from aisle center
        const relX = plc.worldX - centerX;
        const relY = plc.worldY - (floorYOffset + aisle.shelfHeight / 2);
        const relZ = plc.worldZ - centerZ;

        const isHovered = hoveredProductId === prod.id;
        const color = plc.color || '#3b82f6';
        const packagingUrl = prod.imageUrl || '/products/fallback.svg';

        return (
          <group
            key={prod.id}
            position={[relX, relY + (isHovered ? 0.05 : 0), relZ]}
            scale={isHovered ? [1.06, 1.06, 1.06] : [1, 1, 1]}
            rotation={[0, plc.rotationY || 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredProductId(prod.id);
              setHoveredProduct(prod);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredProductId(null);
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
              <group position={[0, 0.52, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.38, 0.09, 0.02]} />
                  <meshBasicMaterial color="#2563eb" />
                </mesh>
                <Text
                  position={[0, 0, 0.015]}
                  fontSize={0.04}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  Click to View Big
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
                <mesh position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.082, 0.082, 0.16, 18]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.3} />
                </mesh>
                {/* Real Product Packaging Label */}
                <ProductSmallImage
                  url={packagingUrl}
                  position={[0, 0.12, 0.086]}
                  scale={[0.15, 0.18]}
                />
              </group>
            ) : plc.modelType === 'bag' ? (
              <group position={[0, 0, 0]}>
                {/* Artisan Paper / Fabric Bag Body */}
                <mesh castShadow position={[0, 0.2, 0]}>
                  <boxGeometry args={[0.28, 0.4, 0.16]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.85}
                    emissive={isHovered ? color : '#000000'}
                    emissiveIntensity={isHovered ? 0.3 : 0}
                  />
                </mesh>
                {/* Stitched / Rolled Top Seal */}
                <mesh position={[0, 0.41, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.016, 0.016, 0.28, 12]} />
                  <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
                </mesh>
                {/* Front White Backer Plate */}
                <mesh position={[0, 0.2, 0.082]}>
                  <boxGeometry args={[0.24, 0.32, 0.005]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Real Product Packaging Image on Bag */}
                <ProductSmallImage
                  url={packagingUrl}
                  position={[0, 0.2, 0.086]}
                  scale={[0.23, 0.30]}
                />
              </group>
            ) : plc.modelType === 'shirt' || plc.modelType === 'hanger' ? (
              <group position={[0, 0, 0]}>
                {/* Polished Chrome Hanger Hook */}
                <mesh position={[0, 0.42, 0]}>
                  <torusGeometry args={[0.045, 0.01, 8, 16, Math.PI]} />
                  <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
                </mesh>
                {/* Dark Hanger Bar */}
                <mesh position={[0, 0.36, 0]}>
                  <boxGeometry args={[0.34, 0.018, 0.024]} />
                  <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Draped Garment Body */}
                <mesh castShadow position={[0, 0.16, 0]}>
                  <boxGeometry args={[0.32, 0.4, 0.1]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.88}
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

            {/* Shelf Edge ESL (Electronic Shelf Label) Tag */}
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
                position={[0.1, 0, 0.016]}
                scale={[0.08, 0.08]}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
};
