import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    { id: 'c0000000-0000-0000-0000-000000000001', name: 'Snacks & Namkeen', slug: 'snacks-namkeen', floorNumber: 1, aisleNumber: 1 },
    { id: 'c0000000-0000-0000-0000-000000000002', name: 'Bakery & Biscuits', slug: 'bakery-biscuits', floorNumber: 1, aisleNumber: 2 },
    { id: 'c0000000-0000-0000-0000-000000000003', name: 'Beverages & Tea/Coffee', slug: 'beverages-tea-coffee', floorNumber: 1, aisleNumber: 3 },
    { id: 'c0000000-0000-0000-0000-000000000004', name: 'Dairy & Breakfast', slug: 'dairy-breakfast', floorNumber: 1, aisleNumber: 4 },
    { id: 'c0000000-0000-0000-0000-000000000005', name: 'Rice, Atta & Pulses', slug: 'rice-flours-pulses', floorNumber: 1, aisleNumber: 5 },
    { id: 'c0000000-0000-0000-0000-000000000006', name: 'Spices & Cooking Oils', slug: 'spices-cooking-essentials', floorNumber: 1, aisleNumber: 6 },
    { id: 'c0000000-0000-0000-0000-000000000007', name: 'Instant & Packaged Foods', slug: 'instant-packaged-foods', floorNumber: 1, aisleNumber: 7 },
    { id: 'c0000000-0000-0000-0000-000000000008', name: 'Personal Care & Hygiene', slug: 'personal-care', floorNumber: 1, aisleNumber: 8 },
    { id: 'c0000000-0000-0000-0000-000000000009', name: 'Household & Cleaning', slug: 'household-cleaning', floorNumber: 1, aisleNumber: 9 },
    { id: 'c0000000-0000-0000-0000-000000000010', name: 'Fresh Produce & Fruits', slug: 'fresh-produce-fruits-veggies', floorNumber: 1, aisleNumber: 10 },
  ];

  return NextResponse.json(categories, {
    status: 200,
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
