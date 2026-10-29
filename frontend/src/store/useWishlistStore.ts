import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { sounds } from '@/lib/sound';
import { api } from '@/lib/api';

interface WishlistStore {
  items: Product[];
  isWishlistOpen: boolean;
  isLoadingBackend: boolean;
  
  toggleWishlist: (open?: boolean) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleItem: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithBackend: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isWishlistOpen: false,
      isLoadingBackend: false,

      toggleWishlist: (open) => {
        set((state) => ({ isWishlistOpen: open !== undefined ? open : !state.isWishlistOpen }));
      },

      addToWishlist: (product) => {
        sounds.playPickSound();
        set((state) => {
          if (state.items.some((i) => i.id === product.id)) return state;
          return { items: [product, ...state.items] };
        });

        // Background sync to backend
        api.addToWishlist(product.id).catch(() => {});
      },

      removeFromWishlist: (productId) => {
        sounds.playClick();
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }));

        // Background sync to backend
        api.removeFromWishlist(productId).catch(() => {});
      },

      toggleItem: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        if (exists) {
          get().removeFromWishlist(product.id);
          return false;
        } else {
          get().addToWishlist(product);
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
        api.clearWishlist().catch(() => {});
      },

      syncWithBackend: async () => {
        try {
          set({ isLoadingBackend: true });
          const backendData = await api.getWishlist();
          const backendItems: Product[] = Array.isArray(backendData)
            ? backendData
            : Array.isArray((backendData as any)?.items)
            ? (backendData as any).items
            : [];

          if (backendItems.length > 0) {
            // Merge with local items
            set((state) => {
              const mergedMap = new Map<string, Product>();
              state.items.forEach((p) => mergedMap.set(p.id, p));
              backendItems.forEach((p: any) => {
                if (p && p.id && !mergedMap.has(p.id)) {
                  mergedMap.set(p.id, p as Product);
                }
              });
              return { items: Array.from(mergedMap.values()), isLoadingBackend: false };
            });
          } else {
            set({ isLoadingBackend: false });
          }
        } catch {
          set({ isLoadingBackend: false });
        }
      },
    }),
    {
      name: 'martverse_wishlist_storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
