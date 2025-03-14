'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Cart, CartItem } from '@/types/cart';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CART: Cart = {
  id: '',
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useCart() {
  const [mounted, setMounted] = useState(false);
  const [localCart, setLocalCart] = useLocalStorage('cart', DEFAULT_CART);
  
  // Initialize cart with a unique ID if it doesn't have one
  useEffect(() => {
    if (!localCart.id) {
      setLocalCart({
        ...localCart,
        id: uuidv4(),
      });
    }
    setMounted(true);
  }, [localCart, setLocalCart]);
  
  // Add an item to the cart
  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: uuidv4(),
    };
    
    // Check if this product with same options already exists
    const existingItemIndex = localCart.items.findIndex((cartItem) => {
      return (
        cartItem.name === item.name &&
        cartItem.frameSize === item.frameSize &&
        cartItem.frameType === item.frameType &&
        cartItem.engravingText === item.engravingText &&
        JSON.stringify(cartItem.location) === JSON.stringify(item.location)
      );
    });
    
    if (existingItemIndex > -1) {
      // Increment quantity of existing item
      const updatedItems = [...localCart.items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      
      setLocalCart({
        ...localCart,
        items: updatedItems,
        updatedAt: new Date(),
      });
    } else {
      // Add new item
      setLocalCart({
        ...localCart,
        items: [...localCart.items, newItem],
        updatedAt: new Date(),
      });
    }
  };
  
  // Update quantity of an item
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = localCart.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
        };
      }
      return item;
    });
    
    setLocalCart({
      ...localCart,
      items: updatedItems,
      updatedAt: new Date(),
    });
  };
  
  // Remove an item from the cart
  const removeItem = (id: string) => {
    const updatedItems = localCart.items.filter((item) => item.id !== id);
    
    setLocalCart({
      ...localCart,
      items: updatedItems,
      updatedAt: new Date(),
    });
  };
  
  // Clear the cart
  const clearCart = () => {
    setLocalCart({
      ...DEFAULT_CART,
      id: localCart.id,
      createdAt: localCart.createdAt,
      updatedAt: new Date(),
    });
  };
  
  // Calculate cart subtotal
  const getSubtotal = () => {
    return localCart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  };
  
  // Expose an empty cart while client-side hydration is happening
  const cart = mounted ? localCart : DEFAULT_CART;
  
  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    isEmpty: cart.items.length === 0,
    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
} 