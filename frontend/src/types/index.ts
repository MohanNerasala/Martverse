export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  size?: string;
  color?: string;
  colorCode?: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  inStock: boolean;
  imageUrl?: string;
}

export interface ProductPlacement {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productMrp: number;
  productImage?: string;
  categoryName?: string;
  floorNumber: number;
  aisleId: string;
  aisleNumber: number;
  aisleName: string;
  aisleCategory: string;
  shelfSide: 'LEFT' | 'RIGHT';
  shelfTier: number; // 1 = bottom, 2 = middle, 3 = top
  shelfPosition: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  rotationY: number;
  color?: string;
  modelType?: 'box' | 'can' | 'bottle' | 'bag' | 'shirt' | 'hanger';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  weightGrams?: number;
  unit: string;
  imageUrl: string;
  category: Category;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  variants?: ProductVariant[];
  placement?: ProductPlacement;
}

export interface SupermarketAisle {
  id: string;
  floorId: string;
  floorNumber: number;
  aisleNumber: number;
  name: string;
  categoryName: string;
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  shelfHeight: number;
  shelfTiers: number;
  colorCode: string;
  bannerText: string;
  placements?: ProductPlacement[];
}

export interface SupermarketFloor {
  id: string;
  floorNumber: number;
  name: string;
  description: string;
  length: number;
  width: number;
  height: number;
  aisles: SupermarketAisle[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  brand: string;
  unit: string;
  variantId?: string;
  variantName?: string;
  size?: string;
  color?: string;
  modelType?: 'box' | 'can' | 'bottle' | 'bag' | 'shirt' | 'hanger';
  price: number;
  mrp: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  freeDeliveryThreshold: number;
  deliveryCharge: number;
}

export interface BillingScannedItem extends CartItem {
  scannedAt: number;
  scanSoundPlayed: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_ADMIN';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'DELIVERED';
  paymentId?: string;
  createdAt: string;
}
