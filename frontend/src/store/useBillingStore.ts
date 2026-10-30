import { create } from 'zustand';
import { CartItem, BillingScannedItem } from '@/types';
import { sounds } from '@/lib/sound';
import { useCartStore } from './useCartStore';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

export interface BackendQuote {
  valid: boolean;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    variantId?: string;
    variantInfo?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  warnings?: string[];
}

export interface CompletedOrderSummary {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  purchasedProductCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  finalAmount: number;
  paymentStatus: string;
  dateTime: string;
  message: string;
  items: Array<{
    productName: string;
    brand: string;
    variantInfo?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export type BillingPhase =
  | 'idle'
  | 'scanning'
  | 'review'
  | 'checkout_details'
  | 'payment_methods'
  | 'processing'
  | 'success_popup';

export type ScanStage = 'drop' | 'laser' | 'bagged' | 'idle';

interface BillingStore {
  phase: BillingPhase;
  scannedItems: BillingScannedItem[];
  currentScanningItem: CartItem | null;
  currentUnitInfo: { unitIndex: number; totalUnits: number } | null;
  scanStage: ScanStage;
  currentIndex: number;
  transferredToBenchCount: number;
  totalToScan: number;
  isPaused: boolean;
  isConveyorMoving: boolean;
  runningTotal: number;
  completedOrder: CompletedOrderSummary | null;
  backendQuote: BackendQuote | null;
  isValidatingBackend: boolean;

  startCheckout: (items: CartItem[]) => void;
  setTransferredToBenchCount: (count: number) => void;
  recordUnitScanned: (flatIndex: number, item: CartItem, unitNumber: number, totalUnits: number) => void;
  finishScanning: () => void;
  pauseScanning: () => void;
  resumeScanning: () => void;
  skipToReview: () => void;
  updateScannedItemQuantity: (itemId: string, quantity: number) => void;
  removeScannedItem: (itemId: string) => void;
  revalidateCartWithBackend: (fulfilmentType?: string) => Promise<BackendQuote | null>;
  proceedToCheckoutDetails: () => void;
  backToReview: () => void;
  proceedToPaymentMethods: () => void;
  backToCheckoutDetails: () => void;
  startProcessingPayment: () => void;
  setPaymentSuccess: (summary: CompletedOrderSummary) => void;
  cancelBilling: () => void;
  resetBilling: () => void;
}

let scanStepTimeout: NodeJS.Timeout | null = null;
let currentItemsToScan: CartItem[] = [];

export const useBillingStore = create<BillingStore>((set, get) => ({
  phase: 'idle',
  scannedItems: [],
  currentScanningItem: null,
  currentUnitInfo: null,
  scanStage: 'idle',
  currentIndex: 0,
  transferredToBenchCount: 0,
  totalToScan: 0,
  isPaused: false,
  isConveyorMoving: false,
  runningTotal: 0,
  completedOrder: null,
  backendQuote: null,
  isValidatingBackend: false,

  setTransferredToBenchCount: (count: number) => set({ transferredToBenchCount: count }),

  startCheckout: (items) => {
    if (items.length === 0) return;
    if (scanStepTimeout) {
      clearTimeout(scanStepTimeout);
      scanStepTimeout = null;
    }

    currentItemsToScan = [...items];

    // Count EVERY physical unit (if same item has quantity 2, it is scanned twice!)
    const totalPhysicalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
    const firstItem = items[0] || null;

    set({
      phase: 'scanning',
      scannedItems: items.map((it) => ({
        ...it,
        scannedAt: Date.now(),
        scanSoundPlayed: true,
      })),
      currentScanningItem: firstItem,
      currentUnitInfo: firstItem ? { unitIndex: 1, totalUnits: firstItem.quantity } : null,
      scanStage: 'drop',
      currentIndex: 0,
      transferredToBenchCount: 0,
      totalToScan: totalPhysicalUnits,
      isPaused: false,
      isConveyorMoving: true,
      runningTotal: 0,
      completedOrder: null,
      backendQuote: null,
    });
  },

  recordUnitScanned: (flatIndex, item, unitNumber, totalUnits) => {
    set((prev) => ({
      currentIndex: flatIndex,
      runningTotal: prev.runningTotal + item.price,
      currentScanningItem: item,
      currentUnitInfo: { unitIndex: unitNumber, totalUnits },
      scanStage: 'laser',
    }));
  },

  finishScanning: () => {
    if (scanStepTimeout) {
      clearTimeout(scanStepTimeout);
      scanStepTimeout = null;
    }
    const state = get();
    const total = state.scannedItems.reduce((acc, it) => acc + it.subtotal, 0);

    set({
      phase: 'review',
      currentIndex: state.totalToScan,
      transferredToBenchCount: state.totalToScan,
      runningTotal: total,
      isConveyorMoving: false,
      currentScanningItem: null,
      currentUnitInfo: null,
      scanStage: 'idle',
    });
    get().revalidateCartWithBackend();
  },

  pauseScanning: () => {
    set({ isPaused: true, isConveyorMoving: false });
  },

  resumeScanning: () => {
    set({ isPaused: false, isConveyorMoving: true });
  },

  skipToReview: () => {
    if (scanStepTimeout) {
      clearTimeout(scanStepTimeout);
      scanStepTimeout = null;
    }
    const state = get();
    const allScanned: BillingScannedItem[] = currentItemsToScan.map((it) => ({
      ...it,
      scannedAt: Date.now(),
      scanSoundPlayed: true,
    }));
    const total = allScanned.reduce((acc, it) => acc + it.subtotal, 0);

    set({
      phase: 'review',
      scannedItems: allScanned,
      currentIndex: state.totalToScan,
      transferredToBenchCount: state.totalToScan,
      runningTotal: total,
      isConveyorMoving: false,
      currentScanningItem: null,
      currentUnitInfo: null,
      scanStage: 'idle',
    });
    get().revalidateCartWithBackend();
  },

  updateScannedItemQuantity: (itemId, quantity) => {
    // 1. Update in cart store (syncs with 3D trolley & HUD immediately)
    useCartStore.getState().updateQuantity(itemId, quantity);

    // 2. Update scanned items in billing store
    set((state) => {
      let updated: BillingScannedItem[];
      if (quantity <= 0) {
        updated = state.scannedItems.filter((i) => i.id !== itemId);
        currentItemsToScan = currentItemsToScan.filter((i) => i.id !== itemId);
      } else {
        updated = state.scannedItems.map((i) =>
          i.id === itemId
            ? { ...i, quantity, subtotal: quantity * i.price }
            : i
        );
        currentItemsToScan = currentItemsToScan.map((i) =>
          i.id === itemId
            ? { ...i, quantity, subtotal: quantity * i.price }
            : i
        );
      }

      const newRunningTotal = updated.reduce((acc, it) => acc + it.subtotal, 0);
      return {
        scannedItems: updated,
        runningTotal: newRunningTotal,
        totalToScan: currentItemsToScan.length,
      };
    });

    // Refresh backend authoritative quote
    get().revalidateCartWithBackend();
  },

  removeScannedItem: (itemId) => {
    get().updateScannedItemQuantity(itemId, 0);
  },

  revalidateCartWithBackend: async (fulfilmentType = 'DELIVERY') => {
    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) {
      set({ backendQuote: null });
      return null;
    }

    set({ isValidatingBackend: true });
    try {
      const quote = await api.revalidateCart({
        items: cartItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
          unitPrice: it.price,
          mrp: it.mrp,
        })),
        fulfilmentType,
      });

      set({ backendQuote: quote, isValidatingBackend: false });
      return quote;
    } catch {
      set({ isValidatingBackend: false });
      return null;
    }
  },

  proceedToCheckoutDetails: () => {
    set({ phase: 'checkout_details' });
    get().revalidateCartWithBackend();
  },

  backToReview: () => {
    set({ phase: 'review' });
  },

  proceedToPaymentMethods: () => {
    set({ phase: 'payment_methods' });
  },

  backToCheckoutDetails: () => {
    set({ phase: 'checkout_details' });
  },

  startProcessingPayment: () => {
    set({ phase: 'processing' });
  },

  setPaymentSuccess: (summary) => {
    sounds.playCashRegister();
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch {}
    set({
      phase: 'success_popup',
      completedOrder: summary,
    });
  },

  cancelBilling: () => {
    if (scanStepTimeout) {
      clearTimeout(scanStepTimeout);
      scanStepTimeout = null;
    }
    // Cancel billing without emptying trolley/cart!
    set({
      phase: 'idle',
      isPaused: false,
      isConveyorMoving: false,
      currentIndex: 0,
      transferredToBenchCount: 0,
      scannedItems: [],
      currentScanningItem: null,
      scanStage: 'idle',
    });
  },

  resetBilling: () => {
    if (scanStepTimeout) {
      clearTimeout(scanStepTimeout);
      scanStepTimeout = null;
    }
    set({
      phase: 'idle',
      scannedItems: [],
      currentIndex: 0,
      transferredToBenchCount: 0,
      totalToScan: 0,
      isPaused: false,
      isConveyorMoving: false,
      runningTotal: 0,
      backendQuote: null,
      currentScanningItem: null,
      scanStage: 'idle',
    });
  },
}));
