import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { workSessionsStorage } from '@/lib/storage';
import { buildWorkSummary } from '@/lib/work-summary';
import type { WorkSession, ApiResponse, WorkSummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const workSessionId = searchParams.get('workSessionId');

    if (!workSessionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Work session ID is required' },
        { status: 400 }
      );
    }

    const session = workSessionsStorage.findById<WorkSession>(workSessionId);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Work session not found' },
        { status: 404 }
      );
    }

    if (session.workerId !== auth.workerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized access to work session' },
        { status: 403 }
      );
    }

    const summary = buildWorkSummary(workSessionId);
    if (!summary) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to build summary' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<WorkSummary>>({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error generating work summary:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
