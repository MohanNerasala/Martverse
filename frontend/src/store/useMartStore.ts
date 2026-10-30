import { create } from 'zustand';
import { SupermarketFloor, Product } from '@/types';
import { MOCK_FLOORS, MOCK_PRODUCTS } from '@/lib/mockData';
import { sounds } from '@/lib/sound';

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
  toast: { id: string; title: string; subtitle?: string; type: 'success' | 'warning' | 'info' } | null;

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
  showToast: (title: string, subtitle?: string, type?: 'success' | 'warning' | 'info') => void;
  hideToast: () => void;
  openUnpaidExitAlert: () => void;
  closeUnpaidExitAlert: () => void;
  isNavigatorOpen: boolean;
  toggleNavigator: (open?: boolean) => void;
  resetTrigger: number;
  resetToOriginalState: () => void;
  teleportTrigger: number;
  teleportTo: (pos: [number, number, number], yaw?: number) => void;
  navigateToProduct: (product: Product) => void;
}

export const martRuntime = {
  playerPos: [0, 1.5, -20] as [number, number, number],
  playerYaw: 0,
  virtualKeys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },
};

export const useMartStore = create<MartStore>((set) => ({
  floors: MOCK_FLOORS,
  products: MOCK_PRODUCTS,
  activeFloor: 1,
  playerPos: [0, 1.5, -20], // Spawn at Entrance
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

  setHasMovedTrolley: (hasMovedTrolley) => set({ hasMovedTrolley }),

  setFloors: (floors) => set({ floors }),
  setProducts: (products) => set({ products }),
  setActiveFloor: (floorNumber) => set({ activeFloor: floorNumber }),
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

  showToast: (title, subtitle, type = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    set({ toast: { id, title, subtitle, type } });
    setTimeout(() => {
      // Auto-hide after 3.5 seconds if current toast is the same
      set((state) => (state.toast?.id === id ? { toast: null } : {}));
    }, 3500);
  },

  hideToast: () => set({ toast: null }),

  openUnpaidExitAlert: () => set({ unpaidExitAlertOpen: true }),
  closeUnpaidExitAlert: () => set({ unpaidExitAlertOpen: false }),

  resetTrigger: 0,
  resetToOriginalState: () => {
    martRuntime.playerPos[0] = 0;
    martRuntime.playerPos[1] = 1.5;
    martRuntime.playerPos[2] = -20;
    martRuntime.playerYaw = 0;
    sounds.playClick();
    set((state) => ({
      activeFloor: 1,
      cameraMode: 'third_person',
      playerPos: [0, 1.5, -20],
      playerYaw: 0,
      resetTrigger: state.resetTrigger + 1,
      promptText: null,
      nearBillingCounter: false,
      nearExitGate: false,
      isAutoNavigatingToExit: false,
      finalCompletedPopupOpen: false,
      unpaidExitAlertOpen: false,
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

  navigateToProduct: (product) => {
    sounds.playPickSound();
    const plc = product.placement;
    if (!plc) {
      set({ selectedProduct: product, isProductModalOpen: true });
      return;
    }

    const floorNum = plc.floorNumber || 1;
    const aisleCentersF1: Record<number, number> = { 1: -10, 2: -5, 3: 0, 4: 5, 5: 10 };
    const aisleCentersF2: Record<number, number> = { 6: -11.0, 7: -6.5, 8: -2.0, 9: 2.5, 10: 7.0, 11: 11.5 };
    const aisleCenter =
      floorNum === 2
        ? (aisleCentersF2[plc.aisleNumber] ?? plc.worldX)
        : (aisleCentersF1[plc.aisleNumber] ?? plc.worldX);

    const isLeft = plc.shelfSide === 'LEFT' || plc.worldX < aisleCenter;
    const targetX = isLeft ? plc.worldX - 1.35 : plc.worldX + 1.35;
    const targetYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;
    const targetY = floorNum === 2 ? 6.5 : 1.5;
    const targetZ = plc.worldZ;

    martRuntime.playerPos[0] = targetX;
    martRuntime.playerPos[1] = targetY;
    martRuntime.playerPos[2] = targetZ;
    martRuntime.playerYaw = targetYaw;

    const toastId = 'nav-' + Date.now();

    set((state) => ({
      activeFloor: floorNum,
      playerPos: [targetX, targetY, targetZ],
      playerYaw: targetYaw,
      cameraMode: 'third_person',
      selectedProduct: product,
      isProductModalOpen: true,
      teleportTrigger: state.teleportTrigger + 1,
      toast: {
        id: toastId,
        title: `Arrived at ${product.name}`,
        subtitle: `Floor ${floorNum} • ${plc.aisleName || `Aisle ${plc.aisleNumber}`}`,
        type: 'success',
      },
    }));
  },
}));
