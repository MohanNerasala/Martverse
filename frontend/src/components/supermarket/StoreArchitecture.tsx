'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Procedural seamless commercial supermarket tile texture cache
let tileTextureCache: THREE.CanvasTexture | null = null;
function getVitrifiedTileTexture(): THREE.CanvasTexture {
  if (tileTextureCache) return tileTextureCache;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 2x2 vitrified commercial supermarket porcelain tile pattern (pearl off-white)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    // Realistic grout joints (soft warm grey)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(254, 0, 4, 512);
    ctx.fillRect(0, 254, 512, 4);

    // Subtle natural polished porcelain grain variation
    ctx.fillStyle = '#f1f5f9';
    for (let i = 0; i < 48; i++) {
      const rx = (i * 47) % 508;
      const ry = (i * 71) % 508;
      ctx.fillRect(rx, ry, 6, 6);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(36, 36); // Generates realistic 800x800mm tiles across 72x72m floor
  tileTextureCache = texture;
  return texture;
}

// Pre-allocated static materials and geometries to eliminate GPU pipeline re-compilations
const sharedMaterials = {
  wall: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 }),
  slab: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.7 }),
  ceilingBeam: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.35, metalness: 0.2 }),
  ceilingLight: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.95,
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
  acDuct: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.82, roughness: 0.28 }),
  acDiffuser: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.3, roughness: 0.4 }),
  sprinklerPipe: new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.4, metalness: 0.2 }),
  sprinklerBrass: new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.9, roughness: 0.2 }),
  baseboard: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85 }),
  cctvLed: new THREE.MeshBasicMaterial({ color: '#22c55e' }),
};

const sharedGeos = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  light1: new THREE.BoxGeometry(0.3, 0.08, 4.0),
  light2: new THREE.BoxGeometry(0.3, 0.08, 6.0),
};

// Reusable D-Mart inspired promotional concrete pillar
const SupermarketPillar: React.FC<{
  position: [number, number, number];
  titleText: string;
  subText: string;
  badgeText: string;
  badgeColor?: string;
}> = React.memo(({ position, titleText, subText, badgeText, badgeColor = '#0284c7' }) => {
  const badgeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: badgeColor }), [badgeColor]);

  return (
    <group position={position}>
      {/* Heavy-Duty Structural Column */}
      <mesh position={[0, 2.5, 0]} geometry={sharedGeos.box} scale={[0.74, 5.0, 0.74]} material={sharedMaterials.pillarConcrete} />

      {/* Yellow & Black Safety Hazard Impact Bumper Base (0.48m high) */}
      <group position={[0, 0.24, 0]}>
        <mesh geometry={sharedGeos.box} scale={[0.76, 0.48, 0.76]} material={sharedMaterials.hazardStrip} />
        {/* Diagonal black bumper stripes */}
        {[-0.14, 0, 0.14].map((yOff, i) => (
          <mesh key={`hazard-${i}`} position={[0, yOff, 0]} geometry={sharedGeos.box} scale={[0.77, 0.04, 0.77]} material={sharedMaterials.hazardBlack} />
        ))}
      </group>

      {/* D-Mart Promotional Wrap Poster Panel facing North (-Z) */}
      <group position={[0, 2.4, -0.38]}>
        {/* White Signboard Backing */}
        <mesh geometry={sharedGeos.box} scale={[0.66, 1.6, 0.02]} material={sharedMaterials.wall} />
        {/* Promotional Header Badge */}
        <mesh position={[0, 0.62, 0.015]} geometry={sharedGeos.box} scale={[0.56, 0.18, 0.01]} material={badgeMat} />
        <Text position={[0, 0.62, 0.025]} fontSize={0.068} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {badgeText}
        </Text>
        {/* Main Title */}
        <Text position={[0, 0.28, 0.02]} fontSize={0.082} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold" maxWidth={0.6}>
          {titleText}
        </Text>
        {/* Subtitle */}
        <Text position={[0, -0.15, 0.02]} fontSize={0.052} color="#475569" anchorX="center" anchorY="middle" fontWeight="semibold" maxWidth={0.58}>
          {subText}
        </Text>
      </group>

      {/* Promotional Wrap Poster Panel facing South (+Z) */}
      <group position={[0, 2.4, 0.38]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={sharedGeos.box} scale={[0.66, 1.6, 0.02]} material={sharedMaterials.wall} />
        <mesh position={[0, 0.62, 0.015]} geometry={sharedGeos.box} scale={[0.56, 0.18, 0.01]} material={badgeMat} />
        <Text position={[0, 0.62, 0.025]} fontSize={0.068} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {badgeText}
        </Text>
        <Text position={[0, 0.28, 0.02]} fontSize={0.082} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold" maxWidth={0.6}>
          {titleText}
        </Text>
        <Text position={[0, -0.15, 0.02]} fontSize={0.052} color="#475569" anchorX="center" anchorY="middle" fontWeight="semibold" maxWidth={0.58}>
          {subText}
        </Text>
      </group>
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
      {/* 4 Rolling Casters */}
      {[-0.2, 0.2].map((cx, i) =>
        [-0.15, 0.15].map((cz, j) => (
          <mesh key={`wheel-${i}-${j}`} position={[cx, 0.03, cz]} geometry={sharedGeos.cyl} scale={[0.025, 0.04, 0.025]} material={sharedMaterials.hazardBlack} />
        ))
      )}
      {/* Vertical Chrome Retaining Wire Guides */}
      {[-0.22, 0.22].map((gx, i) => (
        <mesh key={`guide-${i}`} position={[gx, 0.55, 0]} geometry={sharedGeos.cyl} scale={[0.008, 0.9, 0.008]} material={sharedMaterials.basketChrome} />
      ))}
      {/* Stack of 8 Nesting Plastic Baskets */}
      {Array.from({ length: 8 }).map((_, bIdx) => (
        <group key={`basket-${bIdx}`} position={[0, 0.16 + bIdx * 0.08, 0]}>
          <mesh geometry={sharedGeos.box} scale={[0.42, 0.12, 0.32]} material={basketMat} />
          {/* Black fold-down handle */}
          <mesh position={[0, 0.07, 0]} geometry={sharedGeos.box} scale={[0.38, 0.015, 0.02]} material={sharedMaterials.hazardBlack} />
        </group>
      ))}
    </group>
  );
});
BasketStackStation.displayName = 'BasketStackStation';

// Industrial Open Ceiling Galvanized Spiral HVAC Ducts & Diffusers
const IndustrialHvacSystem: React.FC = React.memo(() => {
  const ductXPositions = [-16, 0, 16];
  const diffuserZPositions = [-26, -18, -10, -2, 6, 14, 22, 30];

  return (
    <group raycast={() => null}>
      {ductXPositions.map((xDuct, dIdx) => (
        <group key={`hvac-run-${dIdx}`} position={[xDuct, 4.80, 0]}>
          {/* Main Spiral Air Duct Cylindrical Trunk */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 64, 16]} />
            <primitive object={sharedMaterials.acDuct} attach="material" />
          </mesh>

          {/* Galvanized Suspension Hangers from Ceiling Slab */}
          {[-28, -20, -12, -4, 4, 12, 20, 28].map((zH, hIdx) => (
            <group key={`hanger-${hIdx}`} position={[0, 0.22, zH]}>
              <mesh>
                <cylinderGeometry args={[0.01, 0.01, 0.44, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Duct Collar Ring */}
              <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.25, 0.015, 8, 16]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Drop Air Supply Diffusers with Louver Grilles */}
          {diffuserZPositions.map((zDiff, dfIdx) => (
            <group key={`diff-${dfIdx}`} position={[0, -0.24, zDiff]}>
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 0.16, 12]} />
                <primitive object={sharedMaterials.acDuct} attach="material" />
              </mesh>
              <mesh position={[0, -0.09, 0]}>
                <boxGeometry args={[0.48, 0.03, 0.48]} />
                <primitive object={sharedMaterials.acDiffuser} attach="material" />
              </mesh>
              <mesh position={[0, -0.11, 0]}>
                <boxGeometry args={[0.38, 0.01, 0.38]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
});
IndustrialHvacSystem.displayName = 'IndustrialHvacSystem';

// Mandatory Fire Safety Sprinkler Network
const FireSprinklerSystem: React.FC = React.memo(() => {
  const branchZ = [-26, -18, -10, -2, 6, 14, 22, 30];
  const headX = [-24, -16, -8, 0, 8, 16, 24];

  return (
    <group raycast={() => null}>
      {branchZ.map((zLine, bIdx) => (
        <group key={`sprinkler-branch-${bIdx}`} position={[0, 4.96, zLine]}>
          {/* Main Red Pipe Branch Running Transversely */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 56, 10]} />
            <primitive object={sharedMaterials.sprinklerPipe} attach="material" />
          </mesh>
          {/* Pendent Sprinkler Heads */}
          {headX.map((xH, hIdx) => (
            <group key={`head-${hIdx}`} position={[xH, -0.05, 0]}>
              <mesh>
                <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
                <primitive object={sharedMaterials.sprinklerPipe} attach="material" />
              </mesh>
              <mesh position={[0, -0.045, 0]}>
                <cylinderGeometry args={[0.028, 0.005, 0.01, 10]} />
                <primitive object={sharedMaterials.sprinklerBrass} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
});
FireSprinklerSystem.displayName = 'FireSprinklerSystem';

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

interface StoreArchitectureProps {
  activeFloor?: number;
}

const StoreArchitectureComponent: React.FC<StoreArchitectureProps> = () => {
  const tileTexture = useMemo(() => getVitrifiedTileTexture(), []);

  return (
    <group>
      {/* ==============================================================
          GROUND FLOOR (y = 0) - MASSIVE 72m x 72m HYPERMARKET FOOTPRINT
          ============================================================== */}
      {/* Ground Floor High-Quality Polished Vitrified Tile Supermarket Flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[72, 72]} />
        <meshStandardMaterial
          map={tileTexture}
          roughness={0.14}
          metalness={0.18}
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

      {/* Industrial Open Ceiling Mechanical Services */}
      <IndustrialHvacSystem />
      <FireSprinklerSystem />
      <PerimeterWallBaseboards />
      <SecurityDomeCameras />

      {/* ==============================================================
          36 COMMERCIAL LED CEILING LIGHT FIXTURES (6x6 Grid)
          ============================================================== */}
      {[-25, -15, -5, 5, 15, 25].map((xL, idx) => (
        <group key={`light-col-${idx}`}>
          {[-25, -15, -5, 5, 15, 25].map((zL, jdx) => (
            <mesh key={`grid-light-${idx}-${jdx}`} position={[xL, 5.08, zL]} geometry={sharedGeos.light2} material={sharedMaterials.ceilingLight} />
          ))}
        </group>
      ))}
    </group>
  );
};

export const StoreArchitecture = React.memo(StoreArchitectureComponent);
