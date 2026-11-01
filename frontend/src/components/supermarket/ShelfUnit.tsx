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
const shelfTextureCache = new Map<string, THREE.Texture>();

// Cached Canvas Textures for ESL digital price tags (High-Res 512x256)
const eslTextureCache = new Map<string, THREE.CanvasTexture>();

function getEslTexture(price: number, brand: string): THREE.CanvasTexture {
  const key = `${price}-${brand}`;
  const existing = eslTextureCache.get(key);
  if (existing) return existing;

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // High-tech dark e-ink background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle casing bezel
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 488, 232);

    // Glowing electric sapphire accent line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 472, 216);

    // Digital ESL Yellow Price
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 96px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`₹${price}`, 36, 104);

    // Brand Label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const cleanBrand = brand && brand.length > 14 ? brand.slice(0, 13) + '..' : (brand || 'Martverse');
    ctx.fillText(cleanBrand, 36, 192);

    // High-tech Digital Barcode pattern on right
    ctx.fillStyle = '#94a3b8';
    const barX = 360;
    const barWidths = [4, 2, 6, 2, 4, 8, 2, 6, 4, 2, 4, 6, 2, 8, 4];
    let currX = barX;
    for (let i = 0; i < barWidths.length; i++) {
      ctx.fillRect(currX, 48, barWidths[i], 156);
      currX += barWidths[i] + (i % 2 === 0 ? 4 : 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  eslTextureCache.set(key, texture);
  return texture;
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
}> = React.memo(({ url, position, scale, rotation, materialType = 'basic', roughness = 0.25, metalness = 0.12, alphaTest = 0.01 }) => {
  const resolvedUrl: string = typeof url === 'object' && url && 'src' in url ? url.src : (url || '/products/sweets/DairyMilk.png');

  const [texture, setTexture] = useState<THREE.Texture | null>(() => {
    return resolvedUrl ? (shelfTextureCache.get(resolvedUrl) || null) : null;
  });

  useEffect(() => {
    if (!resolvedUrl) return;
    if (shelfTextureCache.has(resolvedUrl)) {
      setTexture(shelfTextureCache.get(resolvedUrl)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      resolvedUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        shelfTextureCache.set(resolvedUrl, tex);
        setTexture(tex);
      },
      undefined,
      () => {
        if (resolvedUrl !== '/products/sweets/DairyMilk.png') {
          loader.load('/products/sweets/DairyMilk.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = 16;
            shelfTextureCache.set(resolvedUrl, tex);
            setTexture(tex);
          });
        }
      }
    );
  }, [resolvedUrl]);

  return (
    <mesh position={position} rotation={rotation} geometry={sharedGeometries.plane} scale={[scale[0], scale[1], 1]} raycast={() => null}>
      {texture ? (
        materialType === 'standard' ? (
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={alphaTest}
            roughness={roughness}
            metalness={metalness}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        ) : (
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={alphaTest}
            toneMapped={false}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        )
      ) : (
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      )}
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
  eslTexture: THREE.CanvasTexture;
}

const ShelfProductItem: React.FC<ShelfSlotItemProps> = React.memo(({ slot, eslTexture }) => {
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

  // Pure imperative hover tracking (0 React re-renders on hover, pure 60-120 FPS hardware acceleration)
  const isHoveredRef = useRef(false);
  const currentScale = useRef(1.0);
  const currentLift = useRef(0.0);
  const currentForward = useRef(0.0);
  const isResting = useRef(true);

  useFrame((_, delta) => {
    if (!animGroupRef.current) return;
    if (!isHoveredRef.current && isResting.current) return;

    const targetScale = isHoveredRef.current ? 1.22 : 1.0;
    const targetLift = isHoveredRef.current ? 0.06 : 0.0;
    const targetForward = isHoveredRef.current ? 0.08 : 0.0;

    if (!isHoveredRef.current && Math.abs(currentScale.current - 1.0) < 0.003 && Math.abs(currentLift.current) < 0.003) {
      currentScale.current = 1.0;
      currentLift.current = 0.0;
      currentForward.current = 0.0;
      animGroupRef.current.scale.set(1.0, 1.0, 1.0);
      animGroupRef.current.position.set(0, 0, 0);
      isResting.current = true;
      return;
    }

    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 20, delta);
    currentLift.current = THREE.MathUtils.damp(currentLift.current, targetLift, 20, delta);
    currentForward.current = THREE.MathUtils.damp(currentForward.current, targetForward, 20, delta);

    animGroupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);
    animGroupRef.current.position.set(0, currentLift.current, currentForward.current);
  });

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
          isHoveredRef.current = true;
          isResting.current = false;
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
          isHoveredRef.current = false;
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
            {/* Top Fold Seal Flap */}
            <mesh position={[0, 0.363, 0]} geometry={sharedGeometries.box} scale={[0.23, 0.008, 0.14]} raycast={() => null}>
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* Shelf Edge ESL (Electronic Shelf Label) Tag mounted directly on blue LED rail */}
      <group position={[0, -0.01, 0.44]} raycast={() => null}>
        {/* Sleek Digital ESL Casing */}
        <mesh geometry={sharedGeometries.box} scale={[0.32, 0.12, 0.018]} raycast={() => null}>
          <meshStandardMaterial
            ref={eslMatRef}
            color="#0f172a"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        {/* High-Resolution Digital E-Ink Display Face */}
        <mesh position={[0, 0, 0.012]} geometry={sharedGeometries.plane} scale={[0.30, 0.10, 1]} raycast={() => null}>
          <meshBasicMaterial map={eslTexture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
});

ShelfProductItem.displayName = 'ShelfProductItem';

interface ShelfUnitProps {
  aisle: SupermarketAisle;
  products: Product[];
  floorYOffset: number;
}

const ShelfUnitComponent: React.FC<ShelfUnitProps> = ({ aisle, products, floorYOffset }) => {
  const activeFloor = useMartStore((state) => state.activeFloor);
  const isFloorActive = (floorYOffset > 2 ? 2 : 1) === activeFloor;

  // Floor Culling: if this shelf belongs to the inactive floor, unmount completely!
  if (!isFloorActive) return null;

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
    if (!aisleProducts || aisleProducts.length === 0) return [];

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
  }, [aisleProducts, blockCenters, SHELF_TIERS, centerX, centerY, centerZ, floorYOffset, aisle.aisleNumber, aisle.name, aisle.shelfHeight, aisle.id, aisle.categoryName]);

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

      {/* Central Shelving Rack - Raycast bypassed to keep hover 60+ FPS responsive */}
      <group raycast={() => null}>
        {/* Central Back Divider Wall */}
        <mesh position={[0, 0, 0]} geometry={sharedGeometries.box} scale={[0.08, aisle.shelfHeight, length]}>
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.3} />
        </mesh>

        {/* 3 Horizontal Shelves for LEFT and RIGHT sides */}
        {[0.5, 1.3, 2.1].map((shelfH, sIdx) => {
          const yRel = shelfH - aisle.shelfHeight / 2;
          return (
            <group key={`shelf-tier-${sIdx}`} position={[0, yRel, 0]}>
              {/* Left Shelf Plank */}
              <mesh position={[-0.45, 0, 0]} geometry={sharedGeometries.box} scale={[0.85, 0.04, length]}>
                <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.2} />
              </mesh>
              {/* Left Under-Shelf Linear LED Glow Strip */}
              <mesh position={[-0.45, -0.024, 0]} geometry={sharedGeometries.box} scale={[0.06, 0.012, length]}>
                <meshStandardMaterial color="#bae6fd" emissive="#0284c7" emissiveIntensity={0.75} roughness={0.1} />
              </mesh>
              {/* Left Price Tag Rail */}
              <mesh position={[-0.88, 0, 0]} geometry={sharedGeometries.box} scale={[0.02, 0.06, length]}>
                <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.55} />
              </mesh>
              {/* Left Slim Cyan Neon Accent Edge Line */}
              <mesh position={[-0.892, 0, 0]} geometry={sharedGeometries.box} scale={[0.004, 0.018, length]}>
                <meshBasicMaterial color="#38bdf8" />
              </mesh>

              {/* Right Shelf Plank */}
              <mesh position={[0.45, 0, 0]} geometry={sharedGeometries.box} scale={[0.85, 0.04, length]}>
                <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.2} />
              </mesh>
              {/* Right Under-Shelf Linear LED Glow Strip */}
              <mesh position={[0.45, -0.024, 0]} geometry={sharedGeometries.box} scale={[0.06, 0.012, length]}>
                <meshStandardMaterial color="#bae6fd" emissive="#0284c7" emissiveIntensity={0.75} roughness={0.1} />
              </mesh>
              {/* Right Price Tag Rail */}
              <mesh position={[0.88, 0, 0]} geometry={sharedGeometries.box} scale={[0.02, 0.06, length]}>
                <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.55} />
              </mesh>
              {/* Right Slim Cyan Neon Accent Edge Line */}
              <mesh position={[0.892, 0, 0]} geometry={sharedGeometries.box} scale={[0.004, 0.018, length]}>
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>
          );
        })}

        {/* Upright Support Poles */}
        {[-length / 2, -length / 3, -length / 6, 0, length / 6, length / 3, length / 2].map((zPos, pIdx) => (
          <group key={`post-${pIdx}`} position={[0, 0, zPos]}>
            <group position={[-0.86, 0, 0]}>
              <mesh geometry={sharedGeometries.box} scale={[0.05, aisle.shelfHeight, 0.05]}>
                <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[-0.028, 0, 0]} geometry={sharedGeometries.box} scale={[0.006, aisle.shelfHeight * 0.94, 0.02]}>
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
              </mesh>
            </group>

            <group position={[0.86, 0, 0]}>
              <mesh geometry={sharedGeometries.box} scale={[0.05, aisle.shelfHeight, 0.05]}>
                <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0.028, 0, 0]} geometry={sharedGeometries.box} scale={[0.006, aisle.shelfHeight * 0.94, 0.02]}>
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* 6 Blocks x 3 Items per Block */}
      <group>
        {displaySlots.map((slot) => {
          const eslTexture = getEslTexture(slot.product.price, slot.product.brand || 'Cadbury');
          return (
            <ShelfProductItem
              key={slot.key}
              slot={slot}
              eslTexture={eslTexture}
            />
          );
        })}
      </group>
    </group>
  );
};

export const ShelfUnit = React.memo(ShelfUnitComponent);
