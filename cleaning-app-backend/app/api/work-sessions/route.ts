import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { workSessionsStorage } from '@/lib/storage';
import { WorkSession, StartWorkRequest, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body: StartWorkRequest = await request.json();
    const { workerId, apartmentId, location } = body;

    if (!workerId || !apartmentId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (workerId !== auth.workerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Worker ID mismatch' },
        { status: 403 }
      );
    }

    // Check if worker has an active session
    const activeSessions = workSessionsStorage.findMany<WorkSession>(
      (session) => session.workerId === workerId && session.status === 'working'
    );

    if (activeSessions.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Worker already has an active session' },
        { status: 400 }
      );
    }

    const workSession: WorkSession = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workerId,
      apartmentId,
      startTime: new Date(),
      status: 'working',
      location,
    };

    const savedSession = workSessionsStorage.add(workSession);

    return NextResponse.json<ApiResponse<WorkSession>>({
      success: true,
      data: savedSession,
      message: 'Work session started successfully',
    });
  } catch (error) {
    console.error('Error starting work session:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const workerId = searchParams.get('workerId');
    const status = searchParams.get('status');

    if (!workerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Worker ID is required' },
        { status: 400 }
      );
    }

    if (workerId !== auth.workerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized access to worker data' },
        { status: 403 }
      );
    }

    let sessions = workSessionsStorage.findMany<WorkSession>(
      (session) => session.workerId === workerId
    );

    if (status) {
      sessions = sessions.filter((s) => s.status === status);
    }

    return NextResponse.json<ApiResponse<WorkSession[]>>({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching work sessions:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { sessionId, endTime, status } = body;

    if (!sessionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = workSessionsStorage.findById<WorkSession>(sessionId);
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

    const updates: Partial<WorkSession> = {};
    if (endTime) updates.endTime = new Date(endTime);
    if (status) updates.status = status;

    const updatedSession = workSessionsStorage.update<WorkSession>(sessionId, updates);

    return NextResponse.json<ApiResponse<WorkSession>>({
      success: true,
      data: updatedSession!,
      message: 'Work session updated successfully',
    });
  } catch (error) {
    console.error('Error updating work session:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
