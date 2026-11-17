import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '';
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  // Proxy to Spring Boot if available
  try {
    const res = await fetch(`http://localhost:8080/api/addresses${cleanPhone ? `?phone=${cleanPhone}` : ''}`, {
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

  return NextResponse.json([], { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Proxy to Spring Boot if available
  try {
    const res = await fetch('http://localhost:8080/api/addresses', {
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

  const addressItem = {
    id: 'addr-' + Date.now(),
    ...body,
    isDefault: true,
  };

  return NextResponse.json(addressItem, { status: 200 });
}
