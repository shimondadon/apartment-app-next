// Apartments API - Get all apartments

import { NextResponse } from 'next/server';
import type { Apartment, ApiResponse } from '@/lib/types';

const APARTMENTS: Apartment[] = [
  {
    id: 6,
    name: 'דירה 6',
    icon: '✨',
    subtitle: '',
    badges: [
      { type: 'new', label: 'חדש' },
      { type: 'special', label: 'פנג שואי' }
    ]
  },
  {
    id: 7,
    name: 'דירה 7',
    icon: '🏡',
    subtitle: 'דירה רגילה',
    badges: []
  },
  {
    id: 8,
    name: 'דירה 8',
    icon: '🏠',
    subtitle: 'דירה רגילה',
    badges: []
  },
  {
    id: 9,
    name: 'דירה 9',
    icon: '🏘️',
    subtitle: 'דירה רגילה',
    badges: []
  },
  {
    id: 10,
    name: 'דירה 10',
    icon: '🏢',
    subtitle: 'דירה רגילה',
    badges: []
  },
  {
    id: 11,
    name: 'דירה 11',
    icon: '🏗️',
    subtitle: 'בשיפוץ',
    badges: [
      { type: 'special', label: 'חדש' }
    ]
  }
];

export async function GET() {
  try {
    return NextResponse.json<ApiResponse<Apartment[]>>({
      success: true,
      data: APARTMENTS
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch apartments' },
      { status: 500 }
    );
  }
}
