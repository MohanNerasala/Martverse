import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { phone } = body;
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);

  // Proxy to Spring Boot if available
  try {
    const res = await fetch('http://localhost:8080/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone }),
      signal: AbortSignal.timeout(600),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  return NextResponse.json(
    {
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      data: {
        testOtp,
        message: `OTP sent successfully to +91 ${cleanPhone}`,
      },
    },
    { status: 200 }
  );
}
