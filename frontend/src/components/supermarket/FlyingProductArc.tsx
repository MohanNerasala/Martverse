'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlyAnimation, useCartStore } from '@/store/useCartStore';

interface FlyingArcsProps {
  trolleyPos: [number, number, number];
}

const SingleFlyArc: React.FC<{ anim: FlyAnimation; trolleyPos: [number, number, number] }> = ({
  anim,
  trolleyPos,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const duration = 750; // ms

  useFrame(() => {
    if (!meshRef.current) return;
    const elapsed = Date.now() - anim.createdAt;
    const t = Math.min(1, Math.max(0, elapsed / duration));

    // Parabolic arc formula
    const x = anim.startPos[0] + (trolleyPos[0] - anim.startPos[0]) * t;
    const z = anim.startPos[2] + (trolleyPos[2] - anim.startPos[2]) * t;
    const linearY = anim.startPos[1] + (trolleyPos[1] - anim.startPos[1]) * t;
    const arcHeight = Math.sin(t * Math.PI) * 1.5;
    const y = linearY + arcHeight;

    meshRef.current.position.set(x, y, z);
    meshRef.current.rotation.x = t * Math.PI * 4;
    meshRef.current.rotation.y = t * Math.PI * 3;

    const scale = 1 - t * 0.3;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial
        color={anim.color}
        emissive={anim.color}
        emissiveIntensity={0.4}
        roughness={0.3}
      />
    </mesh>
  );
};

export const FlyingProductArc: React.FC<FlyingArcsProps> = ({ trolleyPos }) => {
  const flyAnimations = useCartStore((state) => state.flyAnimations);

  return (
    <group>
      {flyAnimations.map((anim) => (
        <SingleFlyArc key={anim.id} anim={anim} trolleyPos={trolleyPos} />
      ))}
    </group>
  );
};
