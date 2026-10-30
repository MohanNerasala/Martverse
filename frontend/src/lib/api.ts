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

let isBackendOffline = false;
let lastBackendCheck = 0;

async function fetchWithFallback<T>(url: string, options: RequestInit = {}, fallback: T): Promise<T> {
  const now = Date.now();
  // Circuit breaker: if backend proved unreachable recently, return fallback immediately (0ms refresh lag)
  if (isBackendOffline && now - lastBackendCheck < 15000) {
    return fallback;
  }

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
    const timeoutId = setTimeout(() => controller.abort(), 400); // 400ms rapid probe
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return fallback;
    }
    isBackendOffline = false;
    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch {
    // Backend offline: mark offline to avoid blocking subsequent calls
    isBackendOffline = true;
    lastBackendCheck = now;
    return fallback;
  }
}

export const api = {
  // Layout API
  async getFloors(): Promise<SupermarketFloor[]> {
    return fetchWithFallback<SupermarketFloor[]>('/layout/floors', { method: 'GET' }, MOCK_FLOORS);
  },

  async getProducts(): Promise<Product[]> {
    if (isBackendOffline) return MOCK_PRODUCTS;
    try {
      const raw = await fetchWithFallback<any>('/products/all', { method: 'GET' }, null);
      if (Array.isArray(raw) && raw.length > 0) return raw;
      if (raw && Array.isArray(raw.content) && raw.content.length > 0) return raw.content;

      if (!isBackendOffline) {
        const paged = await fetchWithFallback<any>('/products?size=100', { method: 'GET' }, null);
        if (Array.isArray(paged) && paged.length > 0) return paged;
        if (paged && Array.isArray(paged.content) && paged.content.length > 0) return paged.content;
      }
    } catch {}
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
    items: Array<{ productId: string; variantId?: string; quantity: number; unitPrice?: number; mrp?: number }>;
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
    const fallbackSubtotal = payload.items.reduce((acc, it) => {
      const price = it.unitPrice !== undefined ? it.unitPrice : 0;
      return acc + (it.quantity * price);
    }, 0);
    const fallbackMrpTotal = payload.items.reduce((acc, it) => {
      const mrp = it.mrp !== undefined ? it.mrp : (it.unitPrice || 0);
      return acc + (it.quantity * mrp);
    }, 0);
    const fallbackDiscount = Math.max(0, fallbackMrpTotal - fallbackSubtotal);
    const fallbackDelivery = payload.fulfilmentType === 'STORE_PICKUP' || fallbackSubtotal >= 499 ? 0 : 40;
    const fallbackResponse = {
      valid: true,
      totalItems: payload.items.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: fallbackSubtotal,
      discountAmount: fallbackDiscount,
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

    let finalOrder = fallbackResponse;

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
        if (json.data) {
          finalOrder = json.data;
        }
      }
    } catch {
      // Offline fallback
    }

    // Persist to local browser storage so orders appear immediately without delay
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('martverse_customer_orders') || '[]');
        const cleanPhone = (payload.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
        const orderRecord = {
          ...finalOrder,
          id: finalOrder.orderId || finalOrder.orderNumber,
          customerPhone: cleanPhone || payload.customerPhone,
          customerName: payload.customerName,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          createdAt: new Date().toISOString(),
          totalAmount: finalOrder.finalAmount || finalOrder.subtotal || 0,
        };
        const updated = [orderRecord, ...existing.filter((o: any) => o.orderNumber !== finalOrder.orderNumber)].slice(0, 50);
        localStorage.setItem('martverse_customer_orders', JSON.stringify(updated));
      }
    } catch {}

    return finalOrder;
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

  // Indian Mobile OTP Send
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; testOtp?: string }> {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const endpoints = [
      'http://localhost:8080/api/auth/send-otp',
      'http://127.0.0.1:8080/api/auth/send-otp',
      '/api/auth/send-otp',
    ];

    let lastErrorMessage = '';
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.data || {};
          console.log(
            `%c[MARTVERSE AUTH] Random OTP sent by backend: ${data.testOtp} (Check your terminal!)`,
            'color: #3b82f6; font-weight: bold; font-size: 13px;'
          );
          return {
            success: true,
            message: data.message || `OTP sent successfully to +91 ${cleanPhone}`,
            testOtp: data.testOtp,
          };
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastErrorMessage = errJson.message || 'Server rejected OTP request.';
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || 'Connection failed';
      }
    }

    // If backend couldn't be reached on any endpoint
    return {
      success: false,
      message: `Could not connect to backend on port 8080. Please ensure backend is running in your terminal. (${lastErrorMessage})`,
    };
  },

  // Indian Mobile OTP Verify
  async verifyOtp(
    phone: string,
    otp: string
  ): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const endpoints = [
      'http://localhost:8080/api/auth/verify-otp',
      'http://127.0.0.1:8080/api/auth/verify-otp',
      '/api/auth/verify-otp',
    ];

    let lastErrorMessage = '';
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, otp: otp.trim() }),
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.data || {};
          const token = data.accessToken;
          const user = data.user || {
            id: 'user-' + cleanPhone,
            phone: cleanPhone,
            fullName: 'Customer +91 ' + cleanPhone,
            email: 'phone' + cleanPhone + '@martverse.com',
            role: 'CUSTOMER',
          };
          if (token) {
            localStorage.setItem('martverse_token', token);
            localStorage.setItem('martverse_user', JSON.stringify(user));
            localStorage.setItem('martverse_phone', cleanPhone);
          }
          return { success: true, token, user, message: 'Welcome to Martverse!' };
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastErrorMessage = errJson.message || 'Invalid verification code.';
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || 'Connection error';
      }
    }

    return {
      success: false,
      message: lastErrorMessage || 'Verification failed. Please check the OTP from your terminal.',
    };
  },

  // Customer Order History
  async getOrderHistory(phone?: string): Promise<any[]> {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
    let backendOrders: any[] = [];

    try {
      const url = cleanPhone
        ? `${API_BASE}/orders/history?phone=${encodeURIComponent(cleanPhone)}`
        : `${API_BASE}/orders/history`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          backendOrders = json.data;
        }
      }
    } catch {
      // Offline fallback
    }

    // Merge with locally persisted orders for instant reactivity
    let localOrders: any[] = [];
    try {
      if (typeof window !== 'undefined') {
        const saved = JSON.parse(localStorage.getItem('martverse_customer_orders') || '[]');
        if (cleanPhone) {
          localOrders = saved.filter((o: any) => {
            const op = (o.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
            return !op || op === cleanPhone;
          });
        } else {
          localOrders = saved;
        }
      }
    } catch {}

    const orderMap = new Map<string, any>();
    // Add backend orders first
    for (const ord of backendOrders) {
      const key = ord.orderNumber || ord.id;
      if (key) orderMap.set(key, ord);
    }
    // Add local orders (filling any missing items)
    for (const ord of localOrders) {
      const key = ord.orderNumber || ord.id;
      if (key && !orderMap.has(key)) {
        orderMap.set(key, ord);
      }
    }

    return Array.from(orderMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  },

  // Customer Wishlist API
  async getWishlist(): Promise<any> {
    return fetchWithFallback<any>('/wishlist', { method: 'GET' }, { items: [] });
  },

  async toggleWishlist(productId: string): Promise<any> {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async addToWishlist(productId: string): Promise<any> {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/wishlist/items/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async removeFromWishlist(productId: string): Promise<any> {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/wishlist/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return null;
  },

  async clearWishlist(): Promise<void> {
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE}/wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {}
  },
};
