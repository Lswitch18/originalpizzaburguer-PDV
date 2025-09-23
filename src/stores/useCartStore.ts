import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: 'pizza' | 'bebida' | 'combo' | 'entrada';
  sizes?: {
    size: string;
    price: number;
  }[];
  extras?: {
    name: string;
    price: number;
  }[];
  available: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: string;
  selectedExtras?: string[];
  customizations?: string;
  totalPrice: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (cartItem) => 
            cartItem.menuItem.id === item.menuItem.id &&
            cartItem.selectedSize === item.selectedSize &&
            JSON.stringify(cartItem.selectedExtras) === JSON.stringify(item.selectedExtras)
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          updatedItems[existingItemIndex].totalPrice += item.totalPrice;
          return { items: updatedItems };
        }

        return { items: [...state.items, item] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id 
            ? { 
                ...item, 
                quantity, 
                totalPrice: (item.totalPrice / item.quantity) * quantity 
              }
            : item
        )
      })),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.totalPrice, 0);
      }
    }),
    {
      name: 'fornalli-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);