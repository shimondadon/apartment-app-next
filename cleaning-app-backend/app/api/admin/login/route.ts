import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

function normalizeAdminPassword(input: string): string {
  return input.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const passwordRaw = typeof body?.password === 'string' ? body.password : '';
    const expected = normalizeAdminPassword(
      process.env.ADMIN_PASSWORD ?? 'admin'
    );
    const given = normalizeAdminPassword(passwordRaw);

    if (!given || given !== expected) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'סיסמה שגויה' },
        { status: 401 }
      );
    }

    const token = generateAdminToken();
    return NextResponse.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token },
    });
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'בקשה לא תקינה' },
      { status: 400 }
    );
  }
}
