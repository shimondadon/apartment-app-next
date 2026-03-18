import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import {
  workSessionsStorage,
  workersStorage,
  inventoryLogsStorage,
  issuesStorage,
} from '@/lib/storage';
import { WorkSession, Worker, Apartment, WorkSummary, ApiResponse } from '@/lib/types';

// Apartment data (in a real app, this would come from a database)
const APARTMENTS: Apartment[] = [
  { id: 1, name: 'דירה 101', icon: '🏠' },
  { id: 2, name: 'דירה 102', icon: '🏠' },
  { id: 3, name: 'דירה 103', icon: '🏠' },
  { id: 4, name: 'דירה 104', icon: '🏠' },
  { id: 5, name: 'דירה 201', icon: '🏢' },
  { id: 6, name: 'דירה 202', icon: '🏢' },
];

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

    const worker = workersStorage.findById<Worker>(session.workerId);
    if (!worker) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    const apartment = APARTMENTS.find((apt) => apt.id === session.apartmentId);
    if (!apartment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }

    const inventoryUsed = inventoryLogsStorage.findMany(
      (log) => log.workSessionId === workSessionId
    );

    const issuesReported = issuesStorage.findMany(
      (issue) => issue.workSessionId === workSessionId
    );

    let duration: number | undefined;
    if (session.endTime) {
      duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      duration = Math.floor(duration / 1000 / 60); // Convert to minutes
    }

    // Calculate tasks completed (in a real app, this would come from task completion storage)
    // For now, we'll estimate based on inventory logs
    const tasksCompleted = inventoryUsed.length;
    const totalTasks = 30; // Total tasks from all categories

    const summary: WorkSummary = {
      workSessionId,
      worker,
      apartment,
      startTime: session.startTime,
      endTime: session.endTime,
      duration,
      tasksCompleted,
      totalTasks,
      inventoryUsed,
      issuesReported,
    };

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
