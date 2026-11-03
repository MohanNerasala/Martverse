import { NextResponse } from 'next/server';
import { MOCK_FLOORS } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(MOCK_FLOORS, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

