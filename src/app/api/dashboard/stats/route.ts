// API route for dashboard stats
import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data-service';

export async function GET(request: NextRequest) {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
