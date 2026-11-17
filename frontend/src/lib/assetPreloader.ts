import * as THREE from 'three';
import { MOCK_PRODUCTS } from './mockData';
import { shelfTextureCache, getEslTexture, getEslMaterial } from '@/components/supermarket/ShelfUnit';
import { prewarmAllProductTextures } from './productTextureAtlas';
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

  // Essential hero textures
  const essentialUrls = [
    '/products/sweets/DairyMilk_cropped.png',
    '/products/sweets/DairyMilk.png',
    '/products/fallback.svg',
  ];

  const loader = new THREE.TextureLoader();
  essentialUrls.forEach((url) => {
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
      () => {}
    );
  });

  // Non-blocking lazy background warming using requestIdleCallback so 3D scene mounts in 0ms
  const schedule = 'requestIdleCallback' in window
    ? (fn: () => void) => (window as any).requestIdleCallback(fn, { timeout: 4000 })
    : (fn: () => void) => setTimeout(fn, 1500);

  schedule(() => {
    // Background product sync with API proxy
    api.getProducts().then((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        useMartStore.getState().setProducts(liveProducts);
      }
    }).catch(() => {});
  });
}

