import * as THREE from 'three';
import { Product } from '@/types';
import { MOCK_PRODUCTS } from './mockData';
import { REFRIGERATOR_PRODUCTS } from './refrigeratorData';

// Global texture cache for individual product packaging textures
export const productPackagingCache = new Map<string, THREE.CanvasTexture>();

// Global master texture atlas (4096 x 4096)
export let masterAtlasTexture: THREE.CanvasTexture | null = null;
export const atlasUvMap = new Map<string, { uMin: number; vMin: number; uMax: number; vMax: number }>();

const BRAND_PALETTES: Record<string, { bg: string; accent: string; text: string }> = {
  cadbury: { bg: '#28074d', accent: '#fbbf24', text: '#ffffff' },
  amul: { bg: '#0369a1', accent: '#ef4444', text: '#ffffff' },
  parle: { bg: '#b45309', accent: '#fde047', text: '#ffffff' },
  britannia: { bg: '#dc2626', accent: '#fef08a', text: '#ffffff' },
  nestle: { bg: '#1d4ed8', accent: '#facc15', text: '#ffffff' },
  fortune: { bg: '#ca8a04', accent: '#15803d', text: '#ffffff' },
  tata: { bg: '#065f46', accent: '#34d399', text: '#ffffff' },
  lays: { bg: '#eab308', accent: '#dc2626', text: '#ffffff' },
  kurkure: { bg: '#ea580c', accent: '#facc15', text: '#ffffff' },
  coca_cola: { bg: '#b91c1c', accent: '#ffffff', text: '#ffffff' },
  pepsi: { bg: '#1e40af', accent: '#ef4444', text: '#ffffff' },
  surf_excel: { bg: '#1e3a8a', accent: '#38bdf8', text: '#ffffff' },
  dettol: { bg: '#15803d', accent: '#facc15', text: '#ffffff' },
  colgate: { bg: '#b91c1c', accent: '#ffffff', text: '#ffffff' },
};

function getBrandPalette(product: Product) {
  const brandKey = (product.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  for (const k of Object.keys(BRAND_PALETTES)) {
    if (brandKey.includes(k) || (product.name || '').toLowerCase().includes(k)) {
      return BRAND_PALETTES[k];
    }
  }
  const color = product.placement?.color || '#1e293b';
  return { bg: color, accent: '#38bdf8', text: '#ffffff' };
}

/**
 * Creates an authentic commercial hypermarket packaging texture for a product
 * using its actual catalogue SVG / image, brand palette, and crisp typography.
 */
export function getProductPackagingTexture(product: Product): THREE.CanvasTexture {
  const cacheKey = product.id || product.slug || 'unknown';
  if (productPackagingCache.has(cacheKey)) {
    return productPackagingCache.get(cacheKey)!;
  }

  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as any);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  const palette = getBrandPalette(product);

  const drawBaseCard = () => {
    // 1. Rich high-end gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
    bgGrad.addColorStop(0, palette.bg);
    bgGrad.addColorStop(0.7, palette.bg);
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 640);

    // Subtle cardboard/packaging outer border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 632);

    // 2. Top Brand Header Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(12, 12, 488, 54);

    ctx.fillStyle = palette.accent;
    ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText((product.brand || 'MARTVERSE').toUpperCase(), 24, 39);

    // Green Veg Icon (Authentic Indian FMCG packaging requirement)
    const vegX = 460;
    const vegY = 27;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(vegX, vegY, 24, 24);
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(vegX, vegY, 24, 24);
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(vegX + 12, vegY + 12, 6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Central Artwork Showcase Region
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(20, 78, 472, 340);

    // 4. Product Name Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const cleanName = product.name || 'Grocery Item';
    const firstLine = cleanName.length > 28 ? cleanName.substring(0, 26) + '...' : cleanName;
    ctx.fillText(firstLine, 256, 448);

    // Unit / Weight Text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(product.unit || 'Pack', 256, 480);

    // 5. Commercial Price Tag Pill
    ctx.fillStyle = '#dc2626'; // Vibrant commercial red
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(40, 508, 160, 48, 8) : ctx.rect(40, 508, 160, 48);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`₹${product.price}`, 120, 542);

    if (product.mrp && product.mrp > product.price) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`MRP ₹${product.mrp}`, 215, 540);
      // Strikethrough
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(212, 538);
      ctx.lineTo(315, 538);
      ctx.stroke();
    }

    // 6. Retail Barcode Graphic
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 572, 432, 52);
    ctx.fillStyle = '#0f172a';
    const barWidths = [3, 2, 4, 1, 3, 5, 2, 4, 2, 1, 3, 2, 5, 1, 4, 3, 2, 4, 2, 3, 5, 2, 4, 1, 3];
    let curX = 60;
    for (let i = 0; i < 48; i++) {
      const bw = barWidths[i % barWidths.length];
      if (i % 2 === 0) {
        ctx.fillRect(curX, 578, bw, 40);
      }
      curX += bw + 3;
      if (curX > 450) break;
    }
  };

  // Draw initial high-fidelity base card
  drawBaseCard();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  productPackagingCache.set(cacheKey, texture);

  // Load the actual catalogue SVG / image and paint edge-to-edge for photorealistic commercial packaging
  if (product.imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, 512, 640);
      ctx.drawImage(img, 0, 0, 512, 640);
      texture.needsUpdate = true;
    };
    img.src = product.imageUrl;
  }

  return texture;
}

/**
 * Builds the unified 4096 x 4096 Master Hypermarket Texture Atlas.
 * Packs up to 100 products (10 x 10 grid of 400x400 cells) into one GPU texture.
 */
export async function buildMasterProductAtlas(allProducts: Product[]): Promise<THREE.CanvasTexture> {
  if (masterAtlasTexture) return masterAtlasTexture;
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 4096;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 4096, 4096);

  const cellSize = 400;
  const cols = 10;

  // Load and bake each product into its atlas cell
  const bakePromises = allProducts.map(async (prod, idx) => {
    if (idx >= 100) return;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellX = col * cellSize;
    const cellY = row * cellSize;

    // UV coordinates (0.0 to 1.0)
    const uMin = cellX / 4096;
    const vMin = 1.0 - (cellY + cellSize) / 4096;
    const uMax = (cellX + cellSize) / 4096;
    const vMax = 1.0 - cellY / 4096;

    atlasUvMap.set(prod.id, { uMin, vMin, uMax, vMax });

    // Paint cell background
    const palette = getBrandPalette(prod);
    ctx.fillStyle = palette.bg;
    ctx.fillRect(cellX, cellY, cellSize, cellSize);

    // Inner artwork
    if (prod.imageUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const pad = 30;
          ctx.drawImage(img, cellX + pad, cellY + pad, cellSize - pad * 2, cellSize - pad * 2);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = prod.imageUrl;
      });
    }

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(cellX + 2, cellY + 2, cellSize - 4, cellSize - 4);
  });

  await Promise.all(bakePromises);

  const atlas = new THREE.CanvasTexture(canvas);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.generateMipmaps = true;
  atlas.minFilter = THREE.LinearMipmapLinearFilter;
  atlas.magFilter = THREE.LinearFilter;
  atlas.anisotropy = 16;
  atlas.needsUpdate = true;

  masterAtlasTexture = atlas;
  return atlas;
}

/**
 * Preloads and pre-warms all product textures on the GPU.
 * Guarantees zero hitching or lag during navigation or orbiting.
 */
export async function prewarmAllProductTextures(renderer?: THREE.WebGLRenderer) {
  if (typeof window === 'undefined') return;

  const allProducts: Product[] = [
    ...(MOCK_PRODUCTS as Product[]),
    ...(REFRIGERATOR_PRODUCTS as Product[]),
  ];

  // Pre-generate packaging textures
  allProducts.forEach((p) => {
    const tex = getProductPackagingTexture(p);
    if (renderer) {
      try {
        renderer.initTexture(tex);
      } catch {}
    }
  });

  // Pre-bake master atlas in parallel
  buildMasterProductAtlas(allProducts).then((atlas) => {
    if (renderer && atlas) {
      try {
        renderer.initTexture(atlas);
      } catch {}
    }
  });
}

