'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlyAnimation, useCartStore } from '@/store/useCartStore';

interface FlyingArcsProps {
  trolleyPos: [number, number, number];
}

// EaseInOutCubic function for buttery smooth translation
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const SingleFlyArc: React.FC<{ anim: FlyAnimation; trolleyPos: [number, number, number] }> = ({
  anim,
  trolleyPos,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const duration = anim.duration || 1100;

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = Date.now() - anim.createdAt;
    const t = Math.min(1, Math.max(0, elapsed / duration));

    const [sx, sy, sz] = anim.startPos;
    // Target basket center inside the shopping trolley
    const tx = trolleyPos[0];
    const ty = trolleyPos[1] + 0.65;
    const tz = trolleyPos[2] + 0.05;

    // Smooth horizontal position
    const p = easeInOutCubic(t);
    const x = sx + (tx - sx) * p;
    const z = sz + (tz - sz) * p;

    // Realistic multi-stage vertical physics:
    // 1. Lift & float up (0.0 -> 0.35)
    // 2. High aerial glide (0.35 -> 0.70)
    // 3. Gravitational basket drop (0.70 -> 0.95)
    // 4. Elastic landing micro-bounce (0.95 -> 1.0)
    let y: number;
    let scaleY = 1.0;
    let scaleXZ = 1.0;
    const highY = Math.max(sy, ty) + 1.8;

    if (t < 0.35) {
      const liftT = t / 0.35;
      const smoothLift = Math.sin(liftT * Math.PI * 0.5);
      y = sy + (highY - sy) * smoothLift;
    } else if (t < 0.70) {
      const glideT = (t - 0.35) / 0.35;
      y = highY + Math.sin(glideT * Math.PI) * 0.35;
    } else if (t < 0.95) {
      const dropT = (t - 0.70) / 0.25;
      // Accelerated gravitational drop curve
      const fallCurve = Math.pow(dropT, 2.2);
      y = highY - (highY - ty) * fallCurve;
      // Subtle vertical stretching during drop
      scaleY = 1.0 + Math.sin(dropT * Math.PI) * 0.2;
      scaleXZ = 1.0 - Math.sin(dropT * Math.PI) * 0.1;
    } else {
      // Elastic bounce upon hitting basket
      const bounceT = (t - 0.95) / 0.05;
      const bounceHeight = Math.sin(bounceT * Math.PI) * 0.12;
      y = ty + bounceHeight;
      // Squash and stretch
      scaleY = 1.0 - Math.sin(bounceT * Math.PI) * 0.2;
      scaleXZ = 1.0 + Math.sin(bounceT * Math.PI) * 0.12;
    }

    groupRef.current.position.set(x, y, z);
    groupRef.current.scale.set(scaleXZ * 1.1, scaleY * 1.1, scaleXZ * 1.1);

    // Smooth rotational tumbling in air that aligns as it drops into the basket
    if (t < 0.75) {
      groupRef.current.rotation.x = Math.sin(t * Math.PI * 2) * 1.4;
      groupRef.current.rotation.y = t * Math.PI * 3;
      groupRef.current.rotation.z = Math.cos(t * Math.PI * 2) * 0.8;
    } else {
      // Smoothly upright for settling in the trolley
      const settleT = (t - 0.75) / 0.25;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, settleT);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, settleT);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, settleT);
    }

    // Pulse the glassy halo aura
    if (glowRef.current) {
      const glowScale = 1.0 + Math.sin(t * Math.PI * 6) * 0.15;
      glowRef.current.scale.set(glowScale, glowScale, glowScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic Icy-Blue Ambient Point Light */}
      <pointLight color="#38bdf8" intensity={1.8} distance={3.0} decay={2} />

      {/* Floating Glassy Aura Sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#38bdf8"
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Floating 3D Item Geometry based on modelType */}
      {anim.modelType === 'bottle' ? (
        <group position={[0, -0.05, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.24, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.35}
              roughness={0.1}
              metalness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>
      ) : anim.modelType === 'shirt' || anim.modelType === 'hanger' ? (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.08, 0.24]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#2563eb"
              emissiveIntensity={0.3}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.18, 0.01, 0.06]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>
      ) : (
        /* Box / Package (Cartons, Cereals, Biscuits, Staples) */
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.22, 0.16]} />
            <meshStandardMaterial
              color="#f8fafc"
              emissive="#38bdf8"
              emissiveIntensity={0.4}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          {/* Cyan/Blue Brand Ribbon */}
          <mesh position={[0, 0, 0.082]}>
            <planeGeometry args={[0.18, 0.08]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      )}

      {/* Floating Trailing Particle Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.012, 8, 24]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.65} />
      </mesh>
    </group>
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
