'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pre-allocated static geometries & materials for dust motes
const dustGeo = new THREE.SphereGeometry(0.012, 6, 6);
const dustMat = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
});

export const AmbientStoreLife: React.FC = React.memo(() => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const flickerLightRef = useRef<THREE.PointLight>(null);
  const lastFlickerTime = useRef(0);

  const DUST_COUNT = 70;

  // Initialize random particle positions & velocities within store shopping concourses
  const particles = useMemo(() => {
    return Array.from({ length: DUST_COUNT }, () => ({
      x: (Math.random() - 0.5) * 56, // X spread: [-28, 28]
      y: 0.8 + Math.random() * 3.6,   // Y spread: [0.8, 4.4]
      z: -26 + Math.random() * 52,   // Z spread: [-26, 26]
      speedY: 0.04 + Math.random() * 0.08,
      driftX: (Math.random() - 0.5) * 0.05,
      driftZ: (Math.random() - 0.5) * 0.05,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    particles.forEach((p, idx) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles]);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    // 1. Gentle dust drift in light beams
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      const dt = Math.min(delta, 0.05);

      particles.forEach((p, idx) => {
        p.y += p.speedY * dt;
        p.x += Math.sin(elapsed * 0.8 + p.phase) * 0.01 * dt + p.driftX * dt;
        p.z += Math.cos(elapsed * 0.7 + p.phase) * 0.01 * dt + p.driftZ * dt;

        // Wrap around height
        if (p.y > 4.5) {
          p.y = 0.8;
          p.x = (Math.random() - 0.5) * 56;
          p.z = -26 + Math.random() * 52;
        }

        dummy.position.set(p.x, p.y, p.z);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Subtle tube light flicker simulation (occurs briefly every 14-18 seconds for realistic store atmosphere)
    if (flickerLightRef.current) {
      const cycle = elapsed % 16.0;
      if (cycle > 12.0 && cycle < 12.18) {
        // Quick 180ms micro-fluctuation
        const flicker = 0.35 + Math.sin(elapsed * 45) * 0.35;
        flickerLightRef.current.intensity = flicker;
      } else {
        flickerLightRef.current.intensity = 0.85;
      }
    }
  });

  return (
    <group raycast={() => null}>
      {/* Floating Ambient Dust Motes */}
      <instancedMesh
        ref={meshRef}
        args={[dustGeo, dustMat, DUST_COUNT]}
        raycast={() => null}
      />

      {/* Atmospheric Warm Tube Light (Aisle 3 overhead) with subtle life */}
      <pointLight
        ref={flickerLightRef}
        position={[-12, 5.0, 0]}
        intensity={0.85}
        distance={14}
        color="#fffbeb"
      />
    </group>
  );
});
AmbientStoreLife.displayName = 'AmbientStoreLife';
