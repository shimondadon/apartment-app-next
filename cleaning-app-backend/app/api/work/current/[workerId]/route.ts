// Get current/active work session for a worker

import { NextRequest, NextResponse } from 'next/server';
import { workSessionsStorage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';
import type { WorkSession, ApiResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ workerId: string }> }
) {
  try {
    // Authenticate request
    const user = authenticateRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { workerId } = params;

    // Find active work session for this worker
    const sessions = workSessionsStorage.findMany<WorkSession>(
      (session) => session.workerId === workerId && session.status === 'working'
    );

    if (sessions.length === 0) {
      return NextResponse.json<ApiResponse<WorkSession | null>>({
        success: true,
        data: null
      });
    }

    // Return the most recent active session
    const currentSession = sessions[sessions.length - 1];

    return NextResponse.json<ApiResponse<WorkSession>>({
      success: true,
      data: currentSession
    });

  } catch (error) {
    console.error('Get current session error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
