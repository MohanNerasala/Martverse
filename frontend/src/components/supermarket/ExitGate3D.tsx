'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCartStore } from '@/store/useCartStore';

interface ExitGateProps {
  position: [number, number, number];
}

const ExitGate3DComponent: React.FC<ExitGateProps> = ({ position }) => {
  const canExit = useCartStore((state) => state.items.length === 0 || state.isPaid);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Smooth gate swing/slide open if allowed
    const targetAngle = canExit ? 1.2 : 0;
    if (leftWingRef.current && Math.abs(leftWingRef.current.rotation.y - targetAngle) > 0.002) {
      leftWingRef.current.rotation.y = THREE.MathUtils.damp(
        leftWingRef.current.rotation.y,
        targetAngle,
        6,
        delta
      );
    }
    if (rightWingRef.current && Math.abs(rightWingRef.current.rotation.y - (-targetAngle)) > 0.002) {
      rightWingRef.current.rotation.y = THREE.MathUtils.damp(
        rightWingRef.current.rotation.y,
        -targetAngle,
        6,
        delta
      );
    }
  });

  return (
    <group position={position}>
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

export const ExitGate3D = React.memo(ExitGate3DComponent);
