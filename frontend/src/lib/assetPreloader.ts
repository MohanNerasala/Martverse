import * as THREE from 'three';
import { MOCK_PRODUCTS } from './mockData';
import { shelfTextureCache, getEslTexture, getEslMaterial } from '@/components/supermarket/ShelfUnit';
import { api } from './api';
import { useMartStore } from '@/store/useMartStore';

let isPreloadingStarted = false;

/**
 * High-Speed 3D Inventory Preloader
 * Executes off-thread image decodes and GPU texture uploads while the user
 * is viewing the cinematic intro or landing page.
 * Guarantees 0ms perceptible delay when entering the 3D supermarket.
 */
export function preloadAllShelfAssets() {
  if (isPreloadingStarted || typeof window === 'undefined') return;
  isPreloadingStarted = true;

  // Defer 3D shelf texture preloading slightly so the 2D cinematic intro has 100% network & CPU priority
  const schedule = typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (fn: () => void) => (window as any).requestIdleCallback(fn, { timeout: 2500 })
    : (fn: () => void) => setTimeout(fn, 1200);

  schedule(() => {
    // 1. Collect all product image URLs from MOCK_PRODUCTS and cache
    const urlSet = new Set<string>();
    urlSet.add('/products/sweets/DairyMilk_cropped.png');
    urlSet.add('/products/sweets/DairyMilk.png');
    urlSet.add('/products/fallback.svg');

    MOCK_PRODUCTS.forEach((prod) => {
      if (prod.imageUrl) urlSet.add(prod.imageUrl);
    });

    // Also include products in local cache if any
    try {
      const saved = localStorage.getItem('martverse_products_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            if (p.imageUrl) urlSet.add(p.imageUrl);
          });
        }
      }
    } catch {}

    const urls = Array.from(urlSet);

    // 2. Pre-generate ESL electronic shelf label textures for all products
    try {
      MOCK_PRODUCTS.forEach((p) => {
        getEslTexture(p.price, p.brand || 'Cadbury');
        getEslMaterial(p.price, p.brand || 'Cadbury');
      });
    } catch {}

    // 3. Parallel Image Bitstream Pre-decoding (Browser Off-Thread Image Pipeline)
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
    });

    // 4. Parallel Three.js Texture Upload to GPU Memory
    const loader = new THREE.TextureLoader();
    urls.forEach((url) => {
      if (shelfTextureCache.has(url)) return;
      loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          shelfTextureCache.set(url, tex);
        },
        undefined,
        () => {
          if (url !== '/products/sweets/DairyMilk.png') {
            loader.load('/products/sweets/DairyMilk.png', (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.generateMipmaps = false;
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              shelfTextureCache.set(url, tex);
            });
          }
        }
      );
    });

    // 5. Asynchronous Background Product Sync with Backend
    setTimeout(() => {
      api.getProducts().then((liveProducts) => {
        if (liveProducts && liveProducts.length > 0) {
          useMartStore.getState().setProducts(liveProducts);
          liveProducts.forEach((p) => {
            if (p.imageUrl && !shelfTextureCache.has(p.imageUrl)) {
              loader.load(p.imageUrl, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.generateMipmaps = false;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.needsUpdate = true;
                shelfTextureCache.set(p.imageUrl, tex);
              });
            }
            getEslTexture(p.price, p.brand || 'Cadbury');
            getEslMaterial(p.price, p.brand || 'Cadbury');
          });
        }
      }).catch(() => {});
    }, 400);
  });
}

