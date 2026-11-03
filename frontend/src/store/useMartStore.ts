import { create } from 'zustand';
import { SupermarketFloor, Product } from '@/types';
import { MOCK_FLOORS, MOCK_PRODUCTS } from '@/lib/mockData';
import { CANONICAL_BACKEND_PRODUCTS } from '@/lib/productsCatalog';
import { sounds } from '@/lib/sound';
import { AutoNavState, buildNavWaypoints, resolveProductStandingPosition } from '@/lib/autoNav';
export type { AutoNavState } from '@/lib/autoNav';

interface MartStore {
  floors: SupermarketFloor[];
  products: Product[];
  activeFloor: number;
  playerPos: [number, number, number];
  playerYaw: number;
  selectedProduct: Product | null;
  hoveredProduct: Product | null;
  isProductModalOpen: boolean;
  isMinimapOpen: boolean;
  isSoundMuted: boolean;
  cameraMode: 'first_person' | 'third_person' | 'billing' | 'exit';
  nearBillingCounter: boolean;
  nearExitGate: boolean;
  promptText: string | null;
  targetProductPos: [number, number, number] | null;

  // Exit Animation & Completion
  isAutoNavigatingToExit: boolean;
  finalCompletedPopupOpen: boolean;
  completedOrderNumber: string | null;
  unpaidExitAlertOpen: boolean;

  // Toast Notification
  toast: { id: string; title: string; subtitle?: string; type: 'success' | 'warning' | 'info'; imageUrl?: string } | null;

  hasEnteredStore: boolean;
  setHasEnteredStore: (entered: boolean) => void;

  hasMovedTrolley: boolean;
  setHasMovedTrolley: (hasMoved: boolean) => void;

  setFloors: (floors: SupermarketFloor[]) => void;
  setProducts: (products: Product[]) => void;
  setActiveFloor: (floorNumber: number) => void;
  setPlayerPos: (pos: [number, number, number], yaw?: number) => void;
  setSelectedProduct: (product: Product | null) => void;
  setHoveredProduct: (product: Product | null) => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  toggleMinimap: (open?: boolean) => void;
  toggleSound: () => void;
  setCameraMode: (mode: 'first_person' | 'third_person' | 'billing' | 'exit') => void;
  setProximity: (nearBilling: boolean, nearExit: boolean, prompt: string | null, targetPos?: [number, number, number] | null) => void;
  startExitAnimation: (orderNumber: string) => void;
  finishExitAnimation: () => void;
  closeFinalCompletedPopup: () => void;
  showToast: (title: string, subtitle?: string, type?: 'success' | 'warning' | 'info', imageUrl?: string) => void;
  hideToast: () => void;
  openUnpaidExitAlert: () => void;
  closeUnpaidExitAlert: () => void;
  isNavigatorOpen: boolean;
  toggleNavigator: (open?: boolean) => void;
  resetTrigger: number;
  resetToOriginalState: () => void;
  teleportTrigger: number;
  teleportTo: (pos: [number, number, number], yaw?: number) => void;
  activeAutoNav: AutoNavState | null;
  startAutoNavToProduct: (product: Product, autoAddToCart?: boolean) => void;
  cancelAutoNav: () => void;
  navigateToProduct: (product: Product) => void;
  hydrateProductsFromCache: () => void;
}

export const martRuntime = {
  playerPos: [0, 1.5, -28] as [number, number, number],
  playerYaw: 0,
  billingCooldownUntil: 0,
  virtualKeys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },
};

function getInitialProducts(): Product[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('martverse_products_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 70) {
          const sanitized = parsed.filter(
            (p: any) =>
              !(
                p.placement?.floorNumber === 2 ||
                (p.sku && p.sku.startsWith('APP-'))
              )
          );
          if (sanitized.length >= 70) {
            return sanitized;
          }
        }
      }
    } catch {}
  }
  return CANONICAL_BACKEND_PRODUCTS;
}

export const useMartStore = create<MartStore>((set, get) => ({
  floors: MOCK_FLOORS,
  products: getInitialProducts(), // Instant 0ms shelf population on initial paint; background revalidation updates live data
  activeFloor: 1,
  playerPos: [0, 1.5, -28], // Spawn at Entrance
  playerYaw: 0,
  selectedProduct: null,
  hoveredProduct: null,
  isProductModalOpen: false,
  isMinimapOpen: false,
  isNavigatorOpen: false, // Hidden by default - only shows when user taps 'Arrows'
  isSoundMuted: false,
  cameraMode: 'third_person',
  nearBillingCounter: false,
  nearExitGate: false,
  promptText: null,
  targetProductPos: null,
  hasMovedTrolley: false,

  isAutoNavigatingToExit: false,
  finalCompletedPopupOpen: false,
  completedOrderNumber: null,
  unpaidExitAlertOpen: false,
  toast: null,

  hasEnteredStore:
    typeof window !== 'undefined'
      ? Boolean(
          sessionStorage.getItem('martverse_entered') ||
            localStorage.getItem('martverse_entered') ||
            localStorage.getItem('martverse_intro_completed')
        )
      : false,
  setHasEnteredStore: (hasEnteredStore) => set({ hasEnteredStore }),

  setHasMovedTrolley: (hasMovedTrolley) => set({ hasMovedTrolley }),

  hydrateProductsFromCache: () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('martverse_products_cache');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 70) {
            // Strictly exclude Floor 2 / Apparel items
            const sanitized = parsed.filter(
              (p: any) =>
                !(
                  p.placement?.floorNumber === 2 ||
                  (p.sku && p.sku.startsWith('APP-'))
                )
            );
            if (sanitized.length >= 70) {
              set({ products: sanitized });
              localStorage.setItem('martverse_products_cache', JSON.stringify(sanitized));
              return;
            }
          }
        }
      } catch {}
      // Fallback to authoritative backend products collection
      set({ products: CANONICAL_BACKEND_PRODUCTS });
      try {
        localStorage.setItem('martverse_products_cache', JSON.stringify(CANONICAL_BACKEND_PRODUCTS));
      } catch {}
    }
  },

  setFloors: (floors) => set({ floors }),
  setProducts: (products) => {
    if (!products || !Array.isArray(products) || products.length === 0) return;
    const sanitized = products.filter(
      (p: any) =>
        !(
          p.placement?.floorNumber === 2 ||
          (p.sku && p.sku.startsWith('APP-'))
        )
    );
    if (sanitized.length === 0) return;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('martverse_products_cache', JSON.stringify(sanitized));
      } catch {}
    }
    set({ products: sanitized });
  },
  setActiveFloor: (floorNumber) => set({ activeFloor: floorNumber, hoveredProduct: null }),
  setPlayerPos: (playerPos, yaw) => {
    martRuntime.playerPos[0] = playerPos[0];
    martRuntime.playerPos[1] = playerPos[1];
    martRuntime.playerPos[2] = playerPos[2];
    if (yaw !== undefined) martRuntime.playerYaw = yaw;
    set((state) => ({
      playerPos,
      playerYaw: yaw !== undefined ? yaw : state.playerYaw,
      teleportTrigger: state.teleportTrigger + 1,
    }));
  },
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setHoveredProduct: (hoveredProduct) => set({ hoveredProduct }),
  
  openProductModal: (product) => set({ selectedProduct: product, isProductModalOpen: true }),
  closeProductModal: () => set({ isProductModalOpen: false, selectedProduct: null }),

  toggleMinimap: (open) => set((state) => ({ isMinimapOpen: open !== undefined ? open : !state.isMinimapOpen })),
  toggleNavigator: (open) => set((state) => ({ isNavigatorOpen: open !== undefined ? open : !state.isNavigatorOpen })),
  
  toggleSound: () => {
    sounds.enabled = !sounds.enabled;
    set((state) => ({ isSoundMuted: !state.isSoundMuted }));
  },

  setCameraMode: (cameraMode) => set({ cameraMode }),

  setProximity: (nearBillingCounter, nearExitGate, promptText, targetProductPos = null) =>
    set({ nearBillingCounter, nearExitGate, promptText, targetProductPos }),

  startExitAnimation: (orderNumber) => {
    set({
      isAutoNavigatingToExit: true,
      cameraMode: 'third_person',
      completedOrderNumber: orderNumber,
    });
  },

  finishExitAnimation: () => {
    sounds.playGateOpen();
    set({
      isAutoNavigatingToExit: false,
      cameraMode: 'exit',
      finalCompletedPopupOpen: true,
    });
  },

  closeFinalCompletedPopup: () => {
    set({
      finalCompletedPopupOpen: false,
      cameraMode: 'third_person',
    });
  },

  showToast: (title, subtitle, type = 'success', imageUrl) => {
    let resolvedImage = imageUrl;
    if (!resolvedImage && subtitle && (title.includes('Trolley') || title.includes('Cart') || title.includes('Added') || title.includes('Wishlist'))) {
      const state = useMartStore.getState();
      const match = state.products.find((p) =>
        subtitle.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(subtitle.toLowerCase())
      );
      if (match?.imageUrl) {
        resolvedImage = match.imageUrl;
      }
    }

    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    set({ toast: { id, title, subtitle, type, imageUrl: resolvedImage } });
    setTimeout(() => {
      // Auto-hide after 3.8 seconds if current toast is the same
      set((state) => (state.toast?.id === id ? { toast: null } : {}));
    }, 3800);
  },

  hideToast: () => set({ toast: null }),

  openUnpaidExitAlert: () => set({ unpaidExitAlertOpen: true }),
  closeUnpaidExitAlert: () => set({ unpaidExitAlertOpen: false }),

  resetTrigger: 0,
  resetToOriginalState: () => {
    martRuntime.playerPos[0] = 0;
    martRuntime.playerPos[1] = 1.5;
    martRuntime.playerPos[2] = -28;
    martRuntime.playerYaw = 0;
    sounds.playClick();
    set((state) => ({
      activeFloor: 1,
      cameraMode: 'third_person',
      playerPos: [0, 1.5, -28],
      playerYaw: 0,
      resetTrigger: state.resetTrigger + 1,
      promptText: null,
      nearBillingCounter: false,
      nearExitGate: false,
      isAutoNavigatingToExit: false,
      finalCompletedPopupOpen: false,
      unpaidExitAlertOpen: false,
      activeAutoNav: null,
    }));
  },

  teleportTrigger: 0,
  teleportTo: (pos, yaw) => {
    martRuntime.playerPos[0] = pos[0];
    martRuntime.playerPos[1] = pos[1];
    martRuntime.playerPos[2] = pos[2];
    if (yaw !== undefined) martRuntime.playerYaw = yaw;
    set((state) => ({
      playerPos: pos,
      playerYaw: yaw !== undefined ? yaw : state.playerYaw,
      teleportTrigger: state.teleportTrigger + 1,
    }));
  },

  activeAutoNav: null,

  startAutoNavToProduct: (product: Product, autoAddToCart = true) => {
    sounds.playPickSound();
    const { standX, standZ, standYaw } = resolveProductStandingPosition(product);
    const startX = martRuntime.playerPos[0];
    const startZ = martRuntime.playerPos[2];
    const waypoints = buildNavWaypoints(startX, startZ, standX, standZ);

    set({
      isProductModalOpen: false,
      selectedProduct: null,
      activeFloor: 1,
      cameraMode: 'third_person',
      activeAutoNav: {
        targetX: standX,
        targetZ: standZ,
        targetYaw: standYaw,
        product,
        autoAddToCart,
        waypoints,
        currentWaypointIndex: 0,
        startTime: performance.now(),
        startPos: [...martRuntime.playerPos],
      },
      toast: {
        id: 'autonav-' + Date.now(),
        title: `Guiding to ${product.name}`,
        subtitle: `Trolley navigating smoothly along aisles...`,
        type: 'info',
        imageUrl: product.imageUrl,
      },
    });
  },

  cancelAutoNav: () => {
    set((state) => {
      if (!state.activeAutoNav) return {};
      return { activeAutoNav: null };
    });
  },

  navigateToProduct: (product: Product) => {
    get().startAutoNavToProduct(product, true);
  },
}));
