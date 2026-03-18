import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { inventoryLogsStorage, workSessionsStorage } from '@/lib/storage';
import { InventoryLog, WorkSession, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { workSessionId, taskId, items } = body;

    if (!workSessionId || !taskId || !items || !Array.isArray(items)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
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

    const inventoryLog: InventoryLog = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workSessionId,
      taskId,
      items,
      timestamp: new Date(),
    };

    const savedLog = inventoryLogsStorage.add(inventoryLog);

    return NextResponse.json<ApiResponse<InventoryLog>>({
      success: true,
      data: savedLog,
      message: 'Inventory logged successfully',
    });
  } catch (error) {
    console.error('Error logging inventory:', error);
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

    const logs = inventoryLogsStorage.findMany<InventoryLog>(
      (log) => log.workSessionId === workSessionId
    );

    return NextResponse.json<ApiResponse<InventoryLog[]>>({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
