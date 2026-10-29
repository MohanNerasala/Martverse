'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useCartStore } from '@/store/useCartStore';

interface ExitGateProps {
  position: [number, number, number];
}

export const ExitGate3D: React.FC<ExitGateProps> = ({ position }) => {
  const isPaid = useCartStore((state) => state.isPaid);
  const items = useCartStore((state) => state.items);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  const canExit = items.length === 0 || isPaid;

  useFrame((_, delta) => {
    // Smooth gate swing/slide open if allowed
    const targetAngle = canExit ? 1.2 : 0;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.y = THREE.MathUtils.damp(
        leftWingRef.current.rotation.y,
        targetAngle,
        4,
        delta
      );
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.y = THREE.MathUtils.damp(
        rightWingRef.current.rotation.y,
        -targetAngle,
        4,
        delta
      );
    }
  });

  return (
    <group position={position}>
      {/* Overhead Exit Archway Banner */}
      <group position={[0, 3.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.2, 0.7, 0.2]} />
          <meshStandardMaterial color={canExit ? '#16a34a' : '#b91c1c'} roughness={0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {canExit ? '✓ THANK YOU FOR SHOPPING • EXIT' : '⛔ UNPAID CART • PAY AT BILLING'}
        </Text>
      </group>

      {/* Security Pedestals (Left and Right RFID scanners) */}
      {[-1.8, 1.8].map((xOffset, idx) => (
        <group key={`rfid-${idx}`} position={[xOffset, 0, 0]}>
          {/* Main Pedestal Pillar */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[0.15, 2.2, 0.45]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Status Indicator Light on top */}
          <mesh position={[0, 2.25, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color={canExit ? '#22c55e' : '#ef4444'} />
          </mesh>
        </group>
      ))}

      {/* Glass Turnstile Center Island */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 1.0, 0.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Left Glass Swing Barrier */}
      <group position={[-0.15, 0.6, 0]}>
        <mesh ref={leftWingRef} position={[-0.6, 0, 0]}>
          <boxGeometry args={[1.1, 0.7, 0.04]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Right Glass Swing Barrier */}
      <group position={[0.15, 0.6, 0]}>
        <mesh ref={rightWingRef} position={[0.6, 0, 0]}>
          <boxGeometry args={[1.1, 0.7, 0.04]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};
