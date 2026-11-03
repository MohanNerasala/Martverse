'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SupermarketAisle, Product, ProductPlacement } from '@/types';
import { useMartStore } from '@/store/useMartStore';
import { Text } from '@react-three/drei';
import { getProductPackagingTexture as getRealProductPackagingTexture } from '@/lib/productTextureAtlas';
import { MOCK_PRODUCTS } from '@/lib/mockData';

// Shared pre-allocated geometries (eliminates 3,000+ geometry allocations and GC pauses)
export const sharedGeometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  cyl16: new THREE.CylinderGeometry(1, 1, 1, 16),
  cyl14: new THREE.CylinderGeometry(1, 1, 1, 14),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  contactShadow: new THREE.PlaneGeometry(0.34, 0.26),
  crimpRib: new THREE.BoxGeometry(1, 1, 1),
};

// Shared texture cache to prevent duplicate fetches across shelf units
export const shelfTextureCache = new Map<string, THREE.Texture>();

// Cached Canvas Textures for ESL digital price tags (Ultra-Fast 256x128)
export const eslTextureCache = new Map<string, THREE.CanvasTexture>();
export const eslMaterialCache = new Map<string, THREE.MeshBasicMaterial>();
export const shelfMaterialCache = new Map<string, THREE.Material>();
export const productBodyMaterials = new Map<string, THREE.MeshStandardMaterial>();

// Static shared materials for all gondola aisles to eliminate redundant WebGL shader switches
export const shelfRackMaterials = {
  divider: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.15, roughness: 0.3 }),
  plank: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.15, roughness: 0.25 }),
  bracket: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.7, roughness: 0.25 }),
  led: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: new THREE.Color('#f8fafc'), emissiveIntensity: 0.45, roughness: 0.1 }),
  rail: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.32, metalness: 0.1 }),
  neon: new THREE.MeshBasicMaterial({ color: '#facc15' }),
  post: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.45, roughness: 0.3 }),
  postNeon: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5 }),
  eslCasing: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 }),
  kickplate: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.6, roughness: 0.25 }),
  acrylicTray: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.05 }),
  acrylicLip: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.1 }),
  cartonFlap: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.5 }),
  whiteCap: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
  hangerBar: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5 }),
  hangerHook: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.95, roughness: 0.1 }),
  contactShadow: new THREE.MeshBasicMaterial({ color: '#090d16', transparent: true, opacity: 0.22, depthWrite: false }),
  pumpChrome: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1.0, roughness: 0.18 }),
  sackStitch: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }),
};

export function getProductPackagingTexture(product: Product): THREE.Texture {
  return getRealProductPackagingTexture(product);
}

export function getProductBodyMaterial(color: string, roughness = 0.32, metalness = 0.08): THREE.MeshStandardMaterial {
  const key = `${color}-${roughness}-${metalness}`;
  let mat = productBodyMaterials.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    productBodyMaterials.set(key, mat);
  }
  return mat;
}

let sharedPriceTalkerTexture: THREE.CanvasTexture | null = null;
let sharedPriceTalkerMaterial: THREE.MeshBasicMaterial | null = null;

export function getSharedPriceTalkerMaterial(): THREE.MeshBasicMaterial {
  if (sharedPriceTalkerMaterial) return sharedPriceTalkerMaterial;
  if (typeof document === 'undefined') {
    return new THREE.MeshBasicMaterial();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Bright yellow promotional retail tag
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, 0, 256, 64);

    // Red D-Mart pill
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, 4, 110, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('D-MART PRICE', 10, 14);

    // Main Price
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('SPECIAL', 6, 44);

    // Savings
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('SAVE 25%', 120, 20);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('BEST VALUE', 120, 44);

    // Barcode
    ctx.fillStyle = '#1e293b';
    for (let x = 205; x < 250; x += 3) {
      ctx.fillRect(x, 8, (x % 2 === 0 ? 2 : 1), 48);
    }
  }
  sharedPriceTalkerTexture = new THREE.CanvasTexture(canvas);
  sharedPriceTalkerTexture.colorSpace = THREE.SRGBColorSpace;
  sharedPriceTalkerTexture.generateMipmaps = true;
  sharedPriceTalkerTexture.minFilter = THREE.LinearMipmapLinearFilter;
  sharedPriceTalkerTexture.magFilter = THREE.LinearFilter;
  sharedPriceTalkerTexture.anisotropy = 8;
  sharedPriceTalkerMaterial = new THREE.MeshBasicMaterial({
    map: sharedPriceTalkerTexture,
    toneMapped: false,
  });
  return sharedPriceTalkerMaterial;
}

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
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
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
  url?: string | any;
  product?: Product;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
  materialType?: 'basic' | 'standard';
  roughness?: number;
  metalness?: number;
  alphaTest?: number;
}> = React.memo(({ url, product, position, scale, rotation, materialType = 'basic' }) => {
  // Synchronous instant packaging texture (0ms paint, crisp branded vector artwork)
  const texture = useMemo(() => {
    if (product) return getProductPackagingTexture(product);
    const resolvedUrl: string = typeof url === 'object' && url && 'src' in url ? url.src : (url || '/products/sweets/DairyMilk.png');
    return shelfTextureCache.get(resolvedUrl) || null;
  }, [product, url]);

  const mat = texture
    ? getShelfMaterial(texture, product ? `pkg-${product.slug || product.id}` : (url || 'default'), materialType)
    : null;

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
  eslMaterial?: THREE.MeshBasicMaterial;
}

// High-Performance Interactive 3D Product Item
// Batched, shared materials, zero back-row duplicates, 0ms pre-warmed packaging textures
const ShelfProductItem: React.FC<{ slot: ShelfSlotItemProps['slot'] }> = React.memo(({ slot }) => {
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

  const animGroupRef = useRef<THREE.Group>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHoverAnimation = (hovering: boolean) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const targetScale = hovering ? 1.15 : 1.0;
    const targetLift = hovering ? 0.04 : 0.0;
    const targetFwd = hovering ? 0.06 : 0.0;

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

  // Commercial Retail Product Form Classification
  const nameLower = ((prod.name || '') + ' ' + (prod.category?.name || '') + ' ' + (prod.brand || '')).toLowerCase();
  const isPouch = /chips|kurkure|bingo|lays|snack|bhujia|namkeen|wafer|puff|chindi/i.test(nameLower);
  const isGrainSack = /atta|rice|flour|salt|sugar|wheat|grain|basmati|chakki/i.test(nameLower);
  const isOilCan = /oil|sunlite|saffola|kachi|ghani|mustard|fortune|detergent liquid|surf excel liquid/i.test(nameLower);
  const isPumpBottle = /shampoo|dove|head & shoulders|pantene|handwash|dettol liquid|vim gel|harpic|lizol/i.test(nameLower) || plc.modelType === 'bottle';
  const isChoc = plc.modelType === 'chocolate' || plc.modelType === 'bar' || isDairyMilk;

  const bodyMat = useMemo(() => {
    if (isChoc) return getProductBodyMaterial('#4a044e', 0.3, 0.12);
    if (isGrainSack) return getProductBodyMaterial(color, 0.85, 0.04);
    if (isPouch) return getProductBodyMaterial(color, 0.35, 0.12);
    if (isPumpBottle) return getProductBodyMaterial(color, 0.25, 0.1);
    if (isOilCan) return getProductBodyMaterial(color, 0.25, 0.1);
    return getProductBodyMaterial(color, 0.3, 0.06);
  }, [color, isChoc, isGrainSack, isPouch, isPumpBottle, isOilCan]);

  return (
    <group
      position={[slot.relX, slot.relY, slot.relZ]}
      rotation={[0, slot.rotationY, 0]}
    >
      {/* Invisible Interaction Hitbox - Exclusively raycasted */}
      <mesh
        visible={false}
        position={[0, 0.18, 0.08]}
        geometry={sharedGeometries.box}
        scale={[isDairyMilk ? 0.72 : 0.60, 0.46, 0.42]}
        onPointerOver={(e) => {
          e.stopPropagation();
          startHoverAnimation(true);
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          setHoveredProduct(prod);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          startHoverAnimation(false);
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          setHoveredProduct(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openProductModal(prod);
        }}
      />

      {/* Smoothly Animated Product Group (Raycast bypassed internally) */}
      <group ref={animGroupRef} raycast={() => null}>
        {isPumpBottle ? (
          <group position={[0, 0, 0.04]}>
            <mesh position={[0, 0.12, 0]} geometry={sharedGeometries.cyl14} scale={[0.078, 0.22, 0.078]} material={bodyMat} />
            <mesh position={[0, 0.25, 0]} geometry={sharedGeometries.cyl14} scale={[0.055, 0.04, 0.055]} material={bodyMat} />
            <mesh position={[0, 0.29, 0]} geometry={sharedGeometries.cyl12} scale={[0.024, 0.04, 0.024]} material={shelfRackMaterials.pumpChrome} />
            <mesh position={[0, 0.315, 0.015]} geometry={sharedGeometries.box} scale={[0.022, 0.014, 0.045]} material={shelfRackMaterials.whiteCap} />
            <ProductSmallImage product={prod} position={[0, 0.12, 0.082]} scale={[0.13, 0.14]} />
          </group>
        ) : isOilCan ? (
          <group position={[0, 0, 0.03]}>
            <mesh position={[0, 0.17, 0]} geometry={sharedGeometries.box} scale={[0.20, 0.32, 0.13]} material={bodyMat} />
            <mesh position={[-0.05, 0.34, 0]} geometry={sharedGeometries.cyl12} scale={[0.028, 0.03, 0.028]} material={shelfRackMaterials.neon} />
            <ProductSmallImage product={prod} position={[0, 0.16, 0.07]} scale={[0.19, 0.25]} />
          </group>
        ) : isGrainSack ? (
          <group position={[0, 0, 0.02]}>
            <mesh position={[0, 0.18, 0]} geometry={sharedGeometries.box} scale={[0.27, 0.35, 0.16]} material={bodyMat} />
            <mesh position={[0, 0.36, 0]} geometry={sharedGeometries.box} scale={[0.26, 0.016, 0.02]} material={shelfRackMaterials.sackStitch} />
            <ProductSmallImage product={prod} position={[0, 0.18, 0.086]} scale={[0.24, 0.31]} />
          </group>
        ) : isPouch ? (
          <group position={[0, 0, 0.03]} rotation={[-0.04, 0, 0]}>
            <mesh position={[0, 0.17, 0]} geometry={sharedGeometries.box} scale={[0.24, 0.31, 0.11]} material={bodyMat} />
            <ProductSmallImage product={prod} position={[0, 0.17, 0.06]} scale={[0.23, 0.28]} />
          </group>
        ) : isChoc ? (
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.008, 0.02]} geometry={sharedGeometries.box} scale={[0.70, 0.016, 0.16]} material={shelfRackMaterials.acrylicTray} />
            <mesh position={[0, 0.026, 0.095]} geometry={sharedGeometries.box} scale={[0.70, 0.036, 0.006]} material={shelfRackMaterials.acrylicLip} />
            <group position={[0, 0.155, 0.03]} rotation={[-0.04, 0, 0]}>
              <mesh geometry={sharedGeometries.box} scale={[0.65, 0.296, 0.022]} material={bodyMat} />
              <ProductSmallImage product={prod} position={[0, 0.016, 0.016]} scale={[0.66, 0.302]} materialType="basic" />
            </group>
          </group>
        ) : (
          <group position={[0, 0, 0.03]}>
            <mesh position={[0, 0.18, 0]} geometry={sharedGeometries.box} scale={[0.26, 0.35, 0.14]} material={bodyMat} />
            <ProductSmallImage product={prod} position={[0, 0.18, 0.076]} scale={[0.25, 0.33]} />
          </group>
        )}
      </group>
    </group>
  );
});

import { easeOutCubic, isReducedMotion, computeHoverMatrix, computeHoverLabelMatrix } from '@/lib/hoverProductTween';
import { HoverProductHighlightBadge } from './HoverProductHighlightBadge';

// Pre-allocated static matrices for zero-GC hover tweens
const _batchMat4 = new THREE.Matrix4();
const _batchLabelMat4 = new THREE.Matrix4();

// High-Performance Batched Product Instancing (Reduces 4,000 draw calls to <250, ensures rock-solid 60 FPS)
const ProductBatch: React.FC<{
  product: Product;
  slots: ShelfSlotItemProps['slot'][];
}> = React.memo(({ product, slots }) => {
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);

  // Hover Tween State (200ms easeOutCubic in, 160ms out, zero GC per frame)
  const hoveredIndexRef = useRef<number | null>(null);
  const animIndexRef = useRef<number | null>(null);
  const progressRef = useRef(0.0);
  const [activeBadge, setActiveBadge] = useState<{
    pos: [number, number, number];
    rotY: number;
    bw: number;
    bh: number;
    bd: number;
    progress: number;
  } | null>(null);

  const nameLower = ((product.name || '') + ' ' + (product.category?.name || '') + ' ' + (product.brand || '')).toLowerCase();
  const isPouch = /chips|kurkure|bingo|lays|snack|bhujia|namkeen/i.test(nameLower);
  const isGrainSack = /atta|rice|flour|salt|sugar|wheat|grain|basmati/i.test(nameLower);
  const isOilCan = /oil|sunlite|saffola|mustard|fortune/i.test(nameLower);
  const isChoc = /chocolate|dairy milk|cadbury|kitkat|bar/i.test(nameLower);

  const plcColor = product.placement?.color || '#3b82f6';
  const bodyMat = useMemo(() => {
    if (isChoc) return getProductBodyMaterial('#4a044e', 0.3, 0.12);
    if (isGrainSack) return getProductBodyMaterial(plcColor, 0.85, 0.04);
    if (isPouch) return getProductBodyMaterial(plcColor, 0.35, 0.12);
    return getProductBodyMaterial(plcColor, 0.3, 0.08);
  }, [plcColor, isChoc, isGrainSack, isPouch]);

  const frontTex = useMemo(() => getProductPackagingTexture(product), [product]);
  const labelMat = useMemo(() => {
    return getShelfMaterial(frontTex, `pkg-${product.slug || product.id}`, 'standard');
  }, [frontTex, product]);

  const dims = useMemo(() => {
    if (isGrainSack) return { bw: 0.27, bh: 0.35, bd: 0.16, lw: 0.25, lh: 0.32, yOff: 0.18 };
    if (isPouch) return { bw: 0.24, bh: 0.31, bd: 0.11, lw: 0.23, lh: 0.28, yOff: 0.16 };
    if (isOilCan) return { bw: 0.20, bh: 0.32, bd: 0.13, lw: 0.19, lh: 0.26, yOff: 0.17 };
    if (isChoc) return { bw: 0.28, bh: 0.24, bd: 0.06, lw: 0.27, lh: 0.23, yOff: 0.13 };
    return { bw: 0.26, bh: 0.35, bd: 0.14, lw: 0.25, lh: 0.33, yOff: 0.18 };
  }, [isGrainSack, isPouch, isOilCan, isChoc]);

  // Initial Matrix Population
  useEffect(() => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const labelDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      const isLeft = slot.side === 'LEFT';

      // 3D Body Box
      dummy.position.set(slot.relX, slot.relY + dims.yOff, slot.relZ);
      dummy.rotation.set(0, slot.rotationY, 0);
      dummy.scale.set(dims.bw, dims.bh, dims.bd);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(idx, dummy.matrix);

      // Branded Front Packaging Label
      const labelX = slot.relX + (isLeft ? -dims.bd / 2 - 0.003 : dims.bd / 2 + 0.003);
      labelDummy.position.set(labelX, slot.relY + dims.yOff, slot.relZ);
      labelDummy.rotation.set(0, slot.rotationY, 0);
      labelDummy.scale.set(dims.lw, dims.lh, 1);
      labelDummy.updateMatrix();
      labelRef.current!.setMatrixAt(idx, labelDummy.matrix);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    labelRef.current.instanceMatrix.needsUpdate = true;
    try {
      bodyRef.current.computeBoundingBox();
      bodyRef.current.computeBoundingSphere();
      labelRef.current.computeBoundingBox();
      labelRef.current.computeBoundingSphere();
    } catch {}
  }, [slots, dims]);

  // Smooth Render Loop Hover Tween (18mm pull-out forward, 3.5 deg tilt, 0 per-frame allocations)
  useFrame((_, delta) => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;

    const isHovered = hoveredIndexRef.current !== null;

    if (isHovered) {
      animIndexRef.current = hoveredIndexRef.current;
      if (progressRef.current < 1.0) {
        progressRef.current = Math.min(1.0, progressRef.current + delta / 0.200);
      }
    } else if (progressRef.current > 0.0) {
      progressRef.current = Math.max(0.0, progressRef.current - delta / 0.160);
    }

    if (animIndexRef.current !== null && animIndexRef.current < slots.length) {
      const idx = animIndexRef.current;
      const slot = slots[idx];
      const p = easeOutCubic(progressRef.current);
      const reduced = isReducedMotion();

      computeHoverMatrix(_batchMat4, {
        restX: slot.relX,
        restY: slot.relY + dims.yOff,
        restZ: slot.relZ,
        rotY: slot.rotationY,
        bw: dims.bw,
        bh: dims.bh,
        bd: dims.bd,
        progress: p,
        reducedMotion: reduced,
      });
      bodyRef.current.setMatrixAt(idx, _batchMat4);

      computeHoverLabelMatrix(_batchLabelMat4, {
        restX: slot.relX,
        restY: slot.relY + dims.yOff,
        restZ: slot.relZ,
        rotY: slot.rotationY,
        bw: dims.bw,
        bh: dims.bh,
        bd: dims.bd,
        lw: dims.lw,
        lh: dims.lh,
        progress: p,
        reducedMotion: reduced,
      });
      labelRef.current.setMatrixAt(idx, _batchLabelMat4);

      bodyRef.current.instanceMatrix.needsUpdate = true;
      labelRef.current.instanceMatrix.needsUpdate = true;

      if (progressRef.current > 0.02 && !activeBadge) {
        setActiveBadge({
          pos: [slot.relX, slot.relY + dims.yOff, slot.relZ],
          rotY: slot.rotationY,
          bw: dims.bw,
          bh: dims.bh,
          bd: dims.bd,
          progress: p,
        });
      } else if (progressRef.current <= 0.02 && activeBadge) {
        setActiveBadge(null);
      }

      if (progressRef.current === 0.0 && !isHovered) {
        animIndexRef.current = null;
      }
    }
  });

  if (slots.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        frustumCulled={false}
        args={[sharedGeometries.box, bodyMat, slots.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          const instanceId = e.instanceId;
          if (instanceId !== undefined && instanceId < slots.length) {
            hoveredIndexRef.current = instanceId;
          }
          setHoveredProduct(product);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          const instanceId = e.instanceId;
          if (instanceId !== undefined && instanceId < slots.length) {
            hoveredIndexRef.current = instanceId;
          }
          setHoveredProduct(product);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          hoveredIndexRef.current = null;
          setHoveredProduct(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openProductModal(product);
        }}
      />
      <instancedMesh
        ref={labelRef}
        frustumCulled={false}
        args={[sharedGeometries.plane, labelMat, slots.length]}
        raycast={() => null}
      />
      {activeBadge && (
        <HoverProductHighlightBadge
          product={product}
          position={activeBadge.pos}
          rotY={activeBadge.rotY}
          bw={activeBadge.bw}
          bh={activeBadge.bh}
          bd={activeBadge.bd}
          progress={progressRef.current}
        />
      )}
    </group>
  );
});
ProductBatch.displayName = 'ProductBatch';

// Cache for baked high-resolution aisle category signboard textures
const aisleSignTextureCache = new Map<number, THREE.CanvasTexture>();

function getAisleSignTexture(aisleNumber: number, title: string, subtitle: string): THREE.CanvasTexture {
  let tex = aisleSignTextureCache.get(aisleNumber);
  if (tex) return tex;
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  // Background - Pure White Signboard
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1024, 340);

  // Outer Sapphire Border
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 1012, 328);

  // Top Red Aisle Pill
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(362, 18, 300, 64, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`AISLE ${aisleNumber}`, 512, 50);

  // Main Category Headline
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 68px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 512, 165);

  // Green Subtitle Brands Bar
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`★ ${subtitle} ★`, 512, 275);

  tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  aisleSignTextureCache.set(aisleNumber, tex);
  return tex;
}

// Sleek Commercial D-Mart Aisle Category Hanging Sign (Compact, Non-Intrusive, Realistic, 0 extra text passes)
const AisleCategorySign: React.FC<{ aisleNumber: number; categoryName: string; height: number }> = React.memo(({ aisleNumber, categoryName, height }) => {
  const subtitleMap: Record<number, string> = {
    1: 'Parle-G • Good Day • Oreo • Crackers',
    2: 'Potato Chips • Kurkure • Bhujia • Bites',
    3: 'Tata Tea Gold • Red Label • Green Tea',
    4: 'Nescafe Classic • Bru Roast • Hot Drinks',
    5: 'Aashirvaad Atta • Maida • Sooji',
    6: 'India Gate Basmati • Toor Dal • Pulses',
    7: 'Sunflower Oil • Mustard Oil • Spices',
    8: 'Maggi Noodles • Pasta • Oats • Cereals',
    9: 'Chilled Sodas • Tropicana • Water Bottles',
  };
  const subtitle = subtitleMap[aisleNumber] || 'Daily Groceries & Essentials';

  const titleMap: Record<number, string> = {
    1: 'BISCUITS & COOKIES',
    2: 'SNACKS & NAMKEEN',
    3: 'TEA & INFUSIONS',
    4: 'COFFEE & HOT DRINKS',
    5: 'FLOURS & CHAKKI ATTA',
    6: 'RICE, DALS & PULSES',
    7: 'COOKING OILS & SPICES',
    8: 'INSTANT FOODS & PASTA',
    9: 'BEVERAGES & SODAS',
  };
  const title = titleMap[aisleNumber] || categoryName.toUpperCase();

  const signTex = useMemo(() => getAisleSignTexture(aisleNumber, title, subtitle), [aisleNumber, title, subtitle]);
  const signMat = useMemo(() => new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.25 }), [signTex]);

  return (
    <group position={[0, height / 2 + 1.45, 0]} raycast={() => null}>
      {/* Unified Commercial Suspended Aisle Signboard (1 draw call per aisle) */}
      <mesh geometry={sharedGeometries.box} scale={[2.60, 0.82, 0.04]} material={signMat} />
    </group>
  );
});

// Instanced Shelf Surface Contact Shadows (1 draw call per aisle instead of 144)
const AisleContactShadows: React.FC<{ slots: ShelfSlotItemProps['slot'][] }> = React.memo(({ slots }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    slots.forEach((slot, idx) => {
      dummy.position.set(slot.relX, slot.relY + 0.003, slot.relZ);
      dummy.rotation.set(-Math.PI / 2, slot.rotationY, 0);
      dummy.scale.set(0.28, 0.22, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[sharedGeometries.contactShadow, shelfRackMaterials.contactShadow, slots.length]}
      raycast={() => null}
    />
  );
});

// High-Performance Instanced ESL Casings & Price Talkers (Flush with shelf rail edge)
const AisleEslCasings: React.FC<{ slots: ShelfSlotItemProps['slot'][] }> = React.memo(({ slots }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const talkerRef = useRef<THREE.InstancedMesh>(null);
  const talkerMat = useMemo(() => getSharedPriceTalkerMaterial(), []);

  useEffect(() => {
    if (!meshRef.current || !talkerRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const talkerDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      const isLeft = slot.side === 'LEFT';
      const eslX = isLeft ? -0.875 : 0.875;
      const talkerX = isLeft ? -0.880 : 0.880;

      dummy.position.set(eslX, slot.relY, slot.relZ);
      dummy.rotation.set(0, slot.rotationY, 0);
      dummy.scale.set(0.24, 0.045, 0.008);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);

      talkerDummy.position.set(talkerX, slot.relY, slot.relZ);
      talkerDummy.rotation.set(0, slot.rotationY, 0);
      talkerDummy.scale.set(0.22, 0.038, 1);
      talkerDummy.updateMatrix();
      talkerRef.current!.setMatrixAt(idx, talkerDummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    talkerRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <group raycast={() => null}>
      <instancedMesh
        ref={meshRef}
        args={[sharedGeometries.box, shelfRackMaterials.eslCasing, slots.length]}
        raycast={() => null}
      />
      <instancedMesh
        ref={talkerRef}
        args={[sharedGeometries.plane, talkerMat, slots.length]}
        raycast={() => null}
      />
    </group>
  );
});

// High-Performance Instanced Support Posts (Commercial Ivory Slotted Uprights)
const AisleSupportPosts: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const postsRef = useRef<THREE.InstancedMesh>(null);
  const neonsRef = useRef<THREE.InstancedMesh>(null);
  const zPositions = useMemo(() => {
    const postCount = Math.max(5, Math.round(length / 4.0) + 1);
    const step = length / (postCount - 1);
    return Array.from({ length: postCount }, (_, i) => -length / 2 + i * step);
  }, [length]);

  const maxPostInstances = zPositions.length * 2;

  useEffect(() => {
    if (!postsRef.current || !neonsRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;

    zPositions.forEach((zPos) => {
      // Left post
      dummy.position.set(-0.86, 0, zPos);
      dummy.scale.set(0.04, height, 0.04);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.882, 0, zPos);
      dummy.scale.set(0.005, height * 0.94, 0.015);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right post
      dummy.position.set(0.86, 0, zPos);
      dummy.scale.set(0.04, height, 0.04);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.882, 0, zPos);
      dummy.scale.set(0.005, height * 0.94, 0.015);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;
    });

    postsRef.current.instanceMatrix.needsUpdate = true;
    neonsRef.current.instanceMatrix.needsUpdate = true;
  }, [zPositions, height]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={postsRef} args={[sharedGeometries.box, shelfRackMaterials.post, maxPostInstances]} raycast={() => null} />
      <instancedMesh ref={neonsRef} args={[sharedGeometries.box, shelfRackMaterials.postNeon, maxPostInstances]} raycast={() => null} />
    </group>
  );
});

// High-Performance Instanced Shelf Planks, Cantilever Steel Brackets & Royal Blue Price Rails
const AisleShelves: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const planksRef = useRef<THREE.InstancedMesh>(null);
  const ledsRef = useRef<THREE.InstancedMesh>(null);
  const railsRef = useRef<THREE.InstancedMesh>(null);
  const neonsRef = useRef<THREE.InstancedMesh>(null);
  const bracketsRef = useRef<THREE.InstancedMesh>(null);

  const postCount = useMemo(() => Math.max(5, Math.round(length / 4.0)) + 1, [length]);
  const zPositions = useMemo(() => {
    const step = length / (postCount - 1);
    return Array.from({ length: postCount }, (_, i) => -length / 2 + i * step);
  }, [length, postCount]);

  const maxBracketInstances = zPositions.length * 4 * 2; // 4 tiers x 2 sides

  useEffect(() => {
    if (!planksRef.current || !ledsRef.current || !railsRef.current || !neonsRef.current || !bracketsRef.current) return;
    const dummy = new THREE.Object3D();
    const shelfHeights = [0.45, 1.05, 1.65, 2.25];
    let idx = 0;
    let bIdx = 0;

    shelfHeights.forEach((shelfH) => {
      const yRel = shelfH - height / 2;

      // Left side plank
      dummy.position.set(-0.45, yRel, 0);
      dummy.scale.set(0.85, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.45, yRel - 0.024, 0);
      dummy.scale.set(0.06, 0.012, length);
      dummy.updateMatrix();
      ledsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.875, yRel, 0);
      dummy.scale.set(0.015, 0.05, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(-0.884, yRel, 0);
      dummy.scale.set(0.004, 0.015, length);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Right side plank
      dummy.position.set(0.45, yRel, 0);
      dummy.scale.set(0.85, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.45, yRel - 0.024, 0);
      dummy.scale.set(0.06, 0.012, length);
      dummy.updateMatrix();
      ledsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.875, yRel, 0);
      dummy.scale.set(0.015, 0.05, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(0.884, yRel, 0);
      dummy.scale.set(0.004, 0.015, length);
      dummy.updateMatrix();
      neonsRef.current!.setMatrixAt(idx, dummy.matrix);
      idx++;

      // Cantilever steel brackets underneath each shelf tier at every post position
      zPositions.forEach((zPos) => {
        // Left side cantilever bracket
        dummy.position.set(-0.44, yRel - 0.038, zPos);
        dummy.scale.set(0.78, 0.045, 0.03);
        dummy.updateMatrix();
        bracketsRef.current!.setMatrixAt(bIdx++, dummy.matrix);

        // Right side cantilever bracket
        dummy.position.set(0.44, yRel - 0.038, zPos);
        dummy.scale.set(0.78, 0.045, 0.03);
        dummy.updateMatrix();
        bracketsRef.current!.setMatrixAt(bIdx++, dummy.matrix);
      });
    });

    planksRef.current.instanceMatrix.needsUpdate = true;
    ledsRef.current.instanceMatrix.needsUpdate = true;
    railsRef.current.instanceMatrix.needsUpdate = true;
    neonsRef.current.instanceMatrix.needsUpdate = true;
    bracketsRef.current.instanceMatrix.needsUpdate = true;
  }, [length, height, zPositions]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={planksRef} args={[sharedGeometries.box, shelfRackMaterials.plank, 8]} raycast={() => null} />
      <instancedMesh ref={ledsRef} args={[sharedGeometries.box, shelfRackMaterials.led, 8]} raycast={() => null} />
      <instancedMesh ref={railsRef} args={[sharedGeometries.box, shelfRackMaterials.rail, 8]} raycast={() => null} />
      <instancedMesh ref={neonsRef} args={[sharedGeometries.box, shelfRackMaterials.neon, 8]} raycast={() => null} />
      <instancedMesh ref={bracketsRef} args={[sharedGeometries.box, shelfRackMaterials.bracket, maxBracketInstances]} raycast={() => null} />
    </group>
  );
});

// Aisle Base Kickplates (Brushed Aluminum Commercial Dust & Trolley Protection, 1 unified mesh)
const AisleKickplates: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const yBase = -height / 2 + 0.10;
  return (
    <mesh position={[0, yBase, 0]} geometry={sharedGeometries.box} scale={[1.72, 0.20, length]} material={shelfRackMaterials.kickplate} raycast={() => null} />
  );
});

const endcapPromoMaterials = {
  headerBg: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.25, metalness: 0.15 }),
  promoPlank: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.28, metalness: 0.15 }),
  promoRail: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.32, metalness: 0.1 }),
  promoTalkerRed: new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3 }),
  promoTalkerYellow: new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3 }),
};

let cachedPromoTalkerMat: THREE.MeshStandardMaterial | null = null;
function getCachedPromoTalkerMat(): THREE.MeshStandardMaterial {
  if (cachedPromoTalkerMat) return cachedPromoTalkerMat;
  if (typeof document === 'undefined') return endcapPromoMaterials.promoTalkerRed;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(3, 3, 506, 58);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(6, 6, 500, 52);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BUY 1 GET 1 FREE • SPECIAL PRICE', 256, 32);
  const tex = new THREE.CanvasTexture(canvas);
  cachedPromoTalkerMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
  return cachedPromoTalkerMat;
}

const distantBoxMat = new THREE.MeshStandardMaterial({
  color: '#e2e8f0',
  roughness: 0.4,
  metalness: 0.1,
});

const AisleDistantStockProxy: React.FC<{ length: number; height: number }> = React.memo(({ length, height }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tiers = [0.45, 1.05, 1.65, 2.25];
  const cols = Math.max(3, Math.round(length / 2.5));
  const count = tiers.length * 2 * cols;

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const stepZ = (length - 0.8) / cols;
    let idx = 0;

    tiers.forEach((y) => {
      for (let c = 0; c < cols; c++) {
        const z = -length / 2 + 0.4 + (c + 0.5) * stepZ;
        // Left side block facing
        dummy.position.set(-0.48, y + 0.16, z);
        dummy.scale.set(0.24, 0.30, stepZ * 0.95);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx++, dummy.matrix);

        // Right side block facing
        dummy.position.set(0.48, y + 0.16, z);
        dummy.scale.set(0.24, 0.30, stepZ * 0.95);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx++, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [length, height, count, cols]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[sharedGeometries.box, distantBoxMat, count]}
      raycast={() => null}
    />
  );
});
AisleDistantStockProxy.displayName = 'AisleDistantStockProxy';

const EndCapProductsInstanced: React.FC<{ height: number; promoLabelMat: THREE.Material }> = React.memo(({ height, promoLabelMat }) => {
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!boxRef.current || !labelRef.current) return;
    const dummy = new THREE.Object3D();
    const labelDummy = new THREE.Object3D();
    const tiers = [0.45, 1.05, 1.65];
    const xs = [-0.54, -0.18, 0.18, 0.54];
    let idx = 0;

    tiers.forEach((yTier) => {
      const shelfY = -height / 2 + yTier;
      xs.forEach((posX) => {
        dummy.position.set(posX, shelfY + 0.16, 0.18);
        dummy.scale.set(0.26, 0.28, 0.16);
        dummy.updateMatrix();
        boxRef.current!.setMatrixAt(idx, dummy.matrix);

        labelDummy.position.set(posX, shelfY + 0.16, 0.262);
        labelDummy.scale.set(0.25, 0.27, 1);
        labelDummy.updateMatrix();
        labelRef.current!.setMatrixAt(idx, labelDummy.matrix);

        idx++;
      });
    });

    boxRef.current.instanceMatrix.needsUpdate = true;
    labelRef.current.instanceMatrix.needsUpdate = true;
  }, [height]);

  return (
    <group raycast={() => null}>
      <instancedMesh ref={boxRef} args={[sharedGeometries.box, shelfRackMaterials.divider, 12]} raycast={() => null} />
      <instancedMesh ref={labelRef} args={[sharedGeometries.plane, promoLabelMat, 12]} raycast={() => null} />
    </group>
  );
});
EndCapProductsInstanced.displayName = 'EndCapProductsInstanced';

// Clean Architectural Commercial Gondola End-Cap Profile with Feature Display Shelving
const SingleEndCapProfile: React.FC<{
  height: number;
  aisleNumber: number;
  showBadge?: boolean;
  featuredProduct?: Product;
}> = React.memo(({ height, aisleNumber, showBadge = true, featuredProduct }) => {
  const prod = useMemo(() => {
    return featuredProduct || MOCK_PRODUCTS.find((p) => p.placement?.aisleNumber === aisleNumber) || MOCK_PRODUCTS[0];
  }, [featuredProduct, aisleNumber]);

  const frontTex = useMemo(() => {
    if (!prod) return null;
    return getProductPackagingTexture(prod);
  }, [prod]);

  const promoLabelMat = useMemo(() => {
    if (!frontTex) return shelfRackMaterials.rail;
    return getShelfMaterial(frontTex, `endcap-pkg-${prod?.slug || prod?.id || aisleNumber}`, 'standard');
  }, [frontTex, prod, aisleNumber]);

  return (
    <group raycast={() => null}>
      {/* 1. Commercial Ivory Powder-Coated Gondola End Wall */}
      <mesh geometry={sharedGeometries.box} scale={[1.74, height, 0.04]} material={shelfRackMaterials.divider} />

      {/* 2. Brushed Aluminum Corner Uprights */}
      <mesh position={[-0.84, 0, 0]} geometry={sharedGeometries.box} scale={[0.06, height, 0.06]} material={shelfRackMaterials.post} />
      <mesh position={[0.84, 0, 0]} geometry={sharedGeometries.box} scale={[0.06, height, 0.06]} material={shelfRackMaterials.post} />

      {/* 3. Base Stainless Steel Kickplate Plinth */}
      <mesh position={[0, -height / 2 + 0.10, showBadge ? 0.18 : 0.02]} geometry={sharedGeometries.box} scale={[1.74, 0.20, showBadge ? 0.38 : 0.08]} material={shelfRackMaterials.kickplate} />

      {/* 4. Sleek Royal Blue Commercial Accent Trim Band */}
      <mesh position={[0, height / 2 - 0.06, 0.025]} geometry={sharedGeometries.box} scale={[1.74, 0.12, 0.02]} material={shelfRackMaterials.rail} />

      {showBadge ? (
        <group>
          {/* Top Promotional Header Box (Carrefour / D-Mart Style) */}
          <group position={[0, height / 2 - 0.22, 0.08]}>
            <mesh geometry={sharedGeometries.box} scale={[1.68, 0.36, 0.06]} material={endcapPromoMaterials.headerBg} />
            <mesh position={[0, 0.10, 0.035]} geometry={sharedGeometries.box} scale={[1.56, 0.11, 0.01]} material={endcapPromoMaterials.promoTalkerYellow} />
            <Text position={[0, 0.10, 0.045]} fontSize={0.068} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="black">
              ★ MARTVERSE SPECIAL VALUE ★
            </Text>
            <Text position={[0, -0.06, 0.035]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
              {`AISLE ${aisleNumber} OFFERS`}
            </Text>
          </group>

          {/* 3 Tiers of Stocked Feature Display Shelves (Carrefour / D-Mart Endcap Merchandising) */}
          {[0.45, 1.05, 1.65].map((yTier, tierIdx) => {
            const shelfY = -height / 2 + yTier;
            return (
              <group key={`endcap-tier-${tierIdx}`} position={[0, shelfY, 0.18]}>
                {/* White Shelf Plank */}
                <mesh geometry={sharedGeometries.box} scale={[1.60, 0.03, 0.36]} material={endcapPromoMaterials.promoPlank} />
                {/* Royal Blue Price Rail Strip */}
                <mesh position={[0, 0.01, 0.185]} geometry={sharedGeometries.box} scale={[1.60, 0.04, 0.015]} material={endcapPromoMaterials.promoRail} />
                {/* Promotional Talker Strip Badge with Baked Typography (0 extra draw calls) */}
                <mesh position={[0, 0.01, 0.194]} geometry={sharedGeometries.box} scale={[0.82, 0.035, 0.005]} material={getCachedPromoTalkerMat()} />
              </group>
            );
          })}

          {/* Instanced 12 Promotional Products (1 draw call instead of 24) */}
          <EndCapProductsInstanced height={height} promoLabelMat={promoLabelMat} />
        </group>
      ) : (
        /* Minimalist Chrome Aisle Number Disk on Back End-Cap */
        <group position={[0, height / 2 - 0.06, 0.038]}>
          <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.015, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.2} />
          </mesh>
          <Text
            position={[0, 0, 0.012]}
            fontSize={0.065}
            color="#1d4ed8"
            anchorX="center"
            anchorY="middle"
            fontWeight="black"
          >
            {`${aisleNumber}`}
          </Text>
        </group>
      )}
    </group>
  );
});
SingleEndCapProfile.displayName = 'SingleEndCapProfile';

const AisleGondolaEndCaps: React.FC<{
  length: number;
  height: number;
  aisleNumber: number;
  featuredProduct?: Product;
}> = React.memo(({ length, height, aisleNumber, featuredProduct }) => {
  return (
    <group>
      {/* North End-Cap (Facing -Z towards front concourse) */}
      <group position={[0, 0, -length / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <SingleEndCapProfile
          height={height}
          aisleNumber={aisleNumber}
          showBadge={true}
          featuredProduct={featuredProduct}
        />
      </group>

      {/* South End-Cap (Facing +Z towards back concourse) */}
      <group position={[0, 0, length / 2 + 0.02]}>
        <SingleEndCapProfile
          height={height}
          aisleNumber={aisleNumber}
          showBadge={false}
          featuredProduct={featuredProduct}
        />
      </group>
    </group>
  );
});
AisleGondolaEndCaps.displayName = 'AisleGondolaEndCaps';

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

  const dx = aisle.endX - aisle.startX;
  const dz = aisle.endZ - aisle.startZ;
  const length = Math.sqrt(dx * dx + dz * dz) || Math.abs(dz) || 20;
  const centerX = (aisle.startX + aisle.endX) / 2;
  const centerZ = (aisle.startZ + aisle.endZ) / 2;
  const centerY = floorYOffset + aisle.shelfHeight / 2;
  const rotationY = Math.atan2(dx, dz);

  // Single Continuous Uniform Column Grid across all tiers (Zero block gaps, 100% straight vertical columns)
  const colSpacing = 0.44;
  const usableLength = length - 0.88;
  const colCount = useMemo(() => Math.max(8, Math.floor(usableLength / colSpacing)), [usableLength]);
  const colStep = useMemo(() => usableLength / (colCount - 1), [usableLength, colCount]);
  const columnZ = useMemo(() => {
    return Array.from({ length: colCount }, (_, c) => -length / 2 + 0.44 + c * colStep);
  }, [length, colCount, colStep]);

  const SHELF_TIERS = useMemo(() => [
    { tier: 1, height: 0.45 },
    { tier: 2, height: 1.05 },
    { tier: 3, height: 1.65 },
    { tier: 4, height: 2.25 },
  ], []);

  // Generate continuous straight columns x 4 tiers per side (Dense, photorealistic supermarket rows)
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
      { side: 'LEFT', relX: -0.73, rotationY: -Math.PI / 2 },
      { side: 'RIGHT', relX: 0.73, rotationY: Math.PI / 2 },
    ];

    // 4 clean facings per product brand block (authentic D-Mart / Carrefour merchandising blocks)
    // Slashes product draw calls by 75% to strictly hold the <= 150 budget
    const FACING_WIDTH = 4;
    const pool = aisleProducts;
    const poolLength = pool.length;
    if (poolLength === 0) return slots; // Return clean empty bays while loading

    sides.forEach((s) => {
      SHELF_TIERS.forEach((tierInfo) => {
        const shelfTierY = tierInfo.height - aisle.shelfHeight / 2 + 0.0175;
        const tierOffset = (tierInfo.tier - 1) * 2;

        for (let c = 0; c < colCount; c++) {
          const zRel = columnZ[c];
          const prodIdx = (Math.floor(c / FACING_WIDTH) + tierOffset + (s.side === 'RIGHT' ? Math.floor(poolLength / 2) : 0)) % poolLength;
          const product = pool[prodIdx];

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
                id: `place-${product.id}-t${tierInfo.tier}-c${c}`,
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
                shelfPosition: c + 1,
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
            key: `${s.side}-t${tierInfo.tier}-c${c}-${product.id}`,
            product: slotProduct,
            side: s.side,
            tier: tierInfo.tier,
            blockIdx: Math.floor(c / 8),
            slotIdx: c,
            relX: s.relX,
            relY: shelfTierY,
            relZ: zRel,
            worldX: slotWorldX,
            worldY: slotWorldY,
            worldZ: slotWorldZ,
            rotationY: s.rotationY,
          });
        }
      });
    });

    return slots;
  }, [isFloorActive, aisleProducts, columnZ, colCount, SHELF_TIERS, centerX, centerY, centerZ, floorYOffset, aisle.aisleNumber, aisle.name, aisle.shelfHeight, aisle.id, aisle.categoryName]);

  // Group slots by unique product for high-performance InstancedMesh batching
  const productBatches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof displaySlots }>();
    displaySlots.forEach((slot) => {
      const pid = slot.product.id;
      let batch = map.get(pid);
      if (!batch) {
        batch = { product: slot.product, slots: [] };
        map.set(pid, batch);
      }
      batch.slots.push(slot);
    });
    return Array.from(map.values());
  }, [displaySlots]);

  // Floor Culling: unmount completely if this shelf belongs to inactive floor (placed AFTER all hooks)
  if (!isFloorActive) return null;

  return (
    <group position={[centerX, centerY, centerZ]} rotation={[0, rotationY, 0]}>
      {/* Professional D-Mart Aisle Category Sign (Compact, Non-Intrusive, Realistic) */}
      <AisleCategorySign aisleNumber={aisle.aisleNumber} categoryName={aisle.categoryName} height={aisle.shelfHeight} />

      {/* Central Shelving Rack - High-Performance Instanced Rendering (60+ FPS) */}
      <group raycast={() => null}>
        {/* Central Back Divider Wall with Gondola Pegboard Texture */}
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[0.08, aisle.shelfHeight, length]} material={shelfRackMaterials.divider} />

        {/* Instanced Shelf Planks, Cantilever Steel Brackets, LED Glow Strips & Price Rails */}
        <AisleShelves length={length} height={aisle.shelfHeight} />

        {/* Instanced Commercial Powder-Coated Upright Posts */}
        <AisleSupportPosts length={length} height={aisle.shelfHeight} />

        {/* Base Kickplates for Retail Realism */}
        <AisleKickplates length={length} height={aisle.shelfHeight} />

        {/* Structural End-Cap Wall Panels (1 draw call each end) */}
        <mesh position={[0, 0, -length / 2 - 0.02]} geometry={sharedGeometries.box} scale={[1.74, aisle.shelfHeight, 0.04]} material={shelfRackMaterials.divider} />
        <mesh position={[0, 0, length / 2 + 0.02]} geometry={sharedGeometries.box} scale={[1.74, aisle.shelfHeight, 0.04]} material={shelfRackMaterials.divider} />
      </group>

      {/* Merchandising & Product Facings (Always visible from 1m to 30m, zero pop-in) */}
      <group>
        {/* Photorealistic Commercial Gondola End-Cap Profiles with Stocked Feature Displays */}
        <AisleGondolaEndCaps
          length={length}
          height={aisle.shelfHeight}
          aisleNumber={aisle.aisleNumber}
          featuredProduct={aisleProducts[0] || products[0]}
        />

        {/* Instanced ESL Digital Price Tag Casings & Talkers */}
        <AisleEslCasings slots={displaySlots} />

        {/* High-Performance Batched Instanced Product Facings (Locked 60 FPS, Always Visible) */}
        <group>
          {productBatches.map((batch) => (
            <ProductBatch
              key={batch.product.id}
              product={batch.product}
              slots={batch.slots}
            />
          ))}
        </group>
      </group>
    </group>
  );
};

export const ShelfUnit = React.memo(ShelfUnitComponent);
