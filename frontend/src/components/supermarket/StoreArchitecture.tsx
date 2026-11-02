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
  texture.repeat.set(18, 26); // Generates realistic 800x800mm tiles across 36x52m floor
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
  const ductXPositions = [-8, 8];
  const diffuserZPositions = [-18, -10, -2, 6, 14, 22];

  return (
    <group raycast={() => null}>
      {ductXPositions.map((xDuct, dIdx) => (
        <group key={`hvac-run-${dIdx}`} position={[xDuct, 4.60, 0]}>
          {/* Main Spiral Air Duct Cylindrical Trunk */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 44, 16]} />
            <primitive object={sharedMaterials.acDuct} attach="material" />
          </mesh>

          {/* Galvanized Suspension Hangers from Ceiling Slab */}
          {[-20, -14, -8, -2, 4, 10, 16, 22].map((zH, hIdx) => (
            <group key={`hanger-${hIdx}`} position={[0, 0.24, zH]}>
              <mesh>
                <cylinderGeometry args={[0.01, 0.01, 0.44, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Duct Collar Ring */}
              <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.23, 0.015, 8, 16]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Drop Air Supply Diffusers with Louver Grilles */}
          {diffuserZPositions.map((zDiff, dfIdx) => (
            <group key={`diff-${dfIdx}`} position={[0, -0.24, zDiff]}>
              {/* Vertical Branch Stub */}
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 0.16, 12]} />
                <primitive object={sharedMaterials.acDuct} attach="material" />
              </mesh>
              {/* 4-Way Square Diffuser Plaque */}
              <mesh position={[0, -0.09, 0]}>
                <boxGeometry args={[0.48, 0.03, 0.48]} />
                <primitive object={sharedMaterials.acDiffuser} attach="material" />
              </mesh>
              {/* Inner Air Grille Core */}
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
  const branchZ = [-18, -10, -2, 6, 14, 22];
  const headX = [-12, -8, -4, 0, 4, 8, 12];

  return (
    <group raycast={() => null}>
      {branchZ.map((zLine, bIdx) => (
        <group key={`sprinkler-branch-${bIdx}`} position={[0, 4.76, zLine]}>
          {/* Main Red Pipe Branch Running Transversely */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 28, 10]} />
            <primitive object={sharedMaterials.sprinklerPipe} attach="material" />
          </mesh>
          {/* Pendent Sprinkler Heads */}
          {headX.map((xH, hIdx) => (
            <group key={`head-${hIdx}`} position={[xH, -0.05, 0]}>
              <mesh>
                <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
                <primitive object={sharedMaterials.sprinklerPipe} attach="material" />
              </mesh>
              {/* Brass Deflector Cap */}
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

// Commercial Rubber / Vinyl Protective Wall Baseboard Kickplates
const PerimeterWallBaseboards: React.FC = React.memo(() => {
  return (
    <group raycast={() => null}>
      {/* Back Wall Kickplate (z = 25.79) */}
      <mesh position={[0, 0.08, 25.79]}>
        <boxGeometry args={[35.6, 0.16, 0.025]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      {/* Front Entrance Wall Kickplates (z = -25.79) */}
      <mesh position={[-11, 0.08, -25.79]}>
        <boxGeometry args={[13.6, 0.16, 0.025]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      <mesh position={[11, 0.08, -25.79]}>
        <boxGeometry args={[13.6, 0.16, 0.025]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      {/* Left Wall Kickplate (x = -17.79) */}
      <mesh position={[-17.79, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.16, 51.6]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
      {/* Right Wall Kickplate (x = 17.79) */}
      <mesh position={[17.79, 0.08, 0]}>
        <boxGeometry args={[0.025, 0.16, 51.6]} />
        <primitive object={sharedMaterials.baseboard} attach="material" />
      </mesh>
    </group>
  );
});
PerimeterWallBaseboards.displayName = 'PerimeterWallBaseboards';

// High-Resolution 360° Surveillance CCTV Dome Cameras
const SecurityDomeCameras: React.FC = React.memo(() => {
  const cameraLocations: [number, number, number][] = [
    [0, 4.88, -16],
    [0, 4.88, 0],
    [0, 4.88, 16],
    [-7.5, 4.88, -8],
    [7.5, 4.88, -8],
    [-7.5, 4.88, 8],
    [7.5, 4.88, 8],
  ];

  return (
    <group raycast={() => null}>
      {cameraLocations.map(([cx, cy, cz], idx) => (
        <group key={`cctv-${idx}`} position={[cx, cy, cz]}>
          {/* Circular Surface Mount Housing Base */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.06, 16]} />
            <primitive object={sharedMaterials.pillarConcrete} attach="material" />
          </mesh>
          {/* Smoked Tinted Polycarbonate Acrylic Dome */}
          <mesh position={[0, -0.03, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.09, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={sharedMaterials.cameraDome} attach="material" />
          </mesh>
          {/* Active Status LED Dot */}
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

interface StoreArchitectureProps {
  activeFloor?: number;
}

const StoreArchitectureComponent: React.FC<StoreArchitectureProps> = () => {
  const tileTexture = useMemo(() => getVitrifiedTileTexture(), []);

  return (
    <group>
      {/* ==============================================================
          GROUND FLOOR (y = 0)
          ============================================================== */}
      {/* Ground Floor High-Quality Polished Vitrified Tile Supermarket Flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[36, 52]} />
        <meshStandardMaterial
          map={tileTexture}
          roughness={0.14}
          metalness={0.18}
        />
      </mesh>

      {/* Ground Floor Architectural Pristine White Walls */}
      {/* Back Wall (z = 25) */}
      <mesh position={[0, 2.5, 26]} geometry={sharedGeos.box} scale={[36, 5, 0.4]} material={sharedMaterials.wall} />
      {/* Front Entrance Wall (z = -26) with doorway opening */}
      <mesh position={[-11, 2.5, -26]} geometry={sharedGeos.box} scale={[14, 5, 0.4]} material={sharedMaterials.wall} />
      <mesh position={[11, 2.5, -26]} geometry={sharedGeos.box} scale={[14, 5, 0.4]} material={sharedMaterials.wall} />
      {/* Wall opening lintel over entrance door */}
      <mesh position={[0, 4.2, -26]} geometry={sharedGeos.box} scale={[8, 1.6, 0.4]} material={sharedMaterials.wall} />

      {/* --- Single Luxury Signboard: 'Welcome to Martverse' --- */}
      <group position={[0, 4.25, -25.75]}>
        {/* Sleek Chrome Framing Rim */}
        <mesh position={[0, 0, -0.015]} geometry={sharedGeos.box} scale={[5.28, 0.93, 0.04]} material={sharedMaterials.slab} />
        {/* Pure White Acrylic Board */}
        <mesh position={[0, 0, 0.015]} geometry={sharedGeos.box} scale={[5.2, 0.85, 0.03]} material={sharedMaterials.wall} />
        {/* Cyan Accent Base Strip */}
        <mesh position={[0, -0.38, 0.038]} geometry={sharedGeos.box} scale={[4.8, 0.02, 0.01]} material={sharedMaterials.yellowLine} />
        <Text position={[0, 0.08, 0.045]} fontSize={0.34} color="#0284c7" anchorX="center" anchorY="middle" fontWeight="extrabold">
          Welcome to Martverse
        </Text>
        <Text position={[0, -0.22, 0.045]} fontSize={0.14} color="#0284c7" anchorX="center" anchorY="middle" fontWeight="bold">
          INDIAN HYPERMARKET & SUPER SAVINGS
        </Text>
      </group>

      {/* Left Wall (x = -18) */}
      <mesh position={[-18, 2.5, 0]} geometry={sharedGeos.box} scale={[0.4, 5, 52]} material={sharedMaterials.wall} />
      {/* Right Wall (x = 18) */}
      <mesh position={[18, 2.5, 0]} geometry={sharedGeos.box} scale={[0.4, 5, 52]} material={sharedMaterials.wall} />

      {/* Ground Floor Ceiling / Floor 2 Floor Slab (y = 5.0) */}
      <mesh position={[-2.4, 5.0, 0]} geometry={sharedGeos.box} scale={[31.2, 0.3, 52]} material={sharedMaterials.slab} />
      <mesh position={[15.6, 5.0, 15.7]} geometry={sharedGeos.box} scale={[4.8, 0.3, 20.6]} material={sharedMaterials.slab} />
      <mesh position={[15.6, 5.0, -16.25]} geometry={sharedGeos.box} scale={[4.8, 0.3, 19.5]} material={sharedMaterials.slab} />
      <mesh position={[17.1, 5.0, 0]} geometry={sharedGeos.box} scale={[1.8, 0.3, 13]} material={sharedMaterials.slab} />

      {/* Industrial White Steel Ceiling Beams spanning across Ground Floor */}
      {[-20, -12, -4, 4, 12, 20].map((zBeam, i) => (
        <mesh key={`beam-${i}`} position={[-2.4, 4.88, zBeam]} geometry={sharedGeos.box} scale={[31.2, 0.22, 0.25]} material={sharedMaterials.ceilingBeam} />
      ))}

      {/* Escalator Shaft Glass Guardrails on Floor 2 */}
      <mesh position={[13.2, 5.5, -0.55]} geometry={sharedGeos.box} scale={[0.08, 1.0, 11.9]} material={sharedMaterials.glassRail} />
      <mesh position={[14.7, 5.5, -6.5]} geometry={sharedGeos.box} scale={[3.0, 1.0, 0.08]} material={sharedMaterials.glassRail} />

      {/* ==============================================================
          STRUCTURAL CONCRETE PILLARS WITH D-MART PROMOTIONAL WRAPS
          ============================================================== */}
      <SupermarketPillar
        position={[-5, 0, -8]}
        titleText={'D-MART BACHAT BAZAAR\nMAXIMUM SAVINGS'}
        subText="Unbeatable Everyday Low Prices on Groceries & Staples"
        badgeText="EVERYDAY LOW PRICE"
        badgeColor="#dc2626"
      />
      <SupermarketPillar
        position={[5, 0, -8]}
        titleText={'FARM DIRECT ORGANICS\n100% PURE & FRESH'}
        subText="Finest Quality Flours, Pure Ghee, Cold-Pressed Oils & Spices"
        badgeText="QUALITY GUARANTEE"
        badgeColor="#059669"
      />
      <SupermarketPillar
        position={[-5, 0, 8]}
        titleText={'SUPER SAVER PACKS\nFLAT 20% TO 50% OFF'}
        subText="Special Family Packs • Buy More, Save More Every Day"
        badgeText="SPECIAL VALUE"
        badgeColor="#b45309"
      />
      <SupermarketPillar
        position={[5, 0, 8]}
        titleText={'BRAND MEGA OFFERS\nBEST PRICE PROMISE'}
        subText="Top FMCG Brands at India's Lowest Supermarket Rates"
        badgeText="BEST PRICE"
        badgeColor="#0284c7"
      />

      {/* ==============================================================
          ENTRANCE SHOPPING BASKET STATIONS
          ============================================================== */}
      <BasketStackStation position={[-3.4, 0, -22.5]} color="red" />
      <BasketStackStation position={[3.4, 0, -22.5]} color="blue" />

      {/* Industrial Open Ceiling Mechanical Services */}
      <IndustrialHvacSystem />
      <FireSprinklerSystem />
      <PerimeterWallBaseboards />
      <SecurityDomeCameras />

      {/* ==============================================================
          ESCALATOR CONNECTING GROUND & FIRST FLOOR (x = 14.7, z = 0)
          ============================================================== */}
      <group position={[14.7, 0, 0]}>
        <group position={[0, 2.5, -1]} rotation={[-0.34, 0, 0]}>
          <mesh geometry={sharedGeos.box} scale={[2.2, 0.4, 15]} material={sharedMaterials.escalatorBase} />
          <mesh position={[0, 0.22, 0]} geometry={sharedGeos.box} scale={[1.8, 0.02, 14.8]} material={sharedMaterials.escalatorSteps} />
          <mesh position={[-0.92, 0.23, 0]} geometry={sharedGeos.box} scale={[0.04, 0.01, 14.8]} material={sharedMaterials.yellowLine} />
          <mesh position={[0.92, 0.23, 0]} geometry={sharedGeos.box} scale={[0.04, 0.01, 14.8]} material={sharedMaterials.yellowLine} />

          <mesh position={[-1.05, 0.6, 0]} geometry={sharedGeos.box} scale={[0.04, 0.9, 15]} material={sharedMaterials.escalatorGlass} />
          <mesh position={[-1.05, 1.05, 0]} geometry={sharedGeos.box} scale={[0.08, 0.06, 15]} material={sharedMaterials.hazardBlack} />

          <mesh position={[1.05, 0.6, 0]} geometry={sharedGeos.box} scale={[0.04, 0.9, 15]} material={sharedMaterials.escalatorGlass} />
          <mesh position={[1.05, 1.05, 0]} geometry={sharedGeos.box} scale={[0.08, 0.06, 15]} material={sharedMaterials.hazardBlack} />
        </group>

        {/* Overhead Escalator Navigation Signboard */}
        <group position={[0, 3.85, -8.5]}>
          <mesh position={[-1.15, 0.6, 0]} geometry={sharedGeos.cyl} scale={[0.015, 1.2, 0.015]} material={sharedMaterials.slab} />
          <mesh position={[1.15, 0.6, 0]} geometry={sharedGeos.cyl} scale={[0.015, 1.2, 0.015]} material={sharedMaterials.slab} />

          <mesh geometry={sharedGeos.box} scale={[2.88, 0.88, 0.08]} material={sharedMaterials.slab} />
          <mesh geometry={sharedGeos.box} scale={[2.8, 0.8, 0.09]} material={sharedMaterials.wall} />

          {/* FRONT FACE */}
          <Text position={[0, 0.18, 0.05]} fontSize={0.16} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold">
            {'↑ 2ND FLOOR • UPPER LEVEL'}
          </Text>
          <mesh position={[0, 0.02, 0.05]} geometry={sharedGeos.box} scale={[2.4, 0.015, 0.005]} material={sharedMaterials.yellowLine} />
          <Text position={[0, -0.18, 0.05]} fontSize={0.13} color="#334155" anchorX="center" anchorY="middle" fontWeight="bold">
            {'↓ GROUND FLOOR • GROCERIES & BILLING'}
          </Text>

          {/* BACK FACE */}
          <group rotation={[0, Math.PI, 0]}>
            <Text position={[0, 0.18, 0.05]} fontSize={0.16} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="extrabold">
              {'↑ 2ND FLOOR • UPPER LEVEL'}
            </Text>
            <mesh position={[0, 0.02, 0.05]} geometry={sharedGeos.box} scale={[2.4, 0.015, 0.005]} material={sharedMaterials.yellowLine} />
            <Text position={[0, -0.18, 0.05]} fontSize={0.13} color="#334155" anchorX="center" anchorY="middle" fontWeight="bold">
              {'↓ GROUND FLOOR • GROCERIES & BILLING'}
            </Text>
          </group>
        </group>
      </group>

      {/* ==============================================================
          FIRST FLOOR (FASHION) (y = 5.0)
          ============================================================== */}
      <mesh position={[0, 7.5, 26]} geometry={sharedGeos.box} scale={[36, 5, 0.4]} material={sharedMaterials.wall} />
      <mesh position={[0, 7.5, -26]} geometry={sharedGeos.box} scale={[36, 5, 0.4]} material={sharedMaterials.wall} />
      <mesh position={[-18, 7.5, 0]} geometry={sharedGeos.box} scale={[0.4, 5, 52]} material={sharedMaterials.wall} />
      <mesh position={[18, 7.5, 0]} geometry={sharedGeos.box} scale={[0.4, 5, 52]} material={sharedMaterials.wall} />
      <mesh position={[0, 10.0, 0]} geometry={sharedGeos.box} scale={[36, 0.4, 52]} material={sharedMaterials.roof} />

      {/* ==============================================================
          LIGHTING FIXTURES
          ============================================================== */}
      {[-12, -6, 0, 6].map((xL, idx) => (
        <group key={`light-row-1-${idx}`}>
          {[-15, -5, 5, 15].map((zL, jdx) => (
            <mesh key={`fl-1-${idx}-${jdx}`} position={[xL, 4.85, zL]} geometry={sharedGeos.light1} material={sharedMaterials.ceilingLight} />
          ))}
        </group>
      ))}

      {[-10, 0, 10].map((xL, idx) => (
        <group key={`light-row-2-${idx}`}>
          {[-15, 0, 15].map((zL, jdx) => (
            <mesh key={`fl-2-${idx}-${jdx}`} position={[xL, 9.85, zL]} geometry={sharedGeos.light2} material={sharedMaterials.ceilingLight} />
          ))}
        </group>
      ))}
    </group>
  );
};

export const StoreArchitecture = React.memo(StoreArchitectureComponent);
