import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { workSessionsStorage, taskCompletionsStorage } from '@/lib/storage';
import { TASK_CATEGORIES } from '@/lib/catalog';
import { ApiResponse, CompleteTaskRequest, TaskCategory, TaskCompletion } from '@/lib/types';

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    return NextResponse.json<ApiResponse<TaskCategory[]>>({
      success: true,
      data: TASK_CATEGORIES,
    });
  } catch (error) {
    console.error('Error fetching task categories:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body: CompleteTaskRequest = await request.json();
    const { workSessionId, taskId, inventory } = body;

    if (!workSessionId || !taskId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const session: any = workSessionsStorage.findById(workSessionId);
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

    // Store task completion
    const taskCompletion: TaskCompletion = {
      id: `${workSessionId}-${taskId}`,
      workSessionId,
      taskId,
      timestamp: new Date(),
    };
    
    taskCompletionsStorage.add(taskCompletion);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Task marked as completed',
      data: { taskId, workSessionId, inventory },
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
