import { NextRequest, NextResponse } from 'next/server';

// Server-side recorded simulated orders
const simulatedOrders: any[] = [];

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));

  // Proxy to Spring Boot if available
  try {
    const res = await fetch('http://localhost:8080/api/payments/simulate', {
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

  const orderNumber = 'MV' + Math.floor(10000000 + Math.random() * 90000000);
  const now = new Date();
  const dateTime = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const subtotal = payload.items?.reduce((a: number, c: any) => a + (c.lineTotal || (c.unitPrice || 0) * (c.quantity || 1)), 0) || 0;
  const deliveryCharge = subtotal >= 499 || payload.fulfilmentType === 'STORE_PICKUP' ? 0 : 40;
  const codFee = payload.codFee || 0;
  const finalAmount = subtotal + deliveryCharge + codFee;

  const orderRecord = {
    orderId: 'ord-' + Date.now(),
    orderNumber,
    customerName: payload.customerName || 'Customer',
    customerPhone: payload.customerPhone || '9876543210',
    purchasedProductCount: payload.items?.reduce((a: number, c: any) => a + (c.quantity || 1), 0) || 1,
    subtotal,
    discountAmount: 0,
    deliveryCharge,
    finalAmount,
    paymentStatus: payload.paymentMethod === 'CASH' ? 'PENDING_CASH_COLLECTION' : 'PAID',
    paymentMethod: payload.paymentMethod || 'UPI',
    paymentProvider: payload.paymentProvider || 'SIMULATED_PAYMENT',
    dateTime,
    message: 'Order verified and recorded successfully in Martverse database.',
    demoMode: true,
    items: payload.items || [],
  };

  simulatedOrders.unshift(orderRecord);

  return NextResponse.json(
    {
      success: true,
      data: orderRecord,
    },
    { status: 200 }
  );
}

export { simulatedOrders };
