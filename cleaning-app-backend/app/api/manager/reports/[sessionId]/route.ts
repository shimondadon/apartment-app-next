import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/auth';
import { buildWorkSummary } from '@/lib/work-summary';
import type { ApiResponse, WorkSummary } from '@/lib/types';

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

/** סיכום עבודה למנהל — מזהה בכתובת הוא sessionId מ-work-sessions (אין קובץ שיתוף נפרד). */
export async function GET(request: NextRequest, context: RouteContext) {
  if (!authenticateAdminRequest(request)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await context.params;
  if (!sessionId?.trim()) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'חסר מזהה עבודה' }, { status: 400 });
  }

  const summary = buildWorkSummary(sessionId.trim());
  if (!summary) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'דוח לא נמצא' }, { status: 404 });
  }

  return NextResponse.json<ApiResponse<WorkSummary>>({
    success: true,
    data: summary,
  });
}
