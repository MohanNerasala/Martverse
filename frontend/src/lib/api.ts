import { SupermarketFloor, Product, Cart, AuthState, User, Order } from '@/types';
import { MOCK_FLOORS, MOCK_PRODUCTS } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'guest-session-1';
  let sid = localStorage.getItem('martverse_session_id');
  if (!sid) {
    sid = 'guest-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('martverse_session_id', sid);
  }
  return sid;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('martverse_token');
}

async function fetchWithFallback<T>(url: string, options: RequestInit = {}, fallback: T): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // quick timeout for fallback
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`API [${url}] returned status ${res.status}. Using fallback data.`);
      return fallback;
    }
    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.warn(`API [${url}] fetch failed:`, err);
    return fallback;
  }
}

export const api = {
  // Layout API
  async getFloors(): Promise<SupermarketFloor[]> {
    return fetchWithFallback<SupermarketFloor[]>('/layout/floors', { method: 'GET' }, MOCK_FLOORS);
  },

  async getProducts(): Promise<Product[]> {
    try {
      const raw = await fetchWithFallback<any>('/products/all', { method: 'GET' }, null);
      if (Array.isArray(raw) && raw.length > 0) return raw;
      if (raw && Array.isArray(raw.content) && raw.content.length > 0) return raw.content;

      const paged = await fetchWithFallback<any>('/products?size=100', { method: 'GET' }, null);
      if (Array.isArray(paged) && paged.length > 0) return paged;
      if (paged && Array.isArray(paged.content) && paged.content.length > 0) return paged.content;
    } catch (e) {
      console.warn('Failed to load products from API, using mock fallback:', e);
    }
    return MOCK_PRODUCTS;
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const fallback = MOCK_PRODUCTS.find(p => p.slug === slug);
    return fetchWithFallback<Product | undefined>(`/products/${slug}`, { method: 'GET' }, fallback);
  },

  // Cart API
  async getCart(): Promise<Cart> {
    const emptyCart: Cart = {
      id: 'local-cart',
      items: [],
      totalItems: 0,
      subtotal: 0,
      discountTotal: 0,
      totalAmount: 0,
      freeDeliveryThreshold: 499,
      deliveryCharge: 0,
    };
    return fetchWithFallback<Cart>('/cart', { method: 'GET' }, emptyCart);
  },

  async addToCart(productId: string, quantity: number = 1, variantId?: string): Promise<Cart> {
    const emptyCart: Cart = {
      id: 'local-cart',
      items: [],
      totalItems: quantity,
      subtotal: 0,
      discountTotal: 0,
      totalAmount: 0,
      freeDeliveryThreshold: 499,
      deliveryCharge: 0,
    };
    return fetchWithFallback<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantId }),
    }, emptyCart);
  },

  // Authoritative Backend Cart Revalidation (calculates authoritative totals & verifies stock)
  async revalidateCart(payload: {
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    fulfilmentType?: string;
  }): Promise<{
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
  }> {
    const fallbackSubtotal = payload.items.reduce((acc, it) => acc + (it.quantity * 100), 0);
    const fallbackDelivery = fallbackSubtotal >= 499 || payload.fulfilmentType === 'STORE_PICKUP' ? 0 : 40;
    const fallbackResponse = {
      valid: true,
      totalItems: payload.items.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: fallbackSubtotal,
      discountAmount: 0,
      deliveryCharge: fallbackDelivery,
      totalAmount: fallbackSubtotal + fallbackDelivery,
      items: [],
      warnings: [],
    };

    return fetchWithFallback('/billing/revalidate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, fallbackResponse);
  },

  // Simulated Dummy Payment API (Strictly Demo Mode — No real money charged)
  async checkoutSimulated(payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    pinCode: string;
    deliveryInstructions?: string;
    fulfilmentType?: string;
    items?: Array<{ productId: string; variantId?: string; quantity: number }>;
  }): Promise<{
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
    paymentProvider: string;
    dateTime: string;
    message: string;
    demoMode: boolean;
    items: Array<{
      productName: string;
      brand: string;
      variantInfo?: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  }> {
    const fallbackDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const fallbackOrderNo = 'MV' + Math.floor(10000000 + Math.random() * 90000000);

    const fallbackResponse = {
      orderId: 'demo-ord-' + Date.now(),
      orderNumber: fallbackOrderNo,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      purchasedProductCount: payload.items?.reduce((a, c) => a + c.quantity, 0) || 1,
      subtotal: 0,
      discountAmount: 0,
      deliveryCharge: 0,
      finalAmount: 0,
      paymentStatus: 'SIMULATED_SUCCESS',
      paymentProvider: 'SIMULATED_PAYMENT',
      dateTime: fallbackDate,
      message: 'This is a demo transaction. No real money was charged.',
      demoMode: true,
      items: [],
    };

    try {
      const res = await fetch(`${API_BASE}/payments/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId(),
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data || fallbackResponse;
      }
    } catch (err) {
      console.warn('Backend call /payments/simulate failed, using simulated response:', err);
    }
    return fallbackResponse;
  },

  // Auth helper
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.accessToken) {
          localStorage.setItem('martverse_token', data.data.accessToken);
          return {
            user: { id: data.data.userId, email: data.data.email, role: data.data.role },
            token: data.data.accessToken,
          };
        }
      }
    } catch {}
    return null;
  },

  // Customer Order History
  async getOrderHistory(phone?: string): Promise<any[]> {
    try {
      const url = phone
        ? `${API_BASE}/orders/history?phone=${encodeURIComponent(phone)}`
        : `${API_BASE}/orders/history`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.warn('Failed to fetch order history:', e);
    }
    return [];
  },
};
