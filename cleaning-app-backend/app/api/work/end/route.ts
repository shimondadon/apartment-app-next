// End work session endpoint

import { NextRequest, NextResponse } from 'next/server';
import { workSessionsStorage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';
import type { WorkSession, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const user = authenticateRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the work session
    const session = workSessionsStorage.findById<WorkSession>(sessionId);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Work session not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (session.workerId !== user.workerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update session to completed
    const updatedSession = workSessionsStorage.update<WorkSession>(sessionId, {
      endTime: new Date(),
      status: 'completed'
    });

    return NextResponse.json<ApiResponse<WorkSession>>({
      success: true,
      data: updatedSession!
    });

  } catch (error) {
    console.error('End work error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
