import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItemOption = {
  frameSize: string;
  frameType: string;
  location: string;
  locationType: 'address' | 'coordinates';
  engravingText?: string;
  mapZoom?: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options: CartItemOption;
};

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateItem: (id: string, data: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart, merge if already exists with same options
      addItem: (item) => {
        const { items } = get();
        
        // Generate unique ID for cart item
        const id = crypto.randomUUID();
        
        // Check if same product with same options already exists
        const existingItemIndex = items.findIndex(
          (cartItem) => 
            cartItem.productId === item.productId && 
            cartItem.options.frameSize === item.options.frameSize &&
            cartItem.options.frameType === item.options.frameType &&
            cartItem.options.location === item.options.location &&
            cartItem.options.engravingText === item.options.engravingText
        );
        
        // If item exists, update quantity
        if (existingItemIndex > -1) {
          const existingItem = items[existingItemIndex];
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + item.quantity,
          };
          
          set({ items: updatedItems });
        } else {
          // Otherwise add new item
          set({ items: [...items, { ...item, id }] });
        }
      },
      
      // Update existing cart item
      updateItem: (id, data) => {
        const { items } = get();
        const updatedItems = items.map((item) => 
          item.id === id ? { ...item, ...data } : item
        );
        
        set({ items: updatedItems });
      },
      
      // Remove item from cart
      removeItem: (id) => {
        const { items } = get();
        const filteredItems = items.filter((item) => item.id !== id);
        
        set({ items: filteredItems });
      },
      
      // Clear entire cart
      clearCart: () => {
        set({ items: [] });
      },
      
      // Get total number of items in cart
      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Get cart total price
      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity, 
          0
        );
      },
    }),
    {
      name: 'maps-and-memories-cart',
    }
  )
); 