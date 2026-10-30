'use client';

import React from 'react';
import { Text } from '@react-three/drei';

interface StoreArchitectureProps {
  activeFloor?: number;
}

const StoreArchitectureComponent: React.FC<StoreArchitectureProps> = () => {
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
      {/* Wall opening lintel over entrance door (Pristine Architectural White) */}
      <mesh position={[0, 4.2, -26]} receiveShadow>
        <boxGeometry args={[8, 1.6, 0.4]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* --- Single Luxury White Signboard: 'Welcome to Martverse' --- */}
      <group position={[0, 4.25, -25.75]}>
        {/* Sleek Chrome Framing Rim */}
        <mesh position={[0, 0, -0.015]}>
          <boxGeometry args={[5.28, 0.93, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pure White Acrylic/Porcelain Board */}
        <mesh position={[0, 0, 0.015]} castShadow>
          <boxGeometry args={[5.2, 0.85, 0.03]} />
          <meshStandardMaterial color="#ffffff" roughness={0.12} metalness={0.08} />
        </mesh>
        {/* Subtle Sapphire Accent Base Strip */}
        <mesh position={[0, -0.38, 0.038]}>
          <boxGeometry args={[4.8, 0.02, 0.01]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Main Brand Title in Sapphire Blue */}
        <Text
          position={[0, 0.08, 0.045]}
          fontSize={0.34}
          color="#0284c7"
          anchorX="center"
          anchorY="middle"
        >
          Welcome to Martverse
        </Text>
        {/* Elegant Blue-to-White Tagline */}
        <Text
          position={[0, -0.22, 0.045]}
          fontSize={0.14}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          3D VIRTUAL HYPERMARKET
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
      {/* 2. Front Slab (z = 5.4 to 26 - escalator top landing platform) */}
      <mesh position={[15.6, 5.0, 15.7]} receiveShadow>
        <boxGeometry args={[4.8, 0.3, 20.6]} />
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
      {/* Left side safety guardrail protecting the atrium void (x = 13.2, z from -6.5 to 5.4) */}
      <mesh position={[13.2, 5.5, -0.55]}>
        <boxGeometry args={[0.08, 1.0, 11.9]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Back end safety guardrail protecting against drop behind escalator shaft (z = -6.5, x from 13.2 to 16.2) */}
      <mesh position={[14.7, 5.5, -6.5]}>
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

        {/* Overhead Escalator Navigation Signboard (White Board with Black Text - Double Sided) */}
        <group position={[0, 3.85, -8.5]}>
          {/* Chrome Vertical Suspension Rods to Ceiling */}
          <mesh position={[-1.15, 0.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[1.15, 0.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
            <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Chrome Outer Rim Frame */}
          <mesh>
            <boxGeometry args={[2.88, 0.88, 0.08]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Pure White Acrylic/Porcelain Board */}
          <mesh>
            <boxGeometry args={[2.8, 0.8, 0.09]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
          </mesh>

          {/* FRONT FACE (Approaching from Ground Floor) */}
          {/* Option 1: 2nd Floor (Top in Black Text) */}
          <Text
            position={[0, 0.18, 0.05]}
            fontSize={0.16}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            {'↑ 2ND FLOOR • FASHION & APPAREL'}
          </Text>
          {/* Divider Line */}
          <mesh position={[0, 0.02, 0.05]}>
            <boxGeometry args={[2.4, 0.015, 0.005]} />
            <meshBasicMaterial color="#cbd5e1" />
          </mesh>
          {/* Option 2: Ground Floor (Bottom in Black Text) */}
          <Text
            position={[0, -0.18, 0.05]}
            fontSize={0.13}
            color="#334155"
            anchorX="center"
            anchorY="middle"
          >
            {'↓ GROUND FLOOR • GROCERIES & BILLING'}
          </Text>

          {/* BACK FACE (Approaching from 2nd Floor / Escalator Top) */}
          <group rotation={[0, Math.PI, 0]}>
            {/* Option 1: 2nd Floor */}
            <Text
              position={[0, 0.18, 0.05]}
              fontSize={0.16}
              color="#0f172a"
              anchorX="center"
              anchorY="middle"
            >
              {'↑ 2ND FLOOR • FASHION & APPAREL'}
            </Text>
            {/* Divider Line */}
            <mesh position={[0, 0.02, 0.05]}>
              <boxGeometry args={[2.4, 0.015, 0.005]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>
            {/* Option 2: Ground Floor */}
            <Text
              position={[0, -0.18, 0.05]}
              fontSize={0.13}
              color="#334155"
              anchorX="center"
              anchorY="middle"
            >
              {'↓ GROUND FLOOR • GROCERIES & BILLING'}
            </Text>
          </group>
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

      {/* Wall Promotional Lightboxes on Left Wall (100% Martverse Branding) */}
      {/* Lightbox 1: Martverse Mega Savings */}
      <group position={[-17.65, 2.5, -6]} rotation={[0, Math.PI / 2, 0]}>
        {/* Backing Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.7, 2.3, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Deep Sapphire Poster Panel (Raised in front of frame) */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[6.5, 2.1, 0.02]} />
          <meshStandardMaterial color="#0c4a6e" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Top Gold Category Pill */}
        <mesh position={[0, 0.65, 0.05]}>
          <boxGeometry args={[3.2, 0.28, 0.01]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <Text
          position={[0, 0.65, 0.065]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          SUPERMARKET SPECIAL DEALS
        </Text>
        <Text
          position={[0, 0.25, 0.065]}
          fontSize={0.32}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          MARTVERSE MEGA SAVINGS
        </Text>
        <Text
          position={[0, -0.22, 0.065]}
          fontSize={0.16}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
        >
          Up to 50% Off On Daily Groceries, Staples & Spices
        </Text>
        <Text
          position={[0, -0.58, 0.065]}
          fontSize={0.12}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          ★ 100% Quality Assurance • Instant Delivery
        </Text>
      </group>

      {/* Lightbox 2: Martverse Fresh Harvest */}
      <group position={[-17.65, 2.5, 8]} rotation={[0, Math.PI / 2, 0]}>
        {/* Backing Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.7, 2.3, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Fresh Jade/Emerald Poster Panel (Raised in front of frame) */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[6.5, 2.1, 0.02]} />
          <meshStandardMaterial color="#064e3b" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Top Emerald Category Pill */}
        <mesh position={[0, 0.65, 0.05]}>
          <boxGeometry args={[3.2, 0.28, 0.01]} />
          <meshBasicMaterial color="#059669" />
        </mesh>
        <Text
          position={[0, 0.65, 0.065]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          FARM DIRECT ORGANICS
        </Text>
        <Text
          position={[0, 0.25, 0.065]}
          fontSize={0.32}
          color="#6ee7b7"
          anchorX="center"
          anchorY="middle"
        >
          MARTVERSE FRESH HARVEST
        </Text>
        <Text
          position={[0, -0.22, 0.065]}
          fontSize={0.16}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
        >
          Farm-Picked Fresh Produce, Gourmet Dairy & Pure Oils
        </Text>
        <Text
          position={[0, -0.58, 0.065]}
          fontSize={0.12}
          color="#a7f3d0"
          anchorX="center"
          anchorY="middle"
        >
          ✓ 100% Organic Certified • Fresh Daily Stock
        </Text>
      </group>

      {/* Wall Promotional Lightbox on Fashion Floor */}
      <group position={[-17.65, 7.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Backing Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8.2, 2.3, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Regal Plum Poster Panel (Raised in front of frame) */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[8.0, 2.1, 0.02]} />
          <meshStandardMaterial color="#4a044e" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Top Violet Category Pill */}
        <mesh position={[0, 0.65, 0.05]}>
          <boxGeometry args={[3.4, 0.28, 0.01]} />
          <meshBasicMaterial color="#9333ea" />
        </mesh>
        <Text
          position={[0, 0.65, 0.065]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          PREMIUM APPAREL STUDIO
        </Text>
        <Text
          position={[0, 0.25, 0.065]}
          fontSize={0.34}
          color="#f0abfc"
          anchorX="center"
          anchorY="middle"
        >
          MARTVERSE FASHION STUDIO
        </Text>
        <Text
          position={[0, -0.22, 0.065]}
          fontSize={0.16}
          color="#fdf4ff"
          anchorX="center"
          anchorY="middle"
        >
          Exclusive Ethnic Kurtas, Formal Shirts & Premium Denim
        </Text>
        <Text
          position={[0, -0.58, 0.065]}
          fontSize={0.12}
          color="#f5d0fe"
          anchorX="center"
          anchorY="middle"
        >
          ✨ New Seasonal Collection Available Now
        </Text>
      </group>
    </group>
  );
};

export const StoreArchitecture = React.memo(StoreArchitectureComponent);
