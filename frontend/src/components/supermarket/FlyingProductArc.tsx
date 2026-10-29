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
  const duration = anim.duration || 950;
  const productColor = anim.color || '#3b82f6';

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = Date.now() - anim.createdAt;
    const t = Math.min(1, Math.max(0, elapsed / duration));

    const [sx, sy, sz] = anim.startPos;
    // Target basket center inside the shopping trolley
    const tx = trolleyPos[0];
    const ty = trolleyPos[1] + 0.65;
    const tz = trolleyPos[2] + 0.05;

    // Smooth horizontal position with cubic easing
    const p = easeInOutCubic(t);
    const x = sx + (tx - sx) * p;
    const z = sz + (tz - sz) * p;

    // Realistic multi-stage vertical physics:
    // 1. Smooth lift off shelf (0.0 -> 0.30)
    // 2. High aerial glide towards trolley (0.30 -> 0.70)
    // 3. Gravitational basket drop (0.70 -> 0.94)
    // 4. Elastic landing settle (0.94 -> 1.0)
    let y: number;
    let scaleY = 1.0;
    let scaleXZ = 1.0;
    const highY = Math.max(sy, ty) + 1.6;

    if (t < 0.30) {
      const liftT = t / 0.30;
      const smoothLift = Math.sin(liftT * Math.PI * 0.5);
      y = sy + (highY - sy) * smoothLift;
    } else if (t < 0.70) {
      const glideT = (t - 0.30) / 0.40;
      y = highY + Math.sin(glideT * Math.PI) * 0.25;
    } else if (t < 0.94) {
      const dropT = (t - 0.70) / 0.24;
      // Accelerated gravitational drop curve
      const fallCurve = Math.pow(dropT, 2.0);
      y = highY - (highY - ty) * fallCurve;
      scaleY = 1.0 + Math.sin(dropT * Math.PI) * 0.15;
      scaleXZ = 1.0 - Math.sin(dropT * Math.PI) * 0.08;
    } else {
      // Elastic settle upon entering basket
      const bounceT = (t - 0.94) / 0.06;
      const bounceHeight = Math.sin(bounceT * Math.PI) * 0.08;
      y = ty + bounceHeight;
      scaleY = 1.0 - Math.sin(bounceT * Math.PI) * 0.12;
      scaleXZ = 1.0 + Math.sin(bounceT * Math.PI) * 0.08;
    }

    groupRef.current.position.set(x, y, z);
    groupRef.current.scale.set(scaleXZ, scaleY, scaleXZ);

    // Natural item tumbling in flight that aligns as it drops into the basket
    if (t < 0.72) {
      groupRef.current.rotation.x = Math.sin(t * Math.PI * 2) * 1.2;
      groupRef.current.rotation.y = t * Math.PI * 2.5;
      groupRef.current.rotation.z = Math.cos(t * Math.PI * 2) * 0.6;
    } else {
      const settleT = (t - 0.72) / 0.28;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, settleT);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, settleT);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, settleT);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Real 3D Product Mesh in Genuine Product Color (No Glassy Aura) */}
      {anim.modelType === 'bottle' ? (
        <group position={[0, -0.05, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.24, 16]} />
            <meshStandardMaterial
              color={productColor}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      ) : anim.modelType === 'shirt' || anim.modelType === 'hanger' ? (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.08, 0.24]} />
            <meshStandardMaterial
              color={productColor}
              roughness={0.7}
            />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.18, 0.01, 0.06]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
        </group>
      ) : (
        /* Box / Package (Atta, Cereals, Biscuits, Chocolates, Staples) */
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.22, 0.16]} />
            <meshStandardMaterial
              color={productColor}
              roughness={0.3}
              metalness={0.05}
            />
          </mesh>
          {/* Front Clean Product Label Badge */}
          <mesh position={[0, 0, 0.082]}>
            <planeGeometry args={[0.17, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
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
