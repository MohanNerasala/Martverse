'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SupermarketAisle, Product, ProductPlacement } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';

// Shared pre-allocated geometries (eliminates 3,000+ geometry allocations and GC pauses)
const sharedGeometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  cyl14: new THREE.CylinderGeometry(1, 1, 1, 14),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
};

// Shared texture cache to prevent duplicate fetches across shelf units
export const shelfTextureCache = new Map<string, THREE.Texture>();

// Cached Canvas Textures for ESL digital price tags (Ultra-Fast 256x128)
export const eslTextureCache = new Map<string, THREE.CanvasTexture>();
export const eslMaterialCache = new Map<string, THREE.MeshBasicMaterial>();
export const shelfMaterialCache = new Map<string, THREE.Material>();

// Static shared materials for all 5 aisles to eliminate redundant WebGL shader switches
const shelfRackMaterials = {
  divider: new THREE.MeshStandardMaterial({ color: '#f1f5f9', metalness: 0.1, roughness: 0.4 }),
  plank: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.12, roughness: 0.25 }),
  led: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color('#f8fafc'), emissiveIntensity: 0.45, roughness: 0.1 }),
  rail: new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 }), // D-Mart signature red price rail
  neon: new THREE.MeshBasicMaterial({ color: '#facc15' }), // D-Mart yellow accent
  post: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.4, roughness: 0.4 }), // Commercial ivory powder-coated steel uprights
  postNeon: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.5 }),
  eslCasing: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
  kickplate: new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8, roughness: 0.3 }),
  endCapSign: new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.3, roughness: 0.2 }),
  acrylicTray: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.05 }),
  acrylicLip: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.1 }),
  cartonFlap: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.5 }),
  whiteCap: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
  hangerBar: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 }),
  hangerHook: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.95, roughness: 0.1 }),
};

export function getEslTexture(price: number, brand: string): THREE.CanvasTexture {
  const key = `${price}-${brand}`;
  const existing = eslTextureCache.get(key);
  if (existing) return existing;

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // D-Mart style vibrant yellow promotional retail price tag
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 256, 128);

    // Red promotional header pill
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(8, 8, 140, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('D-MART PRICE', 14, 21);

    // Bold Price
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`₹${price}`, 12, 66);

    // Strikethrough MRP
    const mrp = Math.round(price * 1.2);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`MRP ₹${mrp}`, 12, 104);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 104);
    ctx.lineTo(92, 104);
    ctx.stroke();

    // Green savings label
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`SAVE ₹${mrp - price}`, 106, 104);

    // Retail Barcode pattern on right
    ctx.fillStyle = '#1e293b';
    const barX = 188;
    const barWidths = [2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 2, 3, 1, 3];
    let currX = barX;
    for (let i = 0; i < barWidths.length; i++) {
      ctx.fillRect(currX, 16, barWidths[i], 88);
      currX += barWidths[i] + (i % 2 === 0 ? 2 : 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  eslTextureCache.set(key, texture);
  return texture;
}

export function getEslMaterial(price: number, brand: string): THREE.MeshBasicMaterial {
  const key = `${price}-${brand}`;
  const existing = eslMaterialCache.get(key);
  if (existing) return existing;
  const tex = getEslTexture(price, brand);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    toneMapped: false,
  });
  eslMaterialCache.set(key, mat);
  return mat;
}

export function getShelfMaterial(tex: THREE.Texture, key: string, materialType: 'basic' | 'standard' = 'basic'): THREE.Material {
  const cacheKey = `${key}-${materialType}`;
  const existing = shelfMaterialCache.get(cacheKey);
  if (existing) return existing;

  const mat = materialType === 'standard'
    ? new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.01,
        roughness: 0.25,
        metalness: 0.12,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      })
    : new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.01,
        toneMapped: false,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });

  shelfMaterialCache.set(cacheKey, mat);
  return mat;
}

const ProductSmallImage: React.FC<{
  url: string | any;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
  materialType?: 'basic' | 'standard';
  roughness?: number;
  metalness?: number;
  alphaTest?: number;
}> = React.memo(({ url, position, scale, rotation, materialType = 'basic' }) => {
  const resolvedUrl: string = typeof url === 'object' && url && 'src' in url ? url.src : (url || '/products/sweets/DairyMilk.png');

  // Synchronous texture lookup from pre-warmed cache (0ms instant render)
  const [texture, setTexture] = useState<THREE.Texture | null>(() => {
    return resolvedUrl ? (shelfTextureCache.get(resolvedUrl) || null) : null;
  });

  useEffect(() => {
    if (!resolvedUrl) return;
    if (shelfTextureCache.has(resolvedUrl)) {
      const cached = shelfTextureCache.get(resolvedUrl)!;
      if (texture !== cached) setTexture(cached);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      resolvedUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        shelfTextureCache.set(resolvedUrl, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        if (resolvedUrl !== '/products/sweets/DairyMilk.png') {
          loader.load('/products/sweets/DairyMilk.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            shelfTextureCache.set(resolvedUrl, tex);
            setTexture(tex);
          });
        }
      }
    );
  }, [resolvedUrl, texture]);

  const mat = texture ? getShelfMaterial(texture, resolvedUrl, materialType) : null;

  return (
    <mesh
      position={position}
      rotation={rotation}
      geometry={sharedGeometries.plane}
      scale={[scale[0], scale[1], 1]}
      raycast={() => null}
      material={mat || undefined}
    >
      {!mat && <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />}
    </mesh>
  );
});
ProductSmallImage.displayName = 'ProductSmallImage';

interface ShelfSlotItemProps {
  slot: {
    key: string;
    product: Product;
    side: 'LEFT' | 'RIGHT';
    tier?: number;
    blockIdx: number;
    slotIdx: number;
    relX: number;
    relY: number;
    relZ: number;
    worldX: number;
    worldY: number;
    worldZ: number;
    rotationY: number;
  };
  eslMaterial: THREE.MeshBasicMaterial;
}

const ShelfProductItem: React.FC<ShelfSlotItemProps> = React.memo(({ slot, eslMaterial }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const prod = slot.product;
  const plc = prod.placement || {
    color: '#3b82f6',
    modelType: 'box',
  };
  const color = plc.color || '#3b82f6';
  const isDairyMilk = prod.slug.includes('dairy-milk') ||
                      prod.name.toLowerCase().includes('dairy milk') ||
                      prod.brand?.toLowerCase().includes('cadbury');
  const packagingUrl = isDairyMilk
    ? '/products/sweets/DairyMilk_cropped.png'
    : (prod.imageUrl || '/products/fallback.svg');

  const animGroupRef = useRef<THREE.Group>(null);
  const mainMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const eslMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // On-demand hardware-accelerated RAF animation:
  // Eliminates 540 idle useFrame loops per frame (saving 32,400+ function calls/second)
  const animFrameRef = useRef<number | null>(null);

  const startHoverAnimation = (hovering: boolean) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const targetScale = hovering ? 1.20 : 1.0;
    const targetLift = hovering ? 0.05 : 0.0;
    const targetFwd = hovering ? 0.07 : 0.0;

    const step = () => {
      if (!animGroupRef.current) return;
      const curScale = animGroupRef.current.scale.x;
      const curLift = animGroupRef.current.position.y;
      const curFwd = animGroupRef.current.position.z;

      const newScale = curScale + (targetScale - curScale) * 0.35;
      const newLift = curLift + (targetLift - curLift) * 0.35;
      const newFwd = curFwd + (targetFwd - curFwd) * 0.35;

      animGroupRef.current.scale.set(newScale, newScale, newScale);
      animGroupRef.current.position.set(0, newLift, newFwd);

      if (Math.abs(targetScale - newScale) > 0.005 || Math.abs(targetLift - newLift) > 0.002) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animGroupRef.current.scale.set(targetScale, targetScale, targetScale);
        animGroupRef.current.position.set(0, targetLift, targetFwd);
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <group
      position={[slot.relX, slot.relY, slot.relZ]}
      rotation={[0, slot.rotationY, 0]}
    >
      {/* Invisible Interaction Hitbox - Exclusively raycasted; absorbs all cursor pointer events */}
      <mesh
        visible={false}
        position={[0, 0.18, 0.08]}
        geometry={sharedGeometries.box}
        scale={[isDairyMilk ? 0.72 : 0.60, 0.46, 0.42]}
        onPointerOver={(e) => {
          e.stopPropagation();
          startHoverAnimation(true);
          if (mainMatRef.current) {
            mainMatRef.current.emissive.set(isDairyMilk ? '#6b21a8' : color);
            mainMatRef.current.emissiveIntensity = 0.35;
          }
          if (eslMatRef.current) {
            eslMatRef.current.color.set('#047857');
          }
          document.body.style.cursor = 'pointer';
          setHoveredProduct(prod);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          startHoverAnimation(false);
          if (mainMatRef.current) {
            mainMatRef.current.emissiveIntensity = 0;
          }
          if (eslMatRef.current) {
            eslMatRef.current.color.set('#0f172a');
          }
          document.body.style.cursor = 'default';
          setHoveredProduct(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openProductModal(prod);
        }}
      />

      {/* Smoothly Animated Product Group (raycast={() => null} ignores internal mesh traversal) */}
      <group ref={animGroupRef} raycast={() => null}>
        {/* 3D Product Mesh based on modelType */}
        {plc.modelType === 'bottle' ? (
          <group position={[0, 0, 0]} raycast={() => null}>
            {/* Cylindrical Main Bottle Body */}
            <mesh position={[0, 0.12, 0]} geometry={sharedGeometries.cyl14} scale={[0.082, 0.24, 0.082]} raycast={() => null}>
              <meshStandardMaterial
                ref={mainMatRef}
                color={color}
                roughness={0.15}
                metalness={0.1}
              />
            </mesh>
            {/* Tapered Bottle Shoulder */}
            <mesh position={[0, 0.27, 0]} geometry={sharedGeometries.cyl14} scale={[0.06, 0.06, 0.06]} raycast={() => null}>
              <meshStandardMaterial color={color} roughness={0.15} metalness={0.1} />
            </mesh>
            {/* Bottle Neck & Cap */}
            <mesh position={[0, 0.34, 0]} geometry={sharedGeometries.cyl12} scale={[0.034, 0.06, 0.034]} raycast={() => null}>
              <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Product Artwork on Bottle Label */}
            <ProductSmallImage
              url={packagingUrl}
              position={[0, 0.12, 0.088]}
              scale={[0.13, 0.14]}
            />
          </group>
        ) : plc.modelType === 'shirt' || plc.modelType === 'hanger' ? (
          <group position={[0, 0, 0]} raycast={() => null}>
            {/* Polished Chrome Hanger Hook */}
            <mesh position={[0, 0.44, 0]} geometry={sharedGeometries.cyl8} scale={[0.008, 0.1, 0.008]} raycast={() => null}>
              <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Dark Hanger Bar */}
            <mesh position={[0, 0.38, 0]} geometry={sharedGeometries.box} scale={[0.42, 0.02, 0.02]} raycast={() => null}>
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Realistic Folded Garment Body */}
            <mesh position={[0, 0.18, 0]} geometry={sharedGeometries.box} scale={[0.36, 0.36, 0.09]} raycast={() => null}>
              <meshStandardMaterial
                ref={mainMatRef}
                color={color}
                roughness={0.7}
                metalness={0.05}
              />
            </mesh>
            {/* Clean Inner Collar Trim */}
            <mesh position={[0, 0.34, 0]} geometry={sharedGeometries.box} scale={[0.14, 0.03, 0.11]} raycast={() => null}>
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
          </group>
        ) : plc.modelType === 'chocolate' || plc.modelType === 'bar' || isDairyMilk ? (
          <group position={[0, 0, 0]} raycast={() => null}>
            {/* Clear Acrylic Confectionery Shelf Tray directly on shelf plank */}
            <mesh position={[0, 0.008, 0.02]} geometry={sharedGeometries.box} scale={[0.70, 0.016, 0.16]} raycast={() => null}>
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.05}
              />
            </mesh>
            {/* Front Acrylic Retaining Lip */}
            <mesh position={[0, 0.026, 0.095]} geometry={sharedGeometries.box} scale={[0.70, 0.036, 0.006]} raycast={() => null}>
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.35}
                roughness={0.1}
              />
            </mesh>

            {/* Front Featured Chocolate Bar */}
            <group position={[0, 0.155, 0.02]} rotation={[-0.04, 0, 0]} raycast={() => null}>
              {/* Slim 3D Chocolate Packaging Body */}
              <mesh geometry={sharedGeometries.box} scale={[0.65, 0.296, 0.022]} raycast={() => null}>
                <meshStandardMaterial
                  ref={mainMatRef}
                  color="#4a044e"
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>

              {/* Complete Cadbury Dairy Milk High-Resolution Packaging Artwork Plane */}
              <ProductSmallImage
                url={packagingUrl}
                position={[0, 0, 0.016]}
                scale={[0.66, 0.302]}
                materialType="basic"
                alphaTest={0.01}
              />

              {/* Subtle Glossy Foil Reflection Sheen Strip */}
              <mesh position={[0, 0.06, 0.018]} geometry={sharedGeometries.plane} scale={[0.62, 0.03, 1]} raycast={() => null}>
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.16}
                />
              </mesh>
            </group>
          </group>
        ) : (
          // Standard Premium Box (Biscuits, Tea, Atta, Snacks, etc.)
          <group position={[0, 0, 0]} raycast={() => null}>
            {/* Premium Carton Box Body */}
            <mesh position={[0, 0.18, 0]} geometry={sharedGeometries.box} scale={[0.26, 0.36, 0.18]} raycast={() => null}>
              <meshStandardMaterial
                ref={mainMatRef}
                color={color}
                roughness={0.3}
                metalness={0.05}
              />
            </mesh>
            {/* Real Product Image on Carton Face */}
            <ProductSmallImage
              url={packagingUrl}
              position={[0, 0.18, 0.096]}
              scale={[0.25, 0.34]}
            />
          </group>
        )}
      </group>

      {/* Shelf Edge ESL Digital Display Face (Casing is batched via InstancedMesh for 60FPS) */}
      <mesh
        position={[0, -0.01, 0.45]}
        geometry={sharedGeometries.plane}
        scale={[0.30, 0.10, 1]}
        raycast={() => null}
        material={eslMaterial}
      />
    </group>
  );
});

ShelfProductItem.displayName = 'ShelfProductItem';

// High-Performance Instanced ESL Casings (Turns 540 draw calls into 5)
const AisleEslCasings: React.FC<{ slots: ShelfSlotItemProps['slot'][] }> = React.memo(({ slots }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    slots.forEach((slot, idx) => {
      const isLeft = slot.side === 'LEFT';
      const eslX = isLeft ? -0.89 : 0.89;
      dummy.position.set(eslX, slot.relY - 0.01, slot.relZ);
      dummy.rotation.set(0, slot.rotationY, 0);
      dummy.scale.set(0.32, 0.12, 0.018);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[sharedGeometries.box, shelfRackMaterials.eslCasing, slots.length]}
      raycast={() => null}
    />
  );
});

// High-Performance Instanced Support Posts (Turns 140 draw calls into 10)
const AisleSupportPosts: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const postsRef = useRef<THREE.InstancedMesh>(null);
  const neonsRef = useRef<THREE.InstancedMesh>(null);
  const zPositions = useMemo(
    () => [-length / 2, -length / 3, -length / 6, 0, length / 6, length / 3, length / 2],
    [length]
  );

  useEffect(() => {
    if (!postsRef.current || !neonsRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;

    zPositions.forEach((zPos) => {
      // Left post
      dummy.position.set(-0.86, 0, zPos);
      dummy.scale.set(0.05, height, 0.05);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.888, 0, zPos);
      dummy.scale.set(0.006, height * 0.94, 0.02);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right post
      dummy.position.set(0.86, 0, zPos);
      dummy.scale.set(0.05, height, 0.05);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.888, 0, zPos);
      dummy.scale.set(0.006, height * 0.94, 0.02);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;
    });

    postsRef.current.instanceMatrix.needsUpdate = true;
    neonsRef.current.instanceMatrix.needsUpdate = true;
  }, [zPositions, height]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={postsRef} args={[sharedGeometries.box, shelfRackMaterials.post, 14]} raycast={() => null} />
      <instancedMesh ref={neonsRef} args={[sharedGeometries.box, shelfRackMaterials.postNeon, 14]} raycast={() => null} />
    </group>
  );
});

// High-Performance Instanced Shelf Planks & Rails (Turns 120 draw calls into 20)
const AisleShelves: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const planksRef = useRef<THREE.InstancedMesh>(null);
  const ledsRef = useRef<THREE.InstancedMesh>(null);
  const railsRef = useRef<THREE.InstancedMesh>(null);
  const neonsRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!planksRef.current || !ledsRef.current || !railsRef.current || !neonsRef.current) return;
    const dummy = new THREE.Object3D();
    const shelfHeights = [0.5, 1.3, 2.1];
    let idx = 0;

    shelfHeights.forEach((shelfH) => {
      const yRel = shelfH - height / 2;

      // Left side
      dummy.position.set(-0.45, yRel, 0);
      dummy.scale.set(0.85, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.45, yRel - 0.024, 0);
      dummy.scale.set(0.06, 0.012, length);
      dummy.updateMatrix();
      ledsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.88, yRel, 0);
      dummy.scale.set(0.02, 0.06, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.892, yRel, 0);
      dummy.scale.set(0.004, 0.018, length);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right side
      dummy.position.set(0.45, yRel, 0);
      dummy.scale.set(0.85, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.45, yRel - 0.024, 0);
      dummy.scale.set(0.06, 0.012, length);
      dummy.updateMatrix();
      ledsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.88, yRel, 0);
      dummy.scale.set(0.02, 0.06, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.892, yRel, 0);
      dummy.scale.set(0.004, 0.018, length);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;
    });

    planksRef.current.instanceMatrix.needsUpdate = true;
    ledsRef.current.instanceMatrix.needsUpdate = true;
    railsRef.current.instanceMatrix.needsUpdate = true;
    neonsRef.current.instanceMatrix.needsUpdate = true;
  }, [length, height]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={planksRef} args={[sharedGeometries.box, shelfRackMaterials.plank, 6]} raycast={() => null} />
      <instancedMesh ref={ledsRef} args={[sharedGeometries.box, shelfRackMaterials.led, 6]} raycast={() => null} />
      <instancedMesh ref={railsRef} args={[sharedGeometries.box, shelfRackMaterials.rail, 6]} raycast={() => null} />
      <instancedMesh ref={neonsRef} args={[sharedGeometries.box, shelfRackMaterials.neon, 6]} raycast={() => null} />
    </group>
  );
});

// Aisle Base Kickplates (Dust & Trolley Protection)
const AisleKickplates: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const yBase = -height / 2 + 0.10;
  return (
    <group raycast={() => null}>
      <mesh position={[-0.45, yBase, 0]} geometry={sharedGeometries.box} scale={[0.85, 0.20, length]} material={shelfRackMaterials.kickplate} />
      <mesh position={[0.45, yBase, 0]} geometry={sharedGeometries.box} scale={[0.85, 0.20, length]} material={shelfRackMaterials.kickplate} />
    </group>
  );
});

// Promotional Gondola End-Caps at Aisle Entrances
const AisleGondolaEndCaps: React.FC<{ length: number; height: number; aisleNumber: number; categoryName: string }> = React.memo(({ length, height, aisleNumber, categoryName }) => {
  return (
    <group raycast={() => null}>
      {/* North End-Cap (Facing -Z) */}
      <group position={[0, 0, -length / 2 - 0.04]}>
        <mesh geometry={sharedGeometries.box} scale={[1.74, height, 0.08]} material={shelfRackMaterials.kickplate} />
        <mesh position={[0, height / 2 - 0.45, -0.05]} geometry={sharedGeometries.box} scale={[1.60, 0.70, 0.02]} material={shelfRackMaterials.endCapSign} />
        <Text
          position={[0, height / 2 - 0.45, -0.07]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`D-MART SPECIAL\n${categoryName.toUpperCase()}`}
        </Text>
      </group>

      {/* South End-Cap (Facing +Z) */}
      <group position={[0, 0, length / 2 + 0.04]}>
        <mesh geometry={sharedGeometries.box} scale={[1.74, height, 0.08]} material={shelfRackMaterials.kickplate} />
        <mesh position={[0, height / 2 - 0.45, 0.05]} geometry={sharedGeometries.box} scale={[1.60, 0.70, 0.02]} material={shelfRackMaterials.endCapSign} />
        <Text
          position={[0, height / 2 - 0.45, 0.07]}
          fontSize={0.16}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`D-MART SPECIAL\n${categoryName.toUpperCase()}`}
        </Text>
      </group>
    </group>
  );
});

interface ShelfUnitProps {
  aisle: SupermarketAisle;
  products: Product[];
  floorYOffset: number;
}

const ShelfUnitComponent: React.FC<ShelfUnitProps> = ({ aisle, products, floorYOffset }) => {
  const activeFloor = useMartStore((state) => state.activeFloor);
  const isFloorActive = (floorYOffset > 2 ? 2 : 1) === activeFloor;

  const aisleProducts = useMemo(() => {
    const floorNum = floorYOffset > 2 ? 2 : 1;
    const directMatches = products.filter(
      (p) => (p.placement && p.placement.aisleNumber === aisle.aisleNumber) ||
             (p.category && p.category.name && aisle.categoryName && p.category.name.toLowerCase() === aisle.categoryName.toLowerCase()) ||
             (p.placement && p.placement.aisleCategory && aisle.categoryName && p.placement.aisleCategory.toLowerCase() === aisle.categoryName.toLowerCase())
    );
    if (directMatches.length > 0) return directMatches;

    // Fallback to active floor products so shelves never stand empty
    const floorProducts = products.filter((p) => {
      const pFloor = p.placement?.floorNumber ?? 1;
      return pFloor === floorNum;
    });
    if (floorNum === 2) {
      return floorProducts; // Floor 2 items removed until user adds them later
    }
    return floorProducts.length > 0 ? floorProducts : products;
  }, [products, aisle.aisleNumber, aisle.categoryName, floorYOffset]);

  const length = Math.abs(aisle.endZ - aisle.startZ);
  const centerX = (aisle.startX + aisle.endX) / 2;
  const centerZ = (aisle.startZ + aisle.endZ) / 2;
  const centerY = floorYOffset + aisle.shelfHeight / 2;

  const BLOCK_COUNT = 6;
  const blockWidth = length / BLOCK_COUNT; // 4.0m

  const blockCenters = useMemo(() => {
    return Array.from(
      { length: BLOCK_COUNT },
      (_, b) => -length / 2 + (b + 0.5) * blockWidth
    ); // [-10, -6, -2, 2, 6, 10]
  }, [length, blockWidth]);

  const itemOffsets = [-1.15, 0, 1.15];

  const SHELF_TIERS = useMemo(() => [
    { tier: 1, height: 0.5 },
    { tier: 2, height: 1.3 },
    { tier: 3, height: 2.1 },
  ], []);

  // Generate 6 blocks x 3 items x 3 tiers = 54 items per side (108 items total per aisle)
  const displaySlots = useMemo(() => {
    if (!isFloorActive || !aisleProducts || aisleProducts.length === 0) return [];

    const slots: Array<{
      key: string;
      product: Product;
      side: 'LEFT' | 'RIGHT';
      tier: number;
      blockIdx: number;
      slotIdx: number;
      relX: number;
      relY: number;
      relZ: number;
      worldX: number;
      worldY: number;
      worldZ: number;
      rotationY: number;
    }> = [];

    const sides: Array<{ side: 'LEFT' | 'RIGHT'; relX: number; rotationY: number }> = [
      { side: 'LEFT', relX: -0.45, rotationY: -Math.PI / 2 },
      { side: 'RIGHT', relX: 0.45, rotationY: Math.PI / 2 },
    ];

    sides.forEach((s) => {
      SHELF_TIERS.forEach((tierInfo, tIdx) => {
        const shelfTierY = tierInfo.height - aisle.shelfHeight / 2 + 0.02;

        for (let b = 0; b < BLOCK_COUNT; b++) {
          for (let k = 0; k < 3; k++) {
            const zRel = blockCenters[b] + itemOffsets[k];
            const prodIdx = (tIdx * 18 + b * 3 + k + (s.side === 'RIGHT' ? 2 : 0)) % aisleProducts.length;
            const product = aisleProducts[prodIdx];

            const slotWorldX = centerX + s.relX;
            const slotWorldY = centerY + shelfTierY;
            const slotWorldZ = centerZ + zRel;

            const slotPlacement: ProductPlacement = product.placement
              ? {
                  ...product.placement,
                  worldX: slotWorldX,
                  worldY: slotWorldY,
                  worldZ: slotWorldZ,
                  floorNumber: floorYOffset > 2 ? 2 : 1,
                  aisleNumber: aisle.aisleNumber,
                  aisleName: aisle.name,
                  shelfSide: s.side,
                  shelfTier: tierInfo.tier,
                }
              : {
                  id: `place-${product.id}-t${tierInfo.tier}-${b}-${k}`,
                  productId: product.id,
                  productName: product.name,
                  productSlug: product.slug,
                  productPrice: product.price,
                  productMrp: product.mrp,
                  floorNumber: floorYOffset > 2 ? 2 : 1,
                  aisleId: aisle.id,
                  aisleNumber: aisle.aisleNumber,
                  aisleName: aisle.name,
                  aisleCategory: aisle.categoryName,
                  shelfSide: s.side,
                  shelfTier: tierInfo.tier,
                  shelfPosition: b * 3 + k + 1,
                  worldX: slotWorldX,
                  worldY: slotWorldY,
                  worldZ: slotWorldZ,
                  rotationY: s.rotationY,
                  color: '#3b82f6',
                  modelType: 'box',
                };

            const slotProduct: Product = {
              ...product,
              placement: slotPlacement,
            };

            slots.push({
              key: `${s.side}-t${tierInfo.tier}-b${b}-s${k}-${product.id}`,
              product: slotProduct,
              side: s.side,
              tier: tierInfo.tier,
              blockIdx: b,
              slotIdx: k,
              relX: s.relX,
              relY: shelfTierY,
              relZ: zRel,
              worldX: slotWorldX,
              worldY: slotWorldY,
              worldZ: slotWorldZ,
              rotationY: s.rotationY,
            });
          }
        }
      });
    });

    return slots;
  }, [isFloorActive, aisleProducts, blockCenters, SHELF_TIERS, centerX, centerY, centerZ, floorYOffset, aisle.aisleNumber, aisle.name, aisle.shelfHeight, aisle.id, aisle.categoryName]);

  // Floor Culling: unmount completely if this shelf belongs to inactive floor (placed AFTER all hooks)
  if (!isFloorActive) return null;

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* Overhead Aisle Hanging Signboard */}
      <group position={[0, aisle.shelfHeight / 2 + 1.2, 0]} raycast={() => null}>
        {/* Signboard background */}
        <mesh geometry={sharedGeometries.box} scale={[2.8, 0.7, 0.08]} raycast={() => null}>
          <meshStandardMaterial color="#0369a1" metalness={0.4} roughness={0.2} />
        </mesh>
        {/* Cyan/Blue glow header strip */}
        <mesh position={[0, 0.28, 0.05]} geometry={sharedGeometries.box} scale={[2.7, 0.08, 0.02]} raycast={() => null}>
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
        </mesh>
        {/* Soft Aisle Downlight Glow Strip */}
        <mesh position={[0, -0.32, 0]} geometry={sharedGeometries.box} scale={[2.4, 0.04, 0.06]} raycast={() => null}>
          <meshStandardMaterial color="#bae6fd" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
        {/* Hanging metal chains */}
        <mesh position={[-1.1, 0.8, 0]} geometry={sharedGeometries.cyl8} scale={[0.015, 1.2, 0.015]} raycast={() => null}>
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[1.1, 0.8, 0]} geometry={sharedGeometries.cyl8} scale={[0.015, 1.2, 0.015]} raycast={() => null}>
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* 3D Signboard Text */}
        <Text
          position={[0, -0.05, 0.065]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          {`AISLE ${aisle.aisleNumber}\n${aisle.categoryName.toUpperCase()}`}
        </Text>
        {/* Backside Text */}
        <Text
          position={[0, -0.05, -0.065]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          {`AISLE ${aisle.aisleNumber}\n${aisle.categoryName.toUpperCase()}`}
        </Text>
      </group>

      {/* Central Shelving Rack - High-Performance Instanced Rendering (60+ FPS) */}
      <group raycast={() => null}>
        {/* Central Back Divider Wall */}
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[0.08, aisle.shelfHeight, length]} material={shelfRackMaterials.divider} />

        {/* Instanced Shelf Planks, LED Glow Strips & Price Rails */}
        <AisleShelves length={length} height={aisle.shelfHeight} />

        {/* Instanced Commercial Powder-Coated Upright Posts */}
        <AisleSupportPosts length={length} height={aisle.shelfHeight} />

        {/* Base Kickplates for Retail Realism */}
        <AisleKickplates length={length} height={aisle.shelfHeight} />

        {/* Promotional Gondola End-Caps */}
        <AisleGondolaEndCaps length={length} height={aisle.shelfHeight} aisleNumber={aisle.aisleNumber} categoryName={aisle.categoryName} />
      </group>

      {/* Instanced ESL Digital Price Tag Casings (1 draw call per aisle instead of 108) */}
      <AisleEslCasings slots={displaySlots} />

      {/* Interactive 3D Product Facings & High-Resolution ESL Price Displays */}
      <group>
        {displaySlots.map((slot) => {
          const eslMaterial = getEslMaterial(slot.product.price, slot.product.brand || 'Cadbury');
          return (
            <ShelfProductItem
              key={slot.key}
              slot={slot}
              eslMaterial={eslMaterial}
            />
          );
        })}
      </group>
    </group>
  );
};

export const ShelfUnit = React.memo(ShelfUnitComponent);
