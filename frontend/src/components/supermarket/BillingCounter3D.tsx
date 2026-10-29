'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useBillingStore } from '@/store/useBillingStore';
import { useCartStore } from '@/store/useCartStore';

interface BillingCounterProps {
  position: [number, number, number];
}

export const BillingCounter3D: React.FC<BillingCounterProps> = ({ position }) => {
  const laserRef = useRef<THREE.Mesh>(null);
  const conveyorRef = useRef<THREE.Mesh>(null);
  const isConveyorMoving = useBillingStore((state) => state.isConveyorMoving);
  const phase = useBillingStore((state) => state.phase);
  const startCheckout = useBillingStore((state) => state.startCheckout);
  const items = useCartStore((state) => state.items);

  useFrame((_, delta) => {
    // Laser pulse effect
    if (laserRef.current) {
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      (laserRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
    // Moving conveyor effect
    if (isConveyorMoving && conveyorRef.current) {
      conveyorRef.current.rotation.x += delta * 3;
    }
  });

  return (
    <group position={position}>
      {/* --- Overhead Illuminated Billing Signboard --- */}
      <group position={[0, 3.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[7.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#0f766e" roughness={0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.24}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {'⚡ EXPRESS BILLING & SCANNING COUNTERS 1 - 3'}
        </Text>
      </group>

      {/* --- 3 Checkout Counters Side by Side --- */}
      {[-2.4, 0, 2.4].map((xOffset, cIdx) => (
        <group key={`counter-${cIdx}`} position={[xOffset, 0, 0]}>
          {/* Main Counter Desk Base */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.0, 3.2]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>

          {/* Stainless Steel / White Countertop */}
          <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.55, 0.06, 3.25]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.4} roughness={0.2} />
          </mesh>

          {/* Black Rubber Conveyor Belt */}
          <mesh position={[-0.2, 1.06, -0.6]} receiveShadow>
            <boxGeometry args={[0.7, 0.02, 1.6]} />
            <meshStandardMaterial color="#09090b" roughness={0.9} />
          </mesh>

          {/* Barcode Scanner Glass Window */}
          <group position={[-0.2, 1.07, 0.3]}>
            <mesh>
              <boxGeometry args={[0.35, 0.01, 0.35]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.7} />
            </mesh>
            {/* Red Laser Scanning Beam Line */}
            <mesh ref={cIdx === 1 ? laserRef : null} position={[0, 0.02, 0]}>
              <boxGeometry args={[0.3, 0.01, 0.04]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
            </mesh>
          </group>

          {/* POS Touchscreen Monitor */}
          <group position={[0.45, 1.35, 0.3]} rotation={[0, -0.4, 0]}>
            {/* Monitor Stand */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Monitor Screen Frame */}
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.35, 0.04]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Glowing Screen Content */}
            <mesh position={[0, 0, 0.025]}>
              <planeGeometry args={[0.46, 0.31]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
            <Text
              position={[0, 0.04, 0.03]}
              fontSize={0.045}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {`MARTVERSE POS\nCOUNTER ${cIdx + 1}\n${phase === 'scanning' ? 'SCANNING...' : 'READY'}`}
            </Text>
          </group>

          {/* Payment Card Terminal / Pinpad */}
          <group position={[0.45, 1.08, -0.4]} rotation={[0.2, -0.2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.16, 0.04, 0.22]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.025, -0.04]}>
              <planeGeometry args={[0.12, 0.08]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          </group>

          {/* Bagging Zone (Martverse Green Shopping Bags) */}
          <group position={[-0.2, 1.15, 1.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.3, 0.25]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
            <Text
              position={[0, 0, 0.13]}
              fontSize={0.05}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              MARTVERSE
            </Text>
          </group>
        </group>
      ))}

      {/* Floor Guidance Line to Billing */}
      <mesh position={[0, 0.01, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 0.3]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      <Text
        position={[0, 0.02, -3]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
      >
        {'>>> QUEUE FOR BILLING >>>'}
      </Text>
    </group>
  );
};
