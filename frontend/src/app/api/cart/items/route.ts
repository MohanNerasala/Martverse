import { NextRequest, NextResponse } from 'next/server';
import { CANONICAL_BACKEND_PRODUCTS } from '@/lib/productsCatalog';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { productId, quantity = 1, variantId } = body;

  // Try proxying to Spring Boot if available
  try {
    const res = await fetch('http://localhost:8080/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': req.headers.get('x-session-id') || 'default',
        ...(req.headers.get('authorization') ? { Authorization: req.headers.get('authorization')! } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(600),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  const product = CANONICAL_BACKEND_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found in store catalog' },
      { status: 404 }
    );
  }

  const price = product.price || 99;
  const mrp = product.mrp || Math.round(price * 1.15);

  const cartItem = {
    id: 'item-' + (product.id || productId),
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    productImage: product.imageUrl,
    brand: product.brand,
    variantId: variantId || 'standard',
    variantName: product.weight || 'Standard Pack',
    unitPrice: price,
    mrp: mrp,
    quantity: Number(quantity) || 1,
    lineTotal: price * (Number(quantity) || 1),
    maxStock: product.stockQuantity || 50,
  };

  return NextResponse.json(
    {
      success: true,
      data: {
        message: `${product.name} added to cart`,
        item: cartItem,
      },
    },
    { status: 200 }
  );
}

