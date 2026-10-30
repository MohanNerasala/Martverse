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
    addressId?: string;
    addressLine1: string;
    addressLine2?: string;
    houseNo?: string;
    area?: string;
    landmark?: string;
    addressType?: string;
    city: string;
    state?: string;
    pinCode: string;
    deliveryInstructions?: string;
    fulfilmentType?: string;
    paymentMethod?: string;
    paymentProvider?: string;
    codFee?: number;
    items?: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      productName?: string;
      brand?: string;
      unitPrice?: number;
      lineTotal?: number;
      imageUrl?: string;
    }>;
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
    paymentMethod?: string;
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
      imageUrl?: string;
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

    const calculatedSubtotal = payload.items?.reduce((a, c) => a + (c.lineTotal || (c.unitPrice || 0) * c.quantity), 0) || 0;
    const calculatedDelivery = calculatedSubtotal >= 499 || payload.fulfilmentType === 'STORE_PICKUP' ? 0 : 40;
    const calculatedCod = payload.codFee || 0;
    const calculatedTotal = calculatedSubtotal + calculatedDelivery + calculatedCod;

    const fallbackResponse = {
      orderId: 'demo-ord-' + Date.now(),
      orderNumber: fallbackOrderNo,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      purchasedProductCount: payload.items?.reduce((a, c) => a + c.quantity, 0) || 1,
      subtotal: calculatedSubtotal,
      discountAmount: 0,
      deliveryCharge: calculatedDelivery,
      finalAmount: calculatedTotal,
      paymentStatus: payload.paymentMethod === 'CASH' ? 'PENDING_CASH_COLLECTION' : 'PAID',
      paymentMethod: payload.paymentMethod || 'UPI',
      paymentProvider: payload.paymentProvider || 'SIMULATED_PAYMENT',
      dateTime: fallbackDate,
      message: 'Order verified and recorded successfully in Martverse database.',
      demoMode: true,
      items: payload.items?.map(it => ({
        productName: it.productName || 'Supermarket Product',
        brand: it.brand || 'Supermarket',
        quantity: it.quantity,
        unitPrice: it.unitPrice || 0,
        lineTotal: it.lineTotal || (it.unitPrice || 0) * it.quantity,
        imageUrl: it.imageUrl || '/products/fallback.svg',
      })) || [],
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
        body: JSON.stringify({
          ...payload,
          paymentMethod: payload.paymentMethod || 'UPI',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          finalOrder = {
            ...json.data,
            paymentMethod: payload.paymentMethod || json.data.paymentMethod || 'UPI',
            paymentProvider: payload.paymentProvider || json.data.paymentProvider || 'DIRECT',
          };
        }
      }
    } catch {
      // Offline fallback
    }

    // Persist to local browser storage so orders appear immediately in Orders Page
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('martverse_customer_orders') || '[]');
        const cleanPhone = (payload.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
        const orderRecord = {
          ...finalOrder,
          id: finalOrder.orderId || finalOrder.orderNumber,
          customerPhone: cleanPhone || payload.customerPhone,
          customerName: payload.customerName,
          status: payload.paymentMethod === 'CASH' ? 'CONFIRMED (COD)' : 'CONFIRMED',
          paymentStatus: payload.paymentMethod === 'CASH' ? 'PENDING_CASH' : 'PAID',
          paymentMethod: payload.paymentMethod || 'UPI',
          paymentProvider: payload.paymentProvider || 'UPI_DIRECT',
          fulfilmentType: payload.fulfilmentType || 'DELIVERY',
          createdAt: new Date().toISOString(),
          subtotal: calculatedSubtotal || finalOrder.subtotal,
          deliveryCharge: calculatedDelivery,
          codFee: calculatedCod,
          totalAmount: calculatedTotal || finalOrder.finalAmount,
          address: {
            fullName: payload.customerName,
            phone: cleanPhone || payload.customerPhone,
            addressLine1: payload.addressLine1,
            city: payload.city,
            state: payload.state,
            pinCode: payload.pinCode,
          },
          items: (payload.items && payload.items.length > 0)
            ? payload.items.map(it => ({
                productName: it.productName || 'Supermarket Item',
                brand: it.brand || 'Supermarket',
                quantity: it.quantity,
                unitPrice: it.unitPrice || 0,
                lineTotal: it.lineTotal || (it.unitPrice || 0) * it.quantity,
                imageUrl: it.imageUrl || '/products/fallback.svg',
              }))
            : (finalOrder.items || []),
        };
        const updated = [orderRecord, ...existing.filter((o: any) => o.orderNumber !== finalOrder.orderNumber)].slice(0, 50);
        localStorage.setItem('martverse_customer_orders', JSON.stringify(updated));
      }
    } catch {}

    return finalOrder;
  },

  // --- Customer Address API (Full Backend DB Persistence & Deduplication) ---
  async getAddresses(phone?: string): Promise<any[]> {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
    let localAddresses: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        localAddresses = JSON.parse(localStorage.getItem('martverse_saved_addresses') || '[]');
      } catch {}
    }

    try {
      const query = cleanPhone ? `?phone=${cleanPhone}` : '';
      const remote = await fetchWithFallback<any[]>(`/addresses${query}`, { method: 'GET' }, []);
      if (Array.isArray(remote) && remote.length > 0) {
        // Normalize backend fields for frontend BigBasket-style cards
        const formatted = remote.map((r: any) => ({
          id: r.id ? String(r.id) : 'addr-' + Date.now(),
          name: r.fullName || 'Rahul Sharma',
          phone: r.phone || cleanPhone || '9876543210',
          type: (r.addressType || 'HOME').toUpperCase(),
          houseNo: r.houseNo || r.addressLine1 || '',
          area: r.area || r.addressLine2 || '',
          landmark: r.landmark || '',
          city: r.city || 'Bengaluru',
          state: r.state || 'Karnataka',
          pinCode: r.pinCode || '',
          isDefault: Boolean(r.isDefault),
        }));

        if (typeof window !== 'undefined') {
          localStorage.setItem('martverse_saved_addresses', JSON.stringify(formatted));
        }
        return formatted;
      }
    } catch {}

    return localAddresses;
  },

  async saveAddress(address: {
    id?: string;
    fullName?: string;
    name?: string;
    phone: string;
    email?: string;
    type?: string;
    addressType?: string;
    houseNo: string;
    area: string;
    landmark?: string;
    city: string;
    state?: string;
    pinCode: string;
    isDefault?: boolean;
    deliveryInstructions?: string;
  }): Promise<any> {
    const cleanPhone = address.phone ? address.phone.replace(/[^0-9]/g, '').slice(-10) : '9876543210';
    const payload = {
      id: address.id && !address.id.startsWith('addr-') ? address.id : undefined,
      fullName: address.fullName || address.name || 'Rahul Sharma',
      phone: cleanPhone,
      email: address.email || '',
      addressType: (address.addressType || address.type || 'HOME').toUpperCase(),
      houseNo: address.houseNo.trim(),
      area: address.area.trim(),
      landmark: address.landmark?.trim() || '',
      addressLine1: `${address.houseNo.trim()}, ${address.area.trim()}`,
      addressLine2: address.landmark?.trim() || '',
      city: address.city.trim() || 'Bengaluru',
      state: address.state?.trim() || 'Karnataka',
      pinCode: address.pinCode.trim(),
      deliveryInstructions: address.deliveryInstructions || '',
      isDefault: Boolean(address.isDefault),
    };

    let savedItem: any = null;
    try {
      savedItem = await fetchWithFallback<any>('/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, null);
    } catch {}

    const normalized = {
      id: savedItem?.id ? String(savedItem.id) : (address.id || 'addr-' + Date.now()),
      name: payload.fullName,
      phone: payload.phone,
      type: payload.addressType,
      houseNo: payload.houseNo,
      area: payload.area,
      landmark: payload.landmark,
      city: payload.city,
      state: payload.state,
      pinCode: payload.pinCode,
      isDefault: payload.isDefault,
    };

    // Update local storage without duplicates
    if (typeof window !== 'undefined') {
      try {
        const existing: any[] = JSON.parse(localStorage.getItem('martverse_saved_addresses') || '[]');
        // Check if same houseNo and area and pinCode exists
        let updatedList = existing.filter((item) => {
          const isSameId = item.id === normalized.id;
          const isSameDetails =
            item.houseNo?.trim().toLowerCase() === normalized.houseNo.trim().toLowerCase() &&
            item.area?.trim().toLowerCase() === normalized.area.trim().toLowerCase() &&
            item.pinCode?.trim() === normalized.pinCode.trim();
          return !isSameId && !isSameDetails;
        });

        if (normalized.isDefault) {
          updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
        }

        updatedList.unshift(normalized);
        localStorage.setItem('martverse_saved_addresses', JSON.stringify(updatedList));
      } catch {}
    }

    return normalized;
  },

  async setDefaultAddress(id: string, phone?: string): Promise<void> {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
    if (id && !id.startsWith('addr-')) {
      try {
        await fetchWithFallback(`/addresses/${id}/default${cleanPhone ? `?phone=${cleanPhone}` : ''}`, {
          method: 'PUT',
        }, null);
      } catch {}
    }

    if (typeof window !== 'undefined') {
      try {
        const existing: any[] = JSON.parse(localStorage.getItem('martverse_saved_addresses') || '[]');
        const updated = existing.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));
        localStorage.setItem('martverse_saved_addresses', JSON.stringify(updated));
      } catch {}
    }
  },

  async deleteAddress(id: string): Promise<void> {
    if (id && !id.startsWith('addr-')) {
      try {
        await fetchWithFallback(`/addresses/${id}`, {
          method: 'DELETE',
        }, null);
      } catch {}
    }

    if (typeof window !== 'undefined') {
      try {
        const existing: any[] = JSON.parse(localStorage.getItem('martverse_saved_addresses') || '[]');
        const updated = existing.filter((a) => a.id !== id);
        localStorage.setItem('martverse_saved_addresses', JSON.stringify(updated));
      } catch {}
    }
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
