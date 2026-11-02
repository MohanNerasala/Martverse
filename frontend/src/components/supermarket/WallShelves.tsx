'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useMartStore } from '@/store/useMartStore';
import { Product, ProductPlacement } from '@/types';
import {
  getProductPackagingTexture,
  getProductBodyMaterial,
  getShelfMaterial,
  getSharedPriceTalkerMaterial,
  sharedGeometries,
} from './ShelfUnit';

// Pre-allocated static materials for wall shelving and warehouse pallet racking
const wallRackMaterials = {
  upright: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.6, roughness: 0.25 }),
  plank: new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.15, roughness: 0.25 }),
  rail: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.32, metalness: 0.1 }),
  neon: new THREE.MeshBasicMaterial({ color: '#facc15' }),
  bracket: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.7, roughness: 0.2 }),
  kickplate: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.25 }),
  eslCasing: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 }),
  contactShadow: new THREE.MeshBasicMaterial({ color: '#090d16', transparent: true, opacity: 0.22, depthWrite: false }),

  // Warehouse Pallet Rack Structural Steel (Safety Orange & Yellow)
  palletUpright: new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.35, metalness: 0.2 }),
  palletBeam: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.3, metalness: 0.15 }),
  palletWood: new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.75, metalness: 0.05 }),
  palletFoot: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6, metalness: 0.4 }),
  headerSignBg: new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.2, roughness: 0.3 }),
};

// ---------------------------------------------------------------------------
// 1. LEFT WALL RETAIL SHELVING (Household & Personal Care, 36m long, 3.4m tall)
// ---------------------------------------------------------------------------
const LeftWallRetailShelving: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const length = 36.0;
  const height = 3.4;
  const startZ = -18.0;
  const endZ = 18.0;
  const wallX = -34.8;

  // Filter household & personal care products
  const leftWallProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = (p.category?.name || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return (
        cat.includes('household') ||
        cat.includes('cleaning') ||
        cat.includes('personal') ||
        cat.includes('toiletries') ||
        cat.includes('beauty') ||
        name.includes('surf') ||
        name.includes('vim') ||
        name.includes('harpic') ||
        name.includes('dove') ||
        name.includes('dettol') ||
        name.includes('lux') ||
        name.includes('colgate')
      );
    });
  }, [products]);

  // 5 Shelf Tiers for tall wall shelving
  const tiers = useMemo(() => [0.45, 1.10, 1.75, 2.40, 3.05], []);

  // Continuous straight column positions along Z
  const colSpacing = 0.46;
  const usableLength = length - 1.2;
  const colCount = Math.max(8, Math.floor(usableLength / colSpacing));
  const colStep = usableLength / (colCount - 1);
  const columnZ = useMemo(() => {
    return Array.from({ length: colCount }, (_, c) => startZ + 0.6 + c * colStep);
  }, [startZ, colCount, colStep]);

  // Product slots mapped uniformly
  const displaySlots = useMemo(() => {
    if (leftWallProducts.length === 0) return [];
    const pool = leftWallProducts;
    const poolLen = pool.length;
    const slots: Array<{
      key: string;
      product: Product;
      relX: number;
      relY: number;
      relZ: number;
      worldX: number;
      worldY: number;
      worldZ: number;
      tier: number;
      colIdx: number;
    }> = [];

    tiers.forEach((tierH, tIdx) => {
      const yPos = tierH;
      const tierOffset = tIdx * 3;

      for (let c = 0; c < colCount; c++) {
        const zPos = columnZ[c];
        const prodIdx = (Math.floor(c / 2) + tierOffset) % poolLen;
        const product = pool[prodIdx];

        const slotPlacement: ProductPlacement = {
          id: `wall-place-${product.id}-t${tIdx}-c${c}`,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productPrice: product.price,
          productMrp: product.mrp,
          floorNumber: 1,
          aisleId: 'left-wall',
          aisleNumber: 1,
          aisleName: 'Left Wall Department',
          aisleCategory: 'Household & Personal Care',
          shelfSide: 'RIGHT',
          shelfTier: tIdx + 1,
          shelfPosition: c + 1,
          worldX: wallX + 0.42,
          worldY: yPos,
          worldZ: zPos,
          rotationY: Math.PI / 2,
          color: '#3b82f6',
          modelType: 'box',
        };

        slots.push({
          key: `left-wall-t${tIdx}-c${c}-${product.id}`,
          product: { ...product, placement: slotPlacement },
          relX: 0.42,
          relY: yPos,
          relZ: zPos,
          worldX: wallX + 0.42,
          worldY: yPos,
          worldZ: zPos,
          tier: tIdx + 1,
          colIdx: c,
        });
      }
    });

    return slots;
  }, [leftWallProducts, tiers, colCount, columnZ, wallX]);

  // Group slots by unique product for high-performance instancing
  const productBatches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof displaySlots }>();
    displaySlots.forEach((slot) => {
      const pid = slot.product.id;
      let b = map.get(pid);
      if (!b) {
        b = { product: slot.product, slots: [] };
        map.set(pid, b);
      }
      b.slots.push(slot);
    });
    return Array.from(map.values());
  }, [displaySlots]);

  // Instanced Upright Posts
  const postsRef = useRef<THREE.InstancedMesh>(null);
  const postZ = useMemo(() => {
    const count = Math.round(length / 3.0) + 1;
    const step = length / (count - 1);
    return Array.from({ length: count }, (_, i) => startZ + i * step);
  }, [length, startZ]);

  useEffect(() => {
    if (!postsRef.current) return;
    const dummy = new THREE.Object3D();
    postZ.forEach((z, idx) => {
      dummy.position.set(0.04, height / 2, z);
      dummy.scale.set(0.06, height, 0.06);
      dummy.updateMatrix();
      postsRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    postsRef.current.instanceMatrix.needsUpdate = true;
  }, [postZ, height]);

  // Instanced Shelf Planks and Blue Rails (5 tiers)
  const planksRef = useRef<THREE.InstancedMesh>(null);
  const railsRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!planksRef.current || !railsRef.current) return;
    const dummy = new THREE.Object3D();
    tiers.forEach((tierH, idx) => {
      // White Shelf Deck
      dummy.position.set(0.42, tierH, 0);
      dummy.scale.set(0.80, 0.04, length);
      dummy.updateMatrix();
      planksRef.current!.setMatrixAt(idx, dummy.matrix);

      // Royal Blue Front Price Rail
      dummy.position.set(0.82, tierH, 0);
      dummy.scale.set(0.015, 0.05, length);
      dummy.updateMatrix();
      railsRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    planksRef.current.instanceMatrix.needsUpdate = true;
    railsRef.current.instanceMatrix.needsUpdate = true;
  }, [tiers, length]);

  // Instanced ESL Price Tags & Contact Shadows
  const eslRef = useRef<THREE.InstancedMesh>(null);
  const talkerRef = useRef<THREE.InstancedMesh>(null);
  const shadowRef = useRef<THREE.InstancedMesh>(null);
  const talkerMat = useMemo(() => getSharedPriceTalkerMaterial(), []);

  useEffect(() => {
    if (!eslRef.current || !talkerRef.current || !shadowRef.current || displaySlots.length === 0) return;
    const dummy = new THREE.Object3D();
    const talkerDummy = new THREE.Object3D();
    const shadowDummy = new THREE.Object3D();

    displaySlots.forEach((slot, idx) => {
      // ESL casing on front blue rail
      dummy.position.set(0.825, slot.relY, slot.relZ);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(0.24, 0.045, 0.008);
      dummy.updateMatrix();
      eslRef.current!.setMatrixAt(idx, dummy.matrix);

      // Promotional talker face
      talkerDummy.position.set(0.830, slot.relY, slot.relZ);
      talkerDummy.rotation.set(0, Math.PI / 2, 0);
      talkerDummy.scale.set(0.22, 0.038, 1);
      talkerDummy.updateMatrix();
      talkerRef.current!.setMatrixAt(idx, talkerDummy.matrix);

      // Contact shadow under product
      shadowDummy.position.set(0.42, slot.relY + 0.003, slot.relZ);
      shadowDummy.rotation.set(-Math.PI / 2, 0, 0);
      shadowDummy.scale.set(0.28, 0.22, 1);
      shadowDummy.updateMatrix();
      shadowRef.current!.setMatrixAt(idx, shadowDummy.matrix);
    });

    eslRef.current.instanceMatrix.needsUpdate = true;
    talkerRef.current.instanceMatrix.needsUpdate = true;
    shadowRef.current.instanceMatrix.needsUpdate = true;
  }, [displaySlots]);

  return (
    <group position={[wallX, 0, 0]}>
      {/* Structural Wall Backing Board */}
      <mesh position={[0.02, height / 2, 0]} geometry={sharedGeometries.box} scale={[0.04, height, length]} material={wallRackMaterials.plank} raycast={() => null} />

      {/* Heavy-Duty Brushed Stainless Base Kickplate */}
      <mesh position={[0.42, 0.10, 0]} geometry={sharedGeometries.box} scale={[0.82, 0.20, length]} material={wallRackMaterials.kickplate} raycast={() => null} />

      {/* Instanced Wall Upright Posts */}
      <instancedMesh ref={postsRef} args={[sharedGeometries.box, wallRackMaterials.upright, postZ.length]} raycast={() => null} />

      {/* Instanced 5-Tier Shelves & Royal Blue Rails */}
      <instancedMesh ref={planksRef} args={[sharedGeometries.box, wallRackMaterials.plank, tiers.length]} raycast={() => null} />
      <instancedMesh ref={railsRef} args={[sharedGeometries.box, wallRackMaterials.rail, tiers.length]} raycast={() => null} />

      {/* Instanced ESL Price Tags & Contact Shadows */}
      {displaySlots.length > 0 && (
        <group raycast={() => null}>
          <instancedMesh ref={eslRef} args={[sharedGeometries.box, wallRackMaterials.eslCasing, displaySlots.length]} />
          <instancedMesh ref={talkerRef} args={[sharedGeometries.plane, talkerMat, displaySlots.length]} />
          <instancedMesh ref={shadowRef} args={[sharedGeometries.contactShadow, wallRackMaterials.contactShadow, displaySlots.length]} />
        </group>
      )}

      {/* Category Architectural Header Lightboxes mounted directly on the wall above shelves */}
      {/* North Section: Household & Cleaning */}
      <group position={[0.82, height + 0.45, -9.0]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
        <mesh geometry={sharedGeometries.box} scale={[12.0, 0.60, 0.08]} material={wallRackMaterials.upright} />
        <mesh position={[0, 0, 0.025]} geometry={sharedGeometries.box} scale={[11.8, 0.54, 0.06]} material={wallRackMaterials.plank} />
        <mesh position={[0, 0.16, 0.058]} geometry={sharedGeometries.box} scale={[8.0, 0.14, 0.005]} material={wallRackMaterials.headerSignBg} />
        <Text position={[0, 0.16, 0.065]} fontSize={0.095} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'HOUSEHOLD ESSENTIALS & LAUNDRY CARE'}
        </Text>
        <Text position={[0, -0.06, 0.065]} fontSize={0.16} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.04}>
          {'DETERGENTS • DISHWASH • SURFACE CLEANERS'}
        </Text>
      </group>

      {/* South Section: Personal Care & Beauty */}
      <group position={[0.82, height + 0.45, 9.0]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
        <mesh geometry={sharedGeometries.box} scale={[12.0, 0.60, 0.08]} material={wallRackMaterials.upright} />
        <mesh position={[0, 0, 0.025]} geometry={sharedGeometries.box} scale={[11.8, 0.54, 0.06]} material={wallRackMaterials.plank} />
        <mesh position={[0, 0.16, 0.058]} geometry={sharedGeometries.box} scale={[8.0, 0.14, 0.005]} material={wallRackMaterials.headerSignBg} />
        <Text position={[0, 0.16, 0.065]} fontSize={0.095} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'PERSONAL CARE & BEAUTY GALLERY'}
        </Text>
        <Text position={[0, -0.06, 0.065]} fontSize={0.16} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.04}>
          {'PREMIUM SOAPS • SHAMPOOS • ORAL CARE • SKINCARE'}
        </Text>
      </group>

      {/* Instanced Product Facings (High-Performance Instancing by Unique Product) */}
      <group>
        {productBatches.map((batch) => (
          <WallProductBatch key={`left-batch-${batch.product.id}`} product={batch.product} slots={batch.slots} openModal={openProductModal} setHover={setHoveredProduct} />
        ))}
      </group>
    </group>
  );
});
LeftWallRetailShelving.displayName = 'LeftWallRetailShelving';

// Batched Instanced Product Facings for Wall Shelving
const WallProductBatch: React.FC<{
  product: Product;
  slots: Array<{ relX: number; relY: number; relZ: number; key: string }>;
  openModal: (p: Product) => void;
  setHover: (p: Product | null) => void;
}> = React.memo(({ product, slots, openModal, setHover }) => {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);

  const plcColor = product.placement?.color || '#3b82f6';
  const bodyMat = useMemo(() => getProductBodyMaterial(plcColor, 0.3, 0.08), [plcColor]);
  const frontTex = useMemo(() => getProductPackagingTexture(product), [product]);
  const labelMat = useMemo(() => getShelfMaterial(frontTex, `pkg-${product.slug || product.id}`, 'standard'), [frontTex, product]);

  const bw = 0.26;
  const bh = 0.34;
  const bd = 0.14;
  const yOff = 0.17;

  useEffect(() => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const labelDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      // 3D Box Body
      dummy.position.set(slot.relX, slot.relY + yOff, slot.relZ);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(bw, bh, bd);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(idx, dummy.matrix);

      // Packaging Faceplate
      labelDummy.position.set(slot.relX + bd / 2 + 0.003, slot.relY + yOff, slot.relZ);
      labelDummy.rotation.set(0, Math.PI / 2, 0);
      labelDummy.scale.set(bw * 0.94, bh * 0.94, 1);
      labelDummy.updateMatrix();
      labelRef.current!.setMatrixAt(idx, labelDummy.matrix);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    labelRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[sharedGeometries.box, bodyMat, slots.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          setHover(product);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          setHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openModal(product);
        }}
      />
      <instancedMesh ref={labelRef} args={[sharedGeometries.plane, labelMat, slots.length]} raycast={() => null} />
    </group>
  );
});
WallProductBatch.displayName = 'WallProductBatch';

// ---------------------------------------------------------------------------
// 2. BACK WALL WAREHOUSE BULK PALLET RACKING (Wholesale 10kg Atta, Rice, Oil)
// ---------------------------------------------------------------------------
const BackWallWarehouseRacks: React.FC = React.memo(() => {
  const products = useMartStore((state) => state.products);
  const openProductModal = useMartStore((state) => state.openProductModal);
  const setHoveredProduct = useMartStore((state) => state.setHoveredProduct);

  const length = 54.0;
  const height = 3.8;
  const startX = -27.0;
  const backZ = 33.8;

  // Bulk staples: Atta, Rice, Oil, Salt
  const bulkProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category?.name || '').toLowerCase();
      return (
        name.includes('atta') ||
        name.includes('rice') ||
        name.includes('basmati') ||
        name.includes('oil') ||
        name.includes('salt') ||
        cat.includes('groceries') ||
        cat.includes('staples')
      );
    });
  }, [products]);

  // 3 Heavy-Duty Pallet Beam Levels: [0.15m ground pallet, 1.50m mid pallet, 2.85m upper pallet]
  const beamLevels = useMemo(() => [0.15, 1.50, 2.85], []);

  // 18 Pallet Bays along 54m (each bay is 2.8m wide, holding 2 Euro-pallets)
  const bayCount = 18;
  const bayStep = length / bayCount;
  const bayX = useMemo(() => {
    return Array.from({ length: bayCount }, (_, i) => startX + (i + 0.5) * bayStep);
  }, [startX, bayCount, bayStep]);

  // Bulk product items stacked on pallets
  const bulkSlots = useMemo(() => {
    if (bulkProducts.length === 0) return [];
    const pool = bulkProducts;
    const poolLen = pool.length;
    const slots: Array<{
      key: string;
      product: Product;
      x: number;
      y: number;
      z: number;
    }> = [];

    beamLevels.forEach((levelY, lIdx) => {
      bayX.forEach((bX, bIdx) => {
        // 2 stacks of sacks/cans per pallet bay
        [-0.65, 0.65].forEach((xOff, pIdx) => {
          const prodIdx = (bIdx * 2 + pIdx + lIdx * 3) % poolLen;
          const product = pool[prodIdx];
          const posX = bX + xOff;
          const posY = levelY + 0.15; // Sitting on top of Euro pallet wooden deck
          const posZ = backZ;

          const slotPlacement: ProductPlacement = {
            id: `bulk-pallet-${product.id}-l${lIdx}-b${bIdx}-${pIdx}`,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productPrice: product.price,
            productMrp: product.mrp,
            floorNumber: 1,
            aisleId: 'back-wall',
            aisleNumber: 6,
            aisleName: 'Bulk Warehouse Wholesale Section',
            aisleCategory: 'Bulk Warehouse Staples',
            shelfSide: 'LEFT',
            shelfTier: lIdx + 1,
            shelfPosition: bIdx * 2 + pIdx + 1,
            worldX: posX,
            worldY: posY,
            worldZ: posZ - 0.40,
            rotationY: 0,
            color: '#ca8a04',
            modelType: 'bag',
          };

          slots.push({
            key: `bulk-${lIdx}-${bIdx}-${pIdx}-${product.id}`,
            product: { ...product, placement: slotPlacement },
            x: posX,
            y: posY,
            z: posZ - 0.40,
          });
        });
      });
    });

    return slots;
  }, [bulkProducts, beamLevels, bayX, backZ]);

  // Group by product for instancing
  const bulkBatches = useMemo(() => {
    const map = new Map<string, { product: Product; slots: typeof bulkSlots }>();
    bulkSlots.forEach((slot) => {
      const pid = slot.product.id;
      let b = map.get(pid);
      if (!b) {
        b = { product: slot.product, slots: [] };
        map.set(pid, b);
      }
      b.slots.push(slot);
    });
    return Array.from(map.values());
  }, [bulkSlots]);

  // Instanced Pallet Upright Columns (Safety Orange #ea580c)
  const palletUprightsRef = useRef<THREE.InstancedMesh>(null);
  const uprightX = useMemo(() => {
    return Array.from({ length: bayCount + 1 }, (_, i) => startX + i * bayStep);
  }, [startX, bayCount, bayStep]);

  useEffect(() => {
    if (!palletUprightsRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    uprightX.forEach((ux) => {
      // Front upright column
      dummy.position.set(ux, height / 2, backZ - 0.85);
      dummy.scale.set(0.10, height, 0.08);
      dummy.updateMatrix();
      palletUprightsRef.current!.setMatrixAt(idx++, dummy.matrix);

      // Rear upright column
      dummy.position.set(ux, height / 2, backZ + 0.05);
      dummy.scale.set(0.10, height, 0.08);
      dummy.updateMatrix();
      palletUprightsRef.current!.setMatrixAt(idx++, dummy.matrix);
    });
    palletUprightsRef.current.instanceMatrix.needsUpdate = true;
  }, [uprightX, height, backZ]);

  // Instanced Safety Yellow Load Beams
  const beamsRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!beamsRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    beamLevels.forEach((by) => {
      // Front load beam running across entire back wall
      dummy.position.set(0, by, backZ - 0.85);
      dummy.scale.set(length, 0.12, 0.06);
      dummy.updateMatrix();
      beamsRef.current!.setMatrixAt(idx++, dummy.matrix);

      // Rear load beam running across entire back wall
      dummy.position.set(0, by, backZ + 0.05);
      dummy.scale.set(length, 0.12, 0.06);
      dummy.updateMatrix();
      beamsRef.current!.setMatrixAt(idx++, dummy.matrix);
    });
    beamsRef.current.instanceMatrix.needsUpdate = true;
  }, [beamLevels, length, backZ]);

  // Instanced Wooden Euro-Pallets
  const palletsRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!palletsRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    beamLevels.forEach((by) => {
      bayX.forEach((bx) => {
        [-0.65, 0.65].forEach((xOff) => {
          dummy.position.set(bx + xOff, by + 0.07, backZ - 0.40);
          dummy.scale.set(1.20, 0.12, 0.85);
          dummy.updateMatrix();
          palletsRef.current!.setMatrixAt(idx++, dummy.matrix);
        });
      });
    });
    palletsRef.current.instanceMatrix.needsUpdate = true;
  }, [beamLevels, bayX, backZ]);

  return (
    <group>
      {/* Structural Industrial Pallet Uprights (Safety Orange) */}
      <instancedMesh ref={palletUprightsRef} args={[sharedGeometries.box, wallRackMaterials.palletUpright, (bayCount + 1) * 2]} raycast={() => null} />

      {/* Safety Yellow High-Strength Box Beams */}
      <instancedMesh ref={beamsRef} args={[sharedGeometries.box, wallRackMaterials.palletBeam, beamLevels.length * 2]} raycast={() => null} />

      {/* Wooden Euro-Pallets Deck Platforms */}
      <instancedMesh ref={palletsRef} args={[sharedGeometries.box, wallRackMaterials.palletWood, beamLevels.length * bayCount * 2]} raycast={() => null} />

      {/* Overhead Warehouse Department Signboard */}
      <group position={[0, height + 0.55, backZ - 0.90]} raycast={() => null}>
        <mesh geometry={sharedGeometries.box} scale={[18.0, 0.70, 0.08]} material={wallRackMaterials.upright} />
        <mesh position={[0, 0, -0.025]} geometry={sharedGeometries.box} scale={[17.8, 0.64, 0.06]} material={wallRackMaterials.plank} />
        <mesh position={[0, 0.18, -0.058]} geometry={sharedGeometries.box} scale={[12.0, 0.16, 0.005]} material={wallRackMaterials.headerSignBg} />
        <Text position={[0, 0.18, -0.065]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="extrabold">
          {'D-MART WHOLESALE BULK GRAINS & STAPLES'}
        </Text>
        <Text position={[0, -0.08, -0.065]} fontSize={0.18} color="#0f172a" anchorX="center" anchorY="middle" fontWeight="black" letterSpacing={0.05}>
          {'CHAKKI ATTA 10KG • BASMATI RICE • COOKING OILS 5L • TATA SALT'}
        </Text>
      </group>

      {/* Interactive Bulk Sacks and Cans on Pallets */}
      <group>
        {bulkBatches.map((batch) => (
          <BulkPalletBatch key={`bulk-batch-${batch.product.id}`} product={batch.product} slots={batch.slots} openModal={openProductModal} setHover={setHoveredProduct} />
        ))}
      </group>
    </group>
  );
});
BackWallWarehouseRacks.displayName = 'BackWallWarehouseRacks';

// Batched Instanced Bulk Products on Pallets
const BulkPalletBatch: React.FC<{
  product: Product;
  slots: Array<{ x: number; y: number; z: number; key: string }>;
  openModal: (p: Product) => void;
  setHover: (p: Product | null) => void;
}> = React.memo(({ product, slots, openModal, setHover }) => {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const labelRef = useRef<THREE.InstancedMesh>(null);

  const plcColor = product.placement?.color || '#ca8a04';
  const bodyMat = useMemo(() => getProductBodyMaterial(plcColor, 0.75, 0.05), [plcColor]);
  const frontTex = useMemo(() => getProductPackagingTexture(product), [product]);
  const labelMat = useMemo(() => getShelfMaterial(frontTex, `pkg-${product.slug || product.id}`, 'standard'), [frontTex, product]);

  const bw = 0.48; // Large 10kg/25kg bulk sack width
  const bh = 0.62; // Tall bulk sack height
  const bd = 0.32; // Deep bulk sack thickness
  const yOff = 0.31;

  useEffect(() => {
    if (!bodyRef.current || !labelRef.current || slots.length === 0) return;
    const dummy = new THREE.Object3D();
    const labelDummy = new THREE.Object3D();

    slots.forEach((slot, idx) => {
      // 3D Large Sack
      dummy.position.set(slot.x, slot.y + yOff, slot.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(bw, bh, bd);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(idx, dummy.matrix);

      // Printed Sack Face
      labelDummy.position.set(slot.x, slot.y + yOff, slot.z - bd / 2 - 0.004);
      labelDummy.rotation.set(0, Math.PI, 0);
      labelDummy.scale.set(bw * 0.92, bh * 0.92, 1);
      labelDummy.updateMatrix();
      labelRef.current!.setMatrixAt(idx, labelDummy.matrix);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    labelRef.current.instanceMatrix.needsUpdate = true;
  }, [slots]);

  if (slots.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[sharedGeometries.box, bodyMat, slots.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
          setHover(product);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'default';
          setHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          openModal(product);
        }}
      />
      <instancedMesh ref={labelRef} args={[sharedGeometries.plane, labelMat, slots.length]} raycast={() => null} />
    </group>
  );
});
BulkPalletBatch.displayName = 'BulkPalletBatch';

// Combined WallShelves Component
export const WallShelves: React.FC = React.memo(() => {
  return (
    <group>
      <LeftWallRetailShelving />
      <BackWallWarehouseRacks />
    </group>
  );
});
WallShelves.displayName = 'WallShelves';
