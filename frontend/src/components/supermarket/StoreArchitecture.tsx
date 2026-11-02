'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Procedural seamless commercial supermarket vitrified porcelain tile textures
interface VitrifiedTileSet {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

let tileTexturesCache: VitrifiedTileSet | null = null;

function getVitrifiedTileTextures(): VitrifiedTileSet {
  if (tileTexturesCache) return tileTexturesCache;
  if (typeof document === 'undefined') {
    const dummy = new THREE.CanvasTexture({} as HTMLCanvasElement);
    return { map: dummy, roughnessMap: dummy, bumpMap: dummy };
  }

  const S = 1024;
  const HALF = S / 2; // 512

  // 1. Diffuse / Albedo Map Canvas (Alternating porcelain tiles, grout seams, micro-terrazzo flecks)
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  // 2. Specular / Roughness Map Canvas (Glossy tile body, matte grout)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = S;
  rCanvas.height = S;
  const rCtx = rCanvas.getContext('2d')!;

  // 3. 3D Bump / Height Map Canvas (Recessed grout depth and beveled edges)
  const bCanvas = document.createElement('canvas');
  bCanvas.width = S;
  bCanvas.height = S;
  const bCtx = bCanvas.getContext('2d')!;

  // Default clean grout background (subtle light slate #cbd5e1)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, S, S);

  rCtx.fillStyle = '#64748b'; // Matte grout (roughness ~0.7)
  rCtx.fillRect(0, 0, S, S);

  bCtx.fillStyle = '#505050'; // Recessed grout depth
  bCtx.fillRect(0, 0, S, S);

  // 2x2 Large-Format Commercial Vitrified Porcelain Tiles with Subtle Warm Tones (800x800mm D-Mart/Smart Bazaar style)
  const tileBounds = [
    { x: 0, y: 0, tone: '#fdfdfd' },       // Warm Pearl-Ivory porcelain
    { x: HALF, y: 0, tone: '#f8fafc' },   // Pristine Light-Grey porcelain
    { x: 0, y: HALF, tone: '#f8fafc' },   // Pristine Light-Grey porcelain
    { x: HALF, y: HALF, tone: '#fdfdfd' }, // Warm Pearl-Ivory porcelain
  ];

  tileBounds.forEach(({ x, y, tone }) => {
    // Tile base fill with 2.5mm subtle grout spacing (3px in 1024 texture)
    ctx.fillStyle = tone;
    ctx.fillRect(x + 3, y + 3, HALF - 6, HALF - 6);

    // Bump map: raised tile
    bCtx.fillStyle = '#c8c8c8';
    bCtx.fillRect(x + 3, y + 3, HALF - 6, HALF - 6);

    // Roughness map: high gloss for tile
    rCtx.fillStyle = '#1e1e1e'; // 0.12 roughness
    rCtx.fillRect(x + 3, y + 3, HALF - 6, HALF - 6);

    // Natural subtle porcelain cloud veining (ultra low-contrast realistic stone look)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 3, y + 3, HALF - 6, HALF - 6);
    ctx.clip();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x + 40, y + HALF - 50);
    ctx.bezierCurveTo(x + 150, y + 260, x + 320, y + 150, x + HALF - 40, y + 50);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.08)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + 90, y + HALF - 20);
    ctx.bezierCurveTo(x + 200, y + 320, x + 280, y + 190, x + HALF - 90, y + 100);
    ctx.stroke();

    // Micro-crystalline quartz & granite flecks (subtle, non-distracting)
    for (let i = 0; i < 90; i++) {
      const rx = x + 4 + ((i * 47) % (HALF - 8));
      const ry = y + 4 + ((i * 79) % (HALF - 8));
      const rw = 1.5;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(148, 163, 184, 0.09)' : 'rgba(203, 213, 225, 0.12)';
      ctx.fillRect(rx, ry, rw, rw);
    }
    ctx.restore();

    // Soft porcelain tile edge bevel (highlights directional lighting)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 3, y + 3, HALF - 6, HALF - 6);
  });

  // Architectural 2mm Low-Contrast Grout Lines (Fine 2px-3px width on 1024 canvas; NO black lines!)
  const drawGroutLine = (x1: number, y1: number, x2: number, y2: number) => {
    // 1. Subtle, low-contrast grout seam in soft light-grey (matches Kajaria/Somany commercial installations)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Roughness: Slightly matte grout seam vs polished porcelain body
    rCtx.strokeStyle = '#475569';
    rCtx.lineWidth = 2.5;
    rCtx.beginPath();
    rCtx.moveTo(x1, y1);
    rCtx.lineTo(x2, y2);
    rCtx.stroke();

    // Bump: Barely recessed seam (retains perfectly flat floor feel, eliminates graph-paper grids)
    bCtx.strokeStyle = '#767676';
    bCtx.lineWidth = 2.0;
    bCtx.beginPath();
    bCtx.moveTo(x1, y1);
    bCtx.lineTo(x2, y2);
    bCtx.stroke();
  };

  // Center intersecting grout lines
  drawGroutLine(HALF, 0, HALF, S);
  drawGroutLine(0, HALF, S, HALF);

  // Outer tile repeat seams
  drawGroutLine(0, 0, 0, S);
  drawGroutLine(S, 0, S, S);
  drawGroutLine(0, 0, S, 0);
  drawGroutLine(0, S, S, S);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(45, 45); // Generates standard 800x800mm tiles across 72x72m floor
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(45, 45);
  roughnessMap.generateMipmaps = true;
  roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
  roughnessMap.magFilter = THREE.LinearFilter;
  roughnessMap.anisotropy = 16;

  const bumpMap = new THREE.CanvasTexture(bCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(45, 45);
  bumpMap.generateMipmaps = true;
  bumpMap.minFilter = THREE.LinearMipmapLinearFilter;
  bumpMap.magFilter = THREE.LinearFilter;
  bumpMap.anisotropy = 16;

  tileTexturesCache = { map: texture, roughnessMap, bumpMap };
  return tileTexturesCache;
}

// Pre-allocated static materials and geometries to eliminate GPU pipeline re-compilations
const sharedMaterials = {
  wall: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 }),
  slab: new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    emissive: new THREE.Color('#f1f5f9'),
    emissiveIntensity: 0.52,
    roughness: 0.6,
  }),
  ceilingBeam: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: new THREE.Color('#f8fafc'),
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.1,
  }),
  ceilingLight: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 1.5,
  }),
  glassRail: new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.4, roughness: 0.1 }),
  escalatorBase: new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7, roughness: 0.3 }),
  escalatorSteps: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8 }),
  yellowLine: new THREE.MeshBasicMaterial({ color: '#facc15' }),
  escalatorGlass: new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.5, roughness: 0.1 }),
  pillarConcrete: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.25, metalness: 0.1 }),
  hazardStrip: new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.4 }),
  hazardBlack: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 }),
  roof: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9 }),
  basketRed: new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3 }),
  basketBlue: new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.3 }),
  basketChrome: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.1 }),
  bannerGold: new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.3, metalness: 0.2 }),
  bannerGreen: new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.3, metalness: 0.2 }),
  cameraDome: new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.1, metalness: 0.8 }),
  baseboard: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85 }),
  cctvLed: new THREE.MeshBasicMaterial({ color: '#22c55e' }),
};

const sharedGeos = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  light1: new THREE.BoxGeometry(0.3, 0.08, 4.0),
  light2: new THREE.BoxGeometry(0.3, 0.08, 6.0),
};

// Cache for baked high-resolution promotional pillar poster textures
const pillarPosterCache = new Map<string, THREE.CanvasTexture>();

function getPillarPosterTexture(titleText: string, subText: string, badgeText: string, badgeColor: string): THREE.CanvasTexture {
  const key = `${titleText}_${badgeText}_${badgeColor}`;
  let tex = pillarPosterCache.get(key);
  if (tex) return tex;
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Pure White Poster Surface
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 1024);

  // Sleek Commercial Border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 500, 1012);

  // Top Retail Offer Badge Pill
  ctx.fillStyle = badgeColor;
  ctx.beginPath();
  ctx.roundRect(40, 48, 432, 100, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, 256, 98);

  // Main Headline
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 46px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = titleText.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 256, 260 + i * 65);
  });

  // Clean Separator
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(80, 470);
  ctx.lineTo(432, 470);
  ctx.stroke();

  // Subtext
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = subText.split(' ');
  let l1 = '';
  let l2 = '';
  words.forEach((w) => {
    if ((l1 + ' ' + w).length < 26) l1 += (l1 ? ' ' : '') + w;
    else l2 += (l2 ? ' ' : '') + w;
  });
  ctx.fillText(l1, 256, 560);
  if (l2) ctx.fillText(l2, 256, 620);

  tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  pillarPosterCache.set(key, tex);
  return tex;
}

// Reusable D-Mart inspired promotional concrete pillar with baked poster texture (0 extra draw calls)
const SupermarketPillar: React.FC<{
  position: [number, number, number];
  titleText: string;
  subText: string;
  badgeText: string;
  badgeColor?: string;
}> = React.memo(({ position, titleText, subText, badgeText, badgeColor = '#0284c7' }) => {
  const posterTex = useMemo(
    () => getPillarPosterTexture(titleText, subText, badgeText, badgeColor),
    [titleText, subText, badgeText, badgeColor]
  );
  const posterMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.3 }),
    [posterTex]
  );

  return (
    <group position={position}>
      {/* Heavy-Duty Structural Column */}
      <mesh position={[0, 2.5, 0]} geometry={sharedGeos.box} scale={[0.74, 5.0, 0.74]} material={sharedMaterials.pillarConcrete} />

      {/* Yellow & Black Safety Hazard Impact Bumper Base (0.48m high) */}
      <mesh position={[0, 0.24, 0]} geometry={sharedGeos.box} scale={[0.76, 0.48, 0.76]} material={sharedMaterials.hazardStrip} />

      {/* D-Mart Promotional Wrap Poster Panel facing North (-Z) */}
      <mesh position={[0, 2.4, -0.375]} geometry={sharedGeos.box} scale={[0.66, 1.6, 0.01]} material={posterMat} />

      {/* Promotional Wrap Poster Panel facing South (+Z) */}
      <mesh position={[0, 2.4, 0.375]} rotation={[0, Math.PI, 0]} geometry={sharedGeos.box} scale={[0.66, 1.6, 0.01]} material={posterMat} />
    </group>
  );
});
SupermarketPillar.displayName = 'SupermarketPillar';

// Chrome rolling hand basket stack station
const BasketStackStation: React.FC<{ position: [number, number, number]; color: 'red' | 'blue' }> = React.memo(({ position, color }) => {
  const basketMat = color === 'red' ? sharedMaterials.basketRed : sharedMaterials.basketBlue;
  return (
    <group position={position}>
      {/* Chrome Base Frame on Wheels */}
      <mesh position={[0, 0.08, 0]} geometry={sharedGeos.box} scale={[0.48, 0.04, 0.38]} material={sharedMaterials.basketChrome} />
      {/* Chrome Wire Guides */}
      <mesh position={[-0.22, 0.55, 0]} geometry={sharedGeos.cyl} scale={[0.008, 0.9, 0.008]} material={sharedMaterials.basketChrome} />
      <mesh position={[0.22, 0.55, 0]} geometry={sharedGeos.cyl} scale={[0.008, 0.9, 0.008]} material={sharedMaterials.basketChrome} />
      {/* High-Fidelity Stack of Hand Baskets */}
      <mesh position={[0, 0.50, 0]} geometry={sharedGeos.box} scale={[0.42, 0.76, 0.32]} material={basketMat} />
      {/* Chrome Top Handle */}
      <mesh position={[0, 0.92, 0]} geometry={sharedGeos.box} scale={[0.38, 0.04, 0.04]} material={sharedMaterials.basketChrome} />
    </group>
  );
});
BasketStackStation.displayName = 'BasketStackStation';

// Modern Commercial Clip-In Modular Ceiling Network (Clean White/Off-White Finishes, Flush LED Troffers, Thin High Services)
const CommercialCeilingServices: React.FC = React.memo(() => {
  // Thin high electrical raceway conduits (slim painted off-white rails flush at y = 5.14)
  const conduitX = [-20, -10, 0, 10, 20];
  const sprinklersRef = useRef<THREE.InstancedMesh>(null);

  const sprinklerCoords = useMemo(() => {
    const list: [number, number][] = [];
    const sprinklerZ = [-26, -18, -10, -2, 6, 14, 22, 30];
    const sprinklerX = [-24, -16, -8, 0, 8, 16, 24];
    sprinklerZ.forEach((sz) => {
      sprinklerX.forEach((sx) => {
        list.push([sx, sz]);
      });
    });
    return list;
  }, []);

  useEffect(() => {
    if (!sprinklersRef.current) return;
    const dummy = new THREE.Object3D();
    sprinklerCoords.forEach(([sx, sz], idx) => {
      dummy.position.set(sx, 5.18, sz);
      dummy.scale.set(0.064, 0.008, 0.064);
      dummy.updateMatrix();
      sprinklersRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    sprinklersRef.current.instanceMatrix.needsUpdate = true;
  }, [sprinklerCoords]);

  return (
    <group raycast={() => null}>
      {/* High Slim White Painted Utility Conduits (No thick black ducts!) */}
      {conduitX.map((cx, idx) => (
        <group key={`conduit-${idx}`} position={[cx, 5.14, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 68, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Concealed Fire Safety Sprinkler Escutcheons (1 draw call instead of 56) */}
      <instancedMesh
        ref={sprinklersRef}
        args={[sharedGeos.cyl, sharedMaterials.wall, sprinklerCoords.length]}
        raycast={() => null}
      />
    </group>
  );
});
CommercialCeilingServices.displayName = 'CommercialCeilingServices';

// Commercial Rubber / Vinyl Protective Wall Baseboard Kickplates (72m x 72m)
const PerimeterWallBaseboards: React.FC = React.memo(() => {
  return (
    <group raycast={() => null}>
      {/* Back Wall Kickplate (z = 35.79) */}
      <mesh position={[0, 0.08, 35.79]}>
        <boxGeometry args={[71.6, 0.16, 0.025]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      {/* Front Entrance Wall Kickplates (z = -35.79) */}
      <mesh position={[-21, 0.08, -35.79]}>
        <boxGeometry args={[29.6, 0.16, 0.025]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      <mesh position={[21, 0.08, -35.79]}>
        <boxGeometry args={[29.6, 0.16, 0.025]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      {/* Left Wall Kickplate (x = -35.79) */}
      <mesh position={[-35.79, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.16, 71.6]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      {/* Right Wall Kickplate (x = 35.79) */}
      <mesh position={[35.79, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.16, 71.6]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
    </group>
  );
});
PerimeterWallBaseboards.displayName = 'PerimeterWallBaseboards';

// High-Resolution 360° Surveillance CCTV Dome Cameras
const SecurityDomeCameras: React.FC = React.memo(() => {
  const cameraLocations: [number, number, number][] = [
    [0, 5.08, -26],
    [0, 5.08, 0],
    [0, 5.08, 24],
    [-18, 5.08, -12],
    [18, 5.08, -12],
    [-18, 5.08, 12],
    [18, 5.08, 12],
  ];

  return (
    <group raycast={() => null}>
      {cameraLocations.map(([cx, cy, cz], idx) => (
        <group key={`cctv-${idx}`} position={[cx, cy, cz]}>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.06, 16]} />
            <primitive object={sharedMaterials.pillarConcrete} attach="material" />
          </mesh>
          <mesh position={[0, -0.03, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.09, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={sharedMaterials.cameraDome} attach="material" />
          </mesh>
          <mesh position={[0.07, 0.02, 0.05]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <primitive object={sharedMaterials.cctvLed} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
});
SecurityDomeCameras.displayName = 'SecurityDomeCameras';

// Entrance Shopping Trolley Parking Bays with Chrome Corrals
const EntranceTrolleyParkingBays: React.FC<{ position: [number, number, number] }> = React.memo(({ position }) => {
  return (
    <group position={position} raycast={() => null}>
      {/* Floor Guide Marking Decal */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 5.6]} />
        <meshBasicMaterial color="#1e3a8a" transparent opacity={0.15} />
      </mesh>
      {/* Perimeter Rail Frame (Guide corral) */}
      <mesh position={[-2.1, 0.45, 0]}>
        <boxGeometry args={[0.06, 0.9, 5.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
      </mesh>
      <mesh position={[2.1, 0.45, 0]}>
        <boxGeometry args={[0.06, 0.9, 5.4]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
      </mesh>
      {/* Front Overhead Guidance Signboard */}
      <group position={[0, 1.8, 2.7]}>
        <mesh>
          <boxGeometry args={[3.8, 0.5, 0.04]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <Text position={[0, 0.08, 0.025]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'SHOPPING TROLLEYS'}
        </Text>
        <Text position={[0, -0.12, 0.025]} fontSize={0.08} color="#facc15" anchorX="center" anchorY="middle" fontWeight="bold">
          {'★ CLEANED & SANITIZED FOR YOUR SAFETY ★'}
        </Text>
      </group>
      {/* Nested Chrome Trolley Visuals */}
      {[-1.5, 0, 1.5].map((zOffset, tIdx) => (
        <group key={`nest-trolley-${tIdx}`} position={[0, 0, zOffset]}>
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[1.1, 0.72, 1.3]} />
            <meshStandardMaterial color="#94a3b8" wireframe />
          </mesh>
          <mesh position={[0, 0.88, -0.6]}>
            <cylinderGeometry args={[0.02, 0.02, 1.1, 10]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      ))}
    </group>
  );
});
EntranceTrolleyParkingBays.displayName = 'EntranceTrolleyParkingBays';

// Automatic Sliding Glass Entrance Portal
const GrandStoreEntranceDoors: React.FC = React.memo(() => {
  return (
    <group position={[0, 0, -35.6]} raycast={() => null}>
      {/* Outer Door Frame Posts */}
      <mesh position={[-6.0, 2.2, 0]}>
        <boxGeometry args={[0.2, 4.4, 0.25]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[6.0, 2.2, 0]}>
        <boxGeometry args={[0.2, 4.4, 0.25]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Overhead Automatic Sensor Track */}
      <mesh position={[0, 4.25, 0]}>
        <boxGeometry args={[12.2, 0.3, 0.3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Glass Sliding Door Panels (Fixed & Open Leaves) */}
      {[-4.2, -1.6, 1.6, 4.2].map((xP, pIdx) => (
        <group key={`glass-panel-${pIdx}`} position={[xP, 2.1, 0]}>
          <mesh>
            <boxGeometry args={[2.5, 4.0, 0.04]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} roughness={0.08} metalness={0.15} />
          </mesh>
          {/* Aluminum Frame Border */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.56, 4.06, 0.035]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
          {/* High-Visibility Yellow Safety Decal Bar across Glass */}
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[2.48, 0.12, 0.045]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        </group>
      ))}
    </group>
  );
});
GrandStoreEntranceDoors.displayName = 'GrandStoreEntranceDoors';

const InstancedCommercialTroffers: React.FC = React.memo(() => {
  const framesRef = useRef<THREE.InstancedMesh>(null);
  const panelsRef = useRef<THREE.InstancedMesh>(null);

  const coords = useMemo(() => {
    const list: [number, number][] = [];
    [-25, -15, -5, 5, 15, 25].forEach((xL) => {
      [-25, -15, -5, 5, 15, 25].forEach((zL) => {
        list.push([xL, zL]);
      });
    });
    return list;
  }, []);

  useEffect(() => {
    if (!framesRef.current || !panelsRef.current) return;
    const dummy = new THREE.Object3D();
    coords.forEach(([xL, zL], idx) => {
      // Bezel frame
      dummy.position.set(xL, 5.16, zL);
      dummy.scale.set(0.64, 0.03, 6.04);
      dummy.updateMatrix();
      framesRef.current!.setMatrixAt(idx, dummy.matrix);

      // Emissive panel
      dummy.position.set(xL, 5.145, zL);
      dummy.scale.set(0.56, 0.02, 5.96);
      dummy.updateMatrix();
      panelsRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    framesRef.current.instanceMatrix.needsUpdate = true;
    panelsRef.current.instanceMatrix.needsUpdate = true;
  }, [coords]);

  return (
    <group raycast={() => null}>
      <instancedMesh
        ref={framesRef}
        args={[sharedGeos.box, sharedMaterials.ceilingBeam, coords.length]}
        raycast={() => null}
      />
      <instancedMesh
        ref={panelsRef}
        args={[sharedGeos.box, sharedMaterials.ceilingLight, coords.length]}
        raycast={() => null}
      />
    </group>
  );
});
InstancedCommercialTroffers.displayName = 'InstancedCommercialTroffers';

interface StoreArchitectureProps {
  activeFloor?: number;
}

const StoreArchitectureComponent: React.FC<StoreArchitectureProps> = () => {
  const tileTextures = useMemo(() => getVitrifiedTileTextures(), []);

  return (
    <group>
      {/* ==============================================================
          GROUND FLOOR (y = 0) - MASSIVE 72m x 72m HYPERMARKET FOOTPRINT
          ============================================================== */}
      {/* Ground Floor High-Quality Polished Vitrified Tile Supermarket Flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[72, 72, 1, 1]} />
        <meshStandardMaterial
          map={tileTextures.map}
          roughnessMap={tileTextures.roughnessMap}
          bumpMap={tileTextures.bumpMap}
          bumpScale={0.002}
          roughness={0.14}
          metalness={0.03}
        />
      </mesh>

      {/* Ground Floor Architectural Pristine White Perimeter Walls */}
      {/* Back Wall (z = 36) */}
      <mesh position={[0, 2.6, 36]} geometry={sharedGeos.box} scale={[72, 5.2, 0.4]} material={sharedMaterials.wall} />
      {/* Front Entrance Wall (z = -36) with 12m grand portal opening */}
      <mesh position={[-21, 2.6, -36]} geometry={sharedGeos.box} scale={[30, 5.2, 0.4]} material={sharedMaterials.wall} />
      <mesh position={[21, 2.6, -36]} geometry={sharedGeos.box} scale={[30, 5.2, 0.4]} material={sharedMaterials.wall} />
      {/* Lintel over entrance portal */}
      <mesh position={[0, 4.4, -36]} geometry={sharedGeos.box} scale={[12, 1.6, 0.4]} material={sharedMaterials.wall} />

      {/* --- Grand Entrance Welcome Lightbox Portal: 'WELCOME TO D-MART HYPERMARKET' --- */}
      <group position={[0, 4.35, -35.75]}>
        {/* Sleek Aluminum Framing Rim */}
        <mesh position={[0, 0, -0.015]} geometry={sharedGeos.box} scale={[10.5, 1.1, 0.08]} material={sharedMaterials.slab} />
        {/* Pure White Acrylic Board */}
        <mesh position={[0, 0, 0.015]} geometry={sharedGeos.box} scale={[10.4, 1.0, 0.09]} material={sharedMaterials.wall} />
        {/* Sapphire Accent Header Pill */}
        <mesh position={[0, 0.28, 0.04]} geometry={sharedGeos.box} scale={[5.4, 0.22, 0.01]} material={sharedMaterials.basketBlue} />
        <Text position={[0, 0.28, 0.05]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          D-MART HYPERMARKET
        </Text>
        <Text position={[0, -0.02, 0.045]} fontSize={0.28} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold">
          WELCOME TO MARTVERSE
        </Text>
        <Text position={[0, -0.28, 0.045]} fontSize={0.13} color="#047857" anchorX="center" anchorY="middle" fontWeight="bold">
          ★ UNBEATABLE DAILY SAVINGS • 100% GENUINE QUALITY GUARANTEED ★
        </Text>
      </group>

      {/* Automatic Sliding Glass Entrance Portal */}
      <GrandStoreEntranceDoors />

      {/* Left Wall (x = -36) */}
      <mesh position={[-36, 2.6, 0]} geometry={sharedGeos.box} scale={[0.4, 5.2, 72]} material={sharedMaterials.wall} />
      {/* Right Wall (x = 36) */}
      <mesh position={[36, 2.6, 0]} geometry={sharedGeos.box} scale={[0.4, 5.2, 72]} material={sharedMaterials.wall} />

      {/* Suspended Commercial Ceiling Slab (y = 5.2) */}
      <mesh position={[0, 5.2, 0]} geometry={sharedGeos.box} scale={[72, 0.3, 72]} material={sharedMaterials.slab} />

      {/* Industrial White Steel Ceiling Beams spanning across Ground Floor */}
      {[-28, -20, -12, -4, 4, 12, 20, 28].map((zBeam, i) => (
        <mesh key={`beam-${i}`} position={[0, 5.08, zBeam]} geometry={sharedGeos.box} scale={[72, 0.22, 0.25]} material={sharedMaterials.ceilingBeam} />
      ))}

      {/* ==============================================================
          STRUCTURAL CONCRETE PILLARS (Unobstructed Concourse Placement)
          ============================================================== */}
      {/* Entrance Concourse Columns (z = -22) */}
      <SupermarketPillar
        position={[-16.2, 0, -22]}
        titleText={'D-MART BACHAT BAZAAR\nMAXIMUM SAVINGS'}
        subText="Unbeatable Everyday Low Prices on Groceries & Staples"
        badgeText="EVERYDAY LOW PRICE"
        badgeColor="#dc2626"
      />
      <SupermarketPillar
        position={[16.2, 0, -22]}
        titleText={'FARM DIRECT ORGANICS\n100% PURE & FRESH'}
        subText="Finest Quality Flours, Pure Ghee, Cold-Pressed Oils & Spices"
        badgeText="QUALITY GUARANTEE"
        badgeColor="#059669"
      />

      {/* Checkout Concourse Columns (z = 18) */}
      <SupermarketPillar
        position={[-16.2, 0, 18]}
        titleText={'SUPER SAVER PACKS\nFLAT 20% TO 50% OFF'}
        subText="Special Family Packs • Buy More, Save More Every Day"
        badgeText="SPECIAL VALUE"
        badgeColor="#b45309"
      />
      <SupermarketPillar
        position={[16.2, 0, 18]}
        titleText={'BRAND MEGA OFFERS\nBEST PRICE PROMISE'}
        subText="Top FMCG Brands at India's Lowest Supermarket Rates"
        badgeText="BEST PRICE"
        badgeColor="#0284c7"
      />

      {/* Wing Perimeter Columns (x = +-30, z = 0) */}
      <SupermarketPillar
        position={[-30, 0, 0]}
        titleText={'HOUSEHOLD ESSENTIALS\nCLEAN & HYGIENIC'}
        subText="India's Favorite Fabric Care, Dishwash & Cleaning Brands"
        badgeText="MEGA SAVINGS"
        badgeColor="#7c3aed"
      />
      <SupermarketPillar
        position={[30, 0, 0]}
        titleText={'COLD REFRIGERATION\nCHILLED & REFRESHING'}
        subText="Fresh Milk, Ice Creams, Chilled Sodas & Dairy Delights"
        badgeText="INSTANT CHILL"
        badgeColor="#0284c7"
      />

      {/* ==============================================================
          ENTRANCE TROLLEY PARKING BAYS & HAND BASKET STATIONS
          ============================================================== */}
      <EntranceTrolleyParkingBays position={[-10, 0, -31]} />
      <BasketStackStation position={[9, 0, -31]} color="blue" />
      <BasketStackStation position={[11, 0, -31]} color="red" />

      {/* Clean Commercial Overhead Services (Slim Painted White Conduits & Concealed Sprinklers) */}
      <CommercialCeilingServices />
      <PerimeterWallBaseboards />
      <SecurityDomeCameras />

      {/* 36 Commercial Flush LED Troffer Ceiling Lights (Instanced into 2 draw calls) */}
      <InstancedCommercialTroffers />
    </group>
  );
};

export const StoreArchitecture = React.memo(StoreArchitectureComponent);
