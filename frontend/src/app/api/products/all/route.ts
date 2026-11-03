import { NextResponse } from 'next/server';
import { CANONICAL_BACKEND_PRODUCTS } from '@/lib/productsCatalog';

export async function GET() {
  return NextResponse.json(CANONICAL_BACKEND_PRODUCTS, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

