'use client';

import React from 'react';
import { Text } from '@react-three/drei';

interface StoreArchitectureProps {
  activeFloor: number;
}

export const StoreArchitecture: React.FC<StoreArchitectureProps> = ({ activeFloor }) => {
  return (
    <group>
      {/* ==============================================================
          GROUND FLOOR (y = 0)
          ============================================================== */}
      {/* Ground Floor Polished Carrara Porcelain Floor (White & Blue Specular Sheen) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 52]} />
        <meshStandardMaterial color="#ffffff" roughness={0.12} metalness={0.22} />
      </mesh>

      {/* Ground Floor Architectural Pristine White Walls */}
      {/* Back Wall (z = 25) */}
      <mesh position={[0, 2.5, 26]} receiveShadow>
        <boxGeometry args={[36, 5, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Front Entrance Wall (z = -26) with doorway opening */}
      <mesh position={[-11, 2.5, -26]} receiveShadow>
        <boxGeometry args={[14, 5, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      <mesh position={[11, 2.5, -26]} receiveShadow>
        <boxGeometry args={[14, 5, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Transom lintel over entrance door (Electric Sapphire & Glass) */}
      <mesh position={[0, 4.2, -26]}>
        <boxGeometry args={[8, 1.6, 0.4]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} />
      </mesh>
      <Text
        position={[0, 4.2, -25.75]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        MARTVERSE 3D HYPERMARKET
      </Text>

      {/* Entrance Portal Welcome Arch (z = -18.5, directly in front on first look) */}
      <group position={[0, 0, -18.5]}>
        <mesh position={[-4.2, 2.2, 0]} castShadow>
          <boxGeometry args={[0.3, 4.4, 0.3]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[4.2, 2.2, 0]} castShadow>
          <boxGeometry args={[0.3, 4.4, 0.3]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 4.3, 0]}>
          <boxGeometry args={[8.7, 0.65, 0.35]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, 3.95, 0]}>
          <boxGeometry args={[8.8, 0.05, 0.38]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
        </mesh>
        <Text
          position={[0, 4.3, 0.2]}
          fontSize={0.38}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          MARTVERSE 3D HYPERMARKET
        </Text>
        <Text
          position={[0, 4.3, -0.2]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.38}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          THANK YOU FOR VISITING
        </Text>
      </group>

      {/* Left Wall (x = -18) */}
      <mesh position={[-18, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5, 52]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Right Wall (x = 18) */}
      <mesh position={[18, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5, 52]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* Ground Floor Ceiling / Floor 2 Floor Slab (y = 5.0) */}
      {/* 1. Main Floor Slab covering from x = -18 to x = 13.2 */}
      <mesh position={[-2.4, 5.0, 0]} receiveShadow>
        <boxGeometry args={[31.2, 0.3, 52]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
      {/* 2. Front Slab (z = 6.5 to 26) */}
      <mesh position={[15.6, 5.0, 16.25]} receiveShadow>
        <boxGeometry args={[4.8, 0.3, 19.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
      {/* 3. Back Slab (z = -26 to -6.5) */}
      <mesh position={[15.6, 5.0, -16.25]} receiveShadow>
        <boxGeometry args={[4.8, 0.3, 19.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
      {/* 4. Side Walkway slab next to right wall */}
      <mesh position={[17.1, 5.0, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.3, 13]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Escalator Shaft Glass Guardrails on Floor 2 */}
      <mesh position={[13.2, 5.5, 0]}>
        <boxGeometry args={[0.08, 1.0, 13]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      <mesh position={[14.7, 5.5, 6.5]}>
        <boxGeometry args={[3.0, 1.0, 0.08]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} />
      </mesh>

      {/* ==============================================================
          ESCALATOR CONNECTING GROUND & FIRST FLOOR (x = 14.7, z = 0)
          ============================================================== */}
      <group position={[14.7, 0, 0]}>
        {/* Slanted Escalator Ramp (from z = -8, y = 0 up to z = 6, y = 5.0) */}
        <group position={[0, 2.5, -1]} rotation={[-0.34, 0, 0]}>
          {/* Moving steps base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.4, 15]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Step groves / Yellow safety borders */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[1.8, 0.02, 14.8]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          {/* Left Yellow Line */}
          <mesh position={[-0.92, 0.23, 0]}>
            <boxGeometry args={[0.04, 0.01, 14.8]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          {/* Right Yellow Line */}
          <mesh position={[0.92, 0.23, 0]}>
            <boxGeometry args={[0.04, 0.01, 14.8]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>

          {/* Left Glass Balustrade & Rubber Handrail */}
          <mesh position={[-1.05, 0.6, 0]}>
            <boxGeometry args={[0.04, 0.9, 15]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
          </mesh>
          <mesh position={[-1.05, 1.05, 0]}>
            <boxGeometry args={[0.08, 0.06, 15]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>

          {/* Right Glass Balustrade & Rubber Handrail */}
          <mesh position={[1.05, 0.6, 0]}>
            <boxGeometry args={[0.04, 0.9, 15]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} roughness={0.1} />
          </mesh>
          <mesh position={[1.05, 1.05, 0]}>
            <boxGeometry args={[0.08, 0.06, 15]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>
        </group>

        {/* Escalator Signboard */}
        <group position={[0, 2.2, -8.5]}>
          <mesh>
            <boxGeometry args={[2.4, 0.6, 0.1]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.14}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {'↑ 1ST FLOOR: FASHION & APPAREL'}
          </Text>
        </group>
      </group>

      {/* ==============================================================
          FIRST FLOOR (FASHION) (y = 5.0)
          ============================================================== */}
      {/* Upper Floor Walls */}
      <mesh position={[0, 7.5, 26]}>
        <boxGeometry args={[36, 5, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <mesh position={[0, 7.5, -26]}>
        <boxGeometry args={[36, 5, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <mesh position={[-18, 7.5, 0]}>
        <boxGeometry args={[0.4, 5, 52]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <mesh position={[18, 7.5, 0]}>
        <boxGeometry args={[0.4, 5, 52]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Store Roof (y = 10.0) */}
      <mesh position={[0, 10.0, 0]} receiveShadow>
        <boxGeometry args={[36, 0.4, 52]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* ==============================================================
          LIGHTING FIXTURES & PROMOTIONAL BANNERS
          ============================================================== */}
      {/* Fluorescent Light Fixture Rows on Ground Floor Ceiling (y = 4.8) */}
      {[-12, -6, 0, 6].map((xL, idx) => (
        <group key={`light-row-1-${idx}`}>
          {[-15, -5, 5, 15].map((zL, jdx) => (
            <mesh key={`fl-1-${idx}-${jdx}`} position={[xL, 4.85, zL]}>
              <boxGeometry args={[0.3, 0.08, 4.0]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Fluorescent Light Fixture Rows on Roof (y = 9.8) */}
      {[-10, 0, 10].map((xL, idx) => (
        <group key={`light-row-2-${idx}`}>
          {[-15, 0, 15].map((zL, jdx) => (
            <mesh key={`fl-2-${idx}-${jdx}`} position={[xL, 9.85, zL]}>
              <boxGeometry args={[0.3, 0.08, 6.0]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Wall Promotional Banners on Left Wall */}
      <group position={[-17.75, 2.5, -6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[6.5, 2.2]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <Text
          position={[0, 0.3, 0.02]}
          fontSize={0.28}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
        >
          DMART BACHAT DAYS!
        </Text>
        <Text
          position={[0, -0.3, 0.02]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Flat 20% to 50% Off On All Daily Groceries & Spices
        </Text>
      </group>

      <group position={[-17.75, 2.5, 8]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[6.5, 2.2]} />
          <meshStandardMaterial color="#c2410c" />
        </mesh>
        <Text
          position={[0, 0.3, 0.02]}
          fontSize={0.28}
          color="#fef08a"
          anchorX="center"
          anchorY="middle"
        >
          BIGBASKET FRESH
        </Text>
        <Text
          position={[0, -0.3, 0.02]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Farm-Picked Fresh Produce & Wholesome Farm Dairy
        </Text>
      </group>

      {/* Wall Promotional Banner on Fashion Floor */}
      <group position={[-17.75, 7.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[8.0, 2.2]} />
          <meshStandardMaterial color="#9d174d" />
        </mesh>
        <Text
          position={[0, 0.3, 0.02]}
          fontSize={0.3}
          color="#fbcfe8"
          anchorX="center"
          anchorY="middle"
        >
          MARTVERSE FASHION STUDIO
        </Text>
        <Text
          position={[0, -0.3, 0.02]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Trending Kurtas, Peter England Shirts & Levi's Denims
        </Text>
      </group>
    </group>
  );
};
