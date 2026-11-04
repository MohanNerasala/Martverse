'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

let cachedWetFloorTexture: THREE.CanvasTexture | null = null;
let cachedSignMaterial: THREE.MeshStandardMaterial | null = null;

function getWetFloorSignMaterial(): THREE.MeshStandardMaterial {
  if (cachedSignMaterial) return cachedSignMaterial;
  if (typeof document === 'undefined') {
    return new THREE.MeshStandardMaterial({ color: '#facc15' });
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Safety Yellow Body
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle edge highlight
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 1012);

    // 2. Black Warning Header Pill
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(32, 50, 448, 110, 16) : ctx.rect(32, 50, 448, 110);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.font = '900 68px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CAUTION', 256, 105);

    // 3. Black Warning Triangle
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(256, 200);
    ctx.lineTo(430, 470);
    ctx.lineTo(82, 470);
    ctx.closePath();
    ctx.fill();

    // Inner Yellow Triangle
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(256, 230);
    ctx.lineTo(405, 455);
    ctx.lineTo(107, 455);
    ctx.closePath();
    ctx.fill();

    // Slipping Figure Graphic
    ctx.fillStyle = '#0f172a';
    // Head
    ctx.beginPath();
    ctx.arc(280, 275, 18, 0, Math.PI * 2);
    ctx.fill();
    // Torso tilted
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(275, 295);
    ctx.lineTo(245, 360);
    ctx.stroke();
    // Legs slipping
    ctx.beginPath();
    ctx.moveTo(245, 360);
    ctx.lineTo(205, 400);
    ctx.lineTo(180, 390);
    ctx.moveTo(245, 360);
    ctx.lineTo(285, 415);
    ctx.lineTo(315, 400);
    ctx.stroke();
    // Arms flailing
    ctx.beginPath();
    ctx.moveTo(265, 315);
    ctx.lineTo(220, 290);
    ctx.moveTo(265, 315);
    ctx.lineTo(320, 310);
    ctx.stroke();
    // Water puddle lines
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(160, 435);
    ctx.lineTo(350, 435);
    ctx.moveTo(190, 445);
    ctx.lineTo(320, 445);
    ctx.stroke();

    // 4. Large Warning Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 68px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WET', 256, 560);
    ctx.fillText('FLOOR', 256, 640);

    // Hindi Warning
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('सावधान! गीला फर्श', 256, 730);

    // Spanish / International
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText('CUIDADO PISO MOJADO', 256, 800);

    // Handle Cutout Outline (at top)
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(176, 18, 160, 22, 11) : ctx.rect(176, 18, 160, 22);
    ctx.fill();
  }

  cachedWetFloorTexture = new THREE.CanvasTexture(canvas);
  cachedWetFloorTexture.colorSpace = THREE.SRGBColorSpace;
  cachedWetFloorTexture.generateMipmaps = true;
  cachedWetFloorTexture.minFilter = THREE.LinearMipmapLinearFilter;
  cachedWetFloorTexture.magFilter = THREE.LinearFilter;
  cachedWetFloorTexture.anisotropy = 8;

  cachedSignMaterial = new THREE.MeshStandardMaterial({
    map: cachedWetFloorTexture,
    roughness: 0.35,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  return cachedSignMaterial;
}

export const WetFloorSign: React.FC<{
  position?: [number, number, number];
  rotationY?: number;
}> = React.memo(({ position = [-12.5, 0, -2.5] as [number, number, number], rotationY = 0.25 }) => {
  const signMat = useMemo(() => getWetFloorSignMaterial(), []);

  const boardW = 0.32;
  const boardH = 0.64;
  const boardD = 0.016;
  const halfAngle = 0.22; // ~12.6 degrees spread
  const hingeY = boardH * Math.cos(halfAngle) - 0.01;

  const posTuple: [number, number, number] = [position[0], position[1], position[2]];

  return (
    <group position={posTuple} rotation={[0, rotationY, 0]} raycast={() => null}>
      {/* Soft Contact Shadow on Floor */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.44]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Folding A-Frame Hinged Center */}
      <group position={[0, hingeY, 0]}>
        {/* Front Board */}
        <group rotation={[halfAngle, 0, 0]}>
          <mesh position={[0, -boardH / 2, 0]} material={signMat}>
            <boxGeometry args={[boardW, boardH, boardD]} />
          </mesh>
        </group>

        {/* Back Board */}
        <group rotation={[-halfAngle, Math.PI, 0]}>
          <mesh position={[0, -boardH / 2, 0]} material={signMat}>
            <boxGeometry args={[boardW, boardH, boardD]} />
          </mesh>
        </group>

        {/* Top Plastic Hinge Pin */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, boardW + 0.01, 12]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
});
WetFloorSign.displayName = 'WetFloorSign';
