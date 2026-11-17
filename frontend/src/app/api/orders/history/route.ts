import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '';
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  // Proxy to Spring Boot if available
  try {
    const res = await fetch(`http://localhost:8080/api/orders/history${cleanPhone ? `?phone=${cleanPhone}` : ''}`, {
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

  // If Spring Boot is offline, return empty list or client storage will hydrate
  return NextResponse.json({ success: true, data: [] }, { status: 200 });
}

