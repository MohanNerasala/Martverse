import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'UP', message: 'Martverse API Operational' }, { status: 200 });
}

