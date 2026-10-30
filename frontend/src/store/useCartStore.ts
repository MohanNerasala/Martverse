import { create } from 'zustand';
import { Product, ProductVariant, CartItem } from '@/types';
import { sounds } from '@/lib/sound';
import { useMartStore } from './useMartStore';

export interface FlyAnimation {
  id: string;
  productName: string;
  startPos: [number, number, number];
  color: string;
  modelType: string;
  createdAt: number;
  duration: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  isCartOpen: boolean;
  isPaid: boolean;
  flyAnimations: FlyAnimation[];
  
  toggleCart: (open?: boolean) => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant, startPos?: [number, number, number]) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setIsPaid: (paid: boolean) => void;
  removeFlyAnimation: (id: string) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalItems: 0,
  subtotal: 0,
  discountTotal: 0,
  totalAmount: 0,
  isCartOpen: false,
  isPaid: false,
  flyAnimations: [],

  toggleCart: (open) => {
    set((state) => ({ isCartOpen: open !== undefined ? open : !state.isCartOpen }));
  },

  addItem: (product, quantity = 1, variant, customStartPos) => {
    sounds.playPickSound();
    
    // Determine realistic 3D world start position: custom -> shelf placement -> player hand
    let startPos: [number, number, number];
    if (customStartPos) {
      startPos = customStartPos;
    } else if (product.placement) {
      startPos = [product.placement.worldX, product.placement.worldY + 0.35, product.placement.worldZ];
    } else {
      const pPos = useMartStore.getState().playerPos;
      const pYaw = useMartStore.getState().playerYaw;
      startPos = [
        pPos[0] + Math.sin(pYaw) * 0.7,
        pPos[1] + 0.25,
        pPos[2] + Math.cos(pYaw) * 0.7,
      ];
    }

    const animId = 'fly-' + Math.random().toString(36).substring(2, 9);
    const color = variant?.colorCode || variant?.color || product.placement?.color || '#3b82f6';
    const modelType = product.placement?.modelType || 'box';
    const duration = 950; // ms for graceful 3D lift, glide, and basket drop

    // Check if 3D scene canvas is active in the DOM
    const has3DCanvas = typeof document !== 'undefined' && !!document.querySelector('canvas');

    const commitItemToCart = () => {
      set((state) => {
        const existingIndex = state.items.findIndex(
          (it) => it.productId === product.id && it.variantId === variant?.id
        );

        const unitPrice = variant ? variant.price : product.price;
        const unitMrp = variant ? variant.mrp : product.mrp;

        let newItems = [...state.items];
        if (existingIndex > -1) {
          const item = newItems[existingIndex];
          const newQty = item.quantity + quantity;
          newItems[existingIndex] = {
            ...item,
            quantity: newQty,
            subtotal: newQty * unitPrice,
          };
        } else {
          const newItem: CartItem = {
            id: 'item-' + Math.random().toString(36).substring(2, 9),
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.imageUrl,
            brand: product.brand,
            unit: product.unit,
            variantId: variant?.id,
            variantName: variant?.name,
            size: variant?.size,
            color: color,
            modelType: modelType,
            price: unitPrice,
            mrp: unitMrp,
            quantity,
            subtotal: quantity * unitPrice,
          };
          newItems.push(newItem);
        }

        const totalItems = newItems.reduce((acc, it) => acc + it.quantity, 0);
        const subtotal = newItems.reduce((acc, it) => acc + it.subtotal, 0);
        const mrpTotal = newItems.reduce((acc, it) => acc + it.mrp * it.quantity, 0);
        const discountTotal = Math.max(0, mrpTotal - subtotal);
        // In-store 3D supermarket trolley total matches exact item costs (no delivery surcharge while browsing)
        const totalAmount = subtotal;

        return {
          items: newItems,
          totalItems,
          subtotal,
          discountTotal,
          totalAmount,
          isPaid: false, // Adding new items resets paid status
        };
      });
    };

    if (has3DCanvas) {
      // 1. Queue parabolic flying projectile in the 3D air
      set((state) => ({
        flyAnimations: [
          ...state.flyAnimations,
          {
            id: animId,
            productName: product.name,
            startPos,
            color,
            modelType,
            createdAt: Date.now(),
            duration,
          },
        ],
      }));

      // 2. Only show item inside trolley basket AFTER drop finishes into the basket!
      setTimeout(() => {
        get().removeFlyAnimation(animId);
        sounds.playScanBeep();
        commitItemToCart();
      }, duration);
    } else {
      // Direct instant commit when outside 3D store view (e.g. wishlist/orders page)
      sounds.playScanBeep();
      commitItemToCart();
    }
  },

  updateQuantity: (itemId, quantity) => {
    set((state) => {
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = state.items.filter((it) => it.id !== itemId);
      } else {
        newItems = state.items.map((it) => {
          if (it.id === itemId) {
            return {
              ...it,
              quantity,
              subtotal: quantity * it.price,
            };
          }
          return it;
        });
      }

      const totalItems = newItems.reduce((acc, it) => acc + it.quantity, 0);
      const subtotal = newItems.reduce((acc, it) => acc + it.subtotal, 0);
      const mrpTotal = newItems.reduce((acc, it) => acc + it.mrp * it.quantity, 0);
      const discountTotal = Math.max(0, mrpTotal - subtotal);
      const totalAmount = subtotal;

      return {
        items: newItems,
        totalItems,
        subtotal,
        discountTotal,
        totalAmount,
      };
    });
  },

  removeItem: (itemId) => {
    get().updateQuantity(itemId, 0);
  },

  clearCart: () => {
    set({
      items: [],
      totalItems: 0,
      subtotal: 0,
      discountTotal: 0,
      totalAmount: 0,
      isPaid: false,
    });
  },

  setIsPaid: (paid) => {
    set({ isPaid: paid });
  },

  removeFlyAnimation: (id) => {
    set((state) => ({
      flyAnimations: state.flyAnimations.filter((a) => a.id !== id),
    }));
  },
}));
