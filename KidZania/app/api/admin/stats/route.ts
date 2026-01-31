import { NextResponse } from 'next/server';
import { getStats } from '@/lib/stats-tracker';

export const runtime = 'nodejs';

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}
