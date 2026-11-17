import { NextRequest, NextResponse } from 'next/server';
import { CANONICAL_BACKEND_PRODUCTS } from '@/lib/productsCatalog';

// In-memory session cart storage
const sessionCarts = new Map<string, any>();

function getOrCreateCart(sessionId: string) {
  if (!sessionCarts.has(sessionId)) {
    sessionCarts.set(sessionId, {
      id: 'cart-' + sessionId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      discountTotal: 0,
      totalAmount: 0,
      freeDeliveryThreshold: 499,
      deliveryCharge: 0,
    });
  }
  return sessionCarts.get(sessionId);
}

export async function GET(req: NextRequest) {
  // Try proxying to Spring Boot if available
  try {
    const res = await fetch('http://localhost:8080/api/cart', {
      headers: {
        'X-Session-Id': req.headers.get('x-session-id') || 'default',
        ...(req.headers.get('authorization') ? { Authorization: req.headers.get('authorization')! } : {}),
      },
      signal: AbortSignal.timeout(600),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  const sid = req.headers.get('x-session-id') || 'guest';
  const cart = getOrCreateCart(sid);
  return NextResponse.json(cart, { status: 200 });
}
