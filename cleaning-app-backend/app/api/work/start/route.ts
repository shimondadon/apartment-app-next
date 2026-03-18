// Start work session endpoint

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { workSessionsStorage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';
import type { WorkSession, StartWorkRequest, ApiResponse } from '@/lib/types';

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

    const body: StartWorkRequest = await request.json();
    const { workerId, apartmentId, location } = body;

    if (!workerId || !apartmentId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Worker ID and Apartment ID are required' },
        { status: 400 }
      );
    }

    // Check if worker already has an active session
    const activeSessions = workSessionsStorage.findMany<WorkSession>(
      (session) => session.workerId === workerId && session.status === 'working'
    );

    if (activeSessions.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Worker already has an active work session' },
        { status: 400 }
      );
    }

    // Create new work session
    const newSession: WorkSession = {
      id: uuidv4(),
      workerId,
      apartmentId,
      startTime: new Date(),
      location,
      status: 'working'
    };

    workSessionsStorage.add(newSession);

    return NextResponse.json<ApiResponse<WorkSession>>({
      success: true,
      data: newSession
    });

  } catch (error) {
    console.error('Start work error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
