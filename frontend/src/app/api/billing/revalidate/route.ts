import { NextRequest, NextResponse } from 'next/server';
import { CANONICAL_BACKEND_PRODUCTS } from '@/lib/productsCatalog';

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));

  // Proxy to Spring Boot if available
  try {
    const res = await fetch('http://localhost:8080/api/billing/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': req.headers.get('x-session-id') || 'default',
        ...(req.headers.get('authorization') ? { Authorization: req.headers.get('authorization')! } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(600),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  const items = Array.isArray(payload.items) ? payload.items : [];
  let subtotal = 0;
  let mrpTotal = 0;
  let totalItems = 0;

  const verifiedItems = items.map((it: any) => {
    const p = CANONICAL_BACKEND_PRODUCTS.find((prod) => prod.id === it.productId || prod.slug === it.productId);
    const unitPrice = p ? p.price : (it.unitPrice || 50);
    const mrp = p ? p.mrp : (it.mrp || unitPrice);
    const qty = Math.max(1, it.quantity || 1);
    const lineTotal = unitPrice * qty;

    subtotal += lineTotal;
    mrpTotal += mrp * qty;
    totalItems += qty;

    return {
      productId: it.productId,
      productName: p ? p.name : (it.productName || 'Supermarket Item'),
      productSku: p ? p.sku : 'SKU-' + it.productId,
      variantId: it.variantId || 'standard',
      variantInfo: p ? p.weight : 'Standard Pack',
      quantity: qty,
      unitPrice,
      mrp,
      lineTotal,
      imageUrl: p ? p.imageUrl : (it.imageUrl || '/products/fallback.svg'),
      inStock: true,
      maxAvailableQuantity: p ? p.stockQuantity || 100 : 50,
    };
  });

  const discountAmount = Math.max(0, mrpTotal - subtotal);
  const deliveryCharge = payload.fulfilmentType === 'STORE_PICKUP' || subtotal >= 499 ? 0 : 40;
  const totalAmount = subtotal + deliveryCharge;

  return NextResponse.json(
    {
      valid: true,
      totalItems,
      subtotal,
      discountAmount,
      deliveryCharge,
      totalAmount,
      items: verifiedItems,
      warnings: [],
    },
    { status: 200 }
  );
}

