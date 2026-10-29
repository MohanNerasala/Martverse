'use client';

import React, { useState } from 'react';
import { SupermarketAisle, Product } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';

interface ShelfUnitProps {
  aisle: SupermarketAisle;
  products: Product[];
  floorYOffset: number;
}

export const ShelfUnit: React.FC<ShelfUnitProps> = ({ aisle, products, floorYOffset }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
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
          position={[0, -0.05, 0.06]}
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
          position={[0, -0.05, -0.06]}
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

        return (
          <group
            key={prod.id}
            position={[relX, relY, relZ]}
            rotation={[0, plc.rotationY || 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredProductId(prod.id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredProductId(null);
              document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
              e.stopPropagation();
              openProductModal(prod);
            }}
          >
            {/* 3D Product Mesh based on modelType */}
            {plc.modelType === 'bottle' ? (
              <mesh castShadow position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.1, 0.12, 0.44, 16]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.2}
                  metalness={0.1}
                  emissive={isHovered ? color : '#000000'}
                  emissiveIntensity={isHovered ? 0.35 : 0}
                />
              </mesh>
            ) : plc.modelType === 'bag' ? (
              <mesh castShadow position={[0, 0.25, 0]}>
                <boxGeometry args={[0.32, 0.48, 0.18]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.6}
                  emissive={isHovered ? color : '#000000'}
                  emissiveIntensity={isHovered ? 0.35 : 0}
                />
              </mesh>
            ) : plc.modelType === 'shirt' || plc.modelType === 'hanger' ? (
              <group position={[0, 0.3, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.34, 0.52, 0.12]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                    emissive={isHovered ? color : '#000000'}
                    emissiveIntensity={isHovered ? 0.35 : 0}
                  />
                </mesh>
                {/* Hanger Hook */}
                <mesh position={[0, 0.32, 0]}>
                  <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
              </group>
            ) : (
              // Standard Box (Cereal, Biscuits, Tea, Butter, etc.)
              <mesh castShadow position={[0, 0.2, 0]}>
                <boxGeometry args={[0.3, 0.38, 0.22]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.4}
                  emissive={isHovered ? color : '#000000'}
                  emissiveIntensity={isHovered ? 0.35 : 0}
                />
              </mesh>
            )}

            {/* Small Floating 3D Price/Discount Badge */}
            <group position={[0, 0.56, 0]}>
              <mesh>
                <planeGeometry args={[0.6, 0.2]} />
                <meshBasicMaterial color={isHovered ? '#15803d' : '#0f172a'} transparent opacity={0.88} />
              </mesh>
              <Text
                position={[0, 0.02, 0.01]}
                fontSize={0.075}
                color="#facc15"
                anchorX="center"
                anchorY="middle"
              >
                {`₹${prod.price}`}
              </Text>
              <Text
                position={[0, -0.05, 0.01]}
                fontSize={0.055}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {prod.brand}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
};
