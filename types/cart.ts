export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  frameSize: string;
  frameType: string;
  engravingText?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
} 