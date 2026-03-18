import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest } from '@/lib/auth';
import { issuesStorage, workSessionsStorage } from '@/lib/storage';
import { Issue, WorkSession, ApiResponse } from '@/lib/types';

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
    const { workSessionId, apartmentId, category, description, images } = body;

    if (!workSessionId || !apartmentId || !category || !description) {
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

    const newIssue: Issue = {
      id: uuidv4(),
      workSessionId,
      apartmentId,
      category,
      description,
      images: images || [],
      timestamp: new Date(),
      status: 'reported'
    };

    issuesStorage.add(newIssue);

    return NextResponse.json<ApiResponse<Issue>>({
      success: true,
      data: newIssue
    });

  } catch (error) {
    console.error('Report issue error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}