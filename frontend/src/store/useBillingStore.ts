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
  | 'processing'
  | 'success_popup';

interface BillingStore {
  phase: BillingPhase;
  scannedItems: BillingScannedItem[];
  currentIndex: number;
  totalToScan: number;
  isPaused: boolean;
  isConveyorMoving: boolean;
  runningTotal: number;
  completedOrder: CompletedOrderSummary | null;
  backendQuote: BackendQuote | null;
  isValidatingBackend: boolean;

  startCheckout: (items: CartItem[]) => void;
  pauseScanning: () => void;
  resumeScanning: () => void;
  updateScannedItemQuantity: (itemId: string, quantity: number) => void;
  removeScannedItem: (itemId: string) => void;
  revalidateCartWithBackend: (fulfilmentType?: string) => Promise<BackendQuote | null>;
  proceedToCheckoutDetails: () => void;
  backToReview: () => void;
  startProcessingPayment: () => void;
  setPaymentSuccess: (summary: CompletedOrderSummary) => void;
  cancelBilling: () => void;
  resetBilling: () => void;
}

let scanTimer: NodeJS.Timeout | null = null;
let currentItemsToScan: CartItem[] = [];

export const useBillingStore = create<BillingStore>((set, get) => ({
  phase: 'idle',
  scannedItems: [],
  currentIndex: 0,
  totalToScan: 0,
  isPaused: false,
  isConveyorMoving: false,
  runningTotal: 0,
  completedOrder: null,
  backendQuote: null,
  isValidatingBackend: false,

  startCheckout: (items) => {
    if (items.length === 0) return;
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }

    currentItemsToScan = [...items];

    set({
      phase: 'scanning',
      scannedItems: [],
      currentIndex: 0,
      totalToScan: items.length,
      isPaused: false,
      isConveyorMoving: true,
      runningTotal: 0,
      completedOrder: null,
      backendQuote: null,
    });

    scanTimer = setInterval(() => {
      const state = get();
      if (state.phase !== 'scanning') {
        if (scanTimer) clearInterval(scanTimer);
        return;
      }

      if (state.isPaused) {
        // Paused by user, wait until resumed
        return;
      }

      const idx = state.currentIndex;
      if (idx < currentItemsToScan.length) {
        const item = currentItemsToScan[idx];
        sounds.playScanBeep();

        const scannedItem: BillingScannedItem = {
          ...item,
          scannedAt: Date.now(),
          scanSoundPlayed: true,
        };

        const newRunningTotal = state.runningTotal + item.subtotal;

        set((prev) => ({
          scannedItems: [...prev.scannedItems, scannedItem],
          currentIndex: idx + 1,
          runningTotal: newRunningTotal,
        }));
      } else {
        // All items scanned, transition to review
        if (scanTimer) {
          clearInterval(scanTimer);
          scanTimer = null;
        }
        set({ phase: 'review', isConveyorMoving: false });
        // Automatically fetch authoritative backend quote
        get().revalidateCartWithBackend();
      }
    }, 700);
  },

  pauseScanning: () => {
    set({ isPaused: true, isConveyorMoving: false });
  },

  resumeScanning: () => {
    set({ isPaused: false, isConveyorMoving: true });
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
        })),
        fulfilmentType,
      });

      set({ backendQuote: quote, isValidatingBackend: false });
      return quote;
    } catch (err) {
      console.warn('Backend cart revalidation error:', err);
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
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    // Cancel billing without emptying trolley/cart!
    set({
      phase: 'idle',
      isPaused: false,
      isConveyorMoving: false,
      currentIndex: 0,
      scannedItems: [],
    });
  },

  resetBilling: () => {
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    set({
      phase: 'idle',
      scannedItems: [],
      currentIndex: 0,
      totalToScan: 0,
      isPaused: false,
      isConveyorMoving: false,
      runningTotal: 0,
      backendQuote: null,
    });
  },
}));
