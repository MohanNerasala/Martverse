import { NextResponse } from 'next/server';

export async function GET() {
  let springBootOnline = false;

  try {
    const res = await fetch('http://localhost:8080/api/health', {
      signal: AbortSignal.timeout(600),
    });
    if (res.ok) {
      springBootOnline = true;
    }
  } catch {}

  return NextResponse.json(
    {
      status: 'UP',
      message: 'Martverse Integrated API Operational',
      springBootOnline,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
