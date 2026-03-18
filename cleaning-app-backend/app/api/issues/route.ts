import { NextRequest, NextResponse } from 'next/server';
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

    const validCategories = ['maintenance', 'cleaning', 'supplies', 'safety', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid issue category' },
        { status: 400 }
      );
    }

    const issue: Issue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workSessionId,
      apartmentId,
      category,
      description,
      images: images || [],
      timestamp: new Date(),
      status: 'reported',
    };

    const savedIssue = issuesStorage.add(issue);

    return NextResponse.json<ApiResponse<Issue>>({
      success: true,
      data: savedIssue,
      message: 'Issue reported successfully',
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
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
    const apartmentId = searchParams.get('apartmentId');

    if (!workSessionId && !apartmentId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Either workSessionId or apartmentId is required' },
        { status: 400 }
      );
    }

    let issues: Issue[] = [];

    if (workSessionId) {
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

      issues = issuesStorage.findMany<Issue>(
        (issue) => issue.workSessionId === workSessionId
      );
    } else if (apartmentId) {
      issues = issuesStorage.findMany<Issue>(
        (issue) => issue.apartmentId === parseInt(apartmentId)
      );
    }

    return NextResponse.json<ApiResponse<Issue[]>>({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
