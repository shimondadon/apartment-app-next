// Apartments API - Get all apartments

import { NextResponse } from 'next/server';
import { APARTMENTS } from '@/lib/catalog';
import type { ApiResponse, Apartment } from '@/lib/types';

export async function GET() {
  try {
    return NextResponse.json<ApiResponse<Apartment[]>>({
      success: true,
      data: APARTMENTS,
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch apartments' },
      { status: 500 }
    );
  }
}
