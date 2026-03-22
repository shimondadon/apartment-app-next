import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { issuesStorage, workSessionsStorage } from '@/lib/storage';
import { Issue, WorkSession, ApiResponse } from '@/lib/types';

type ParsedIssueRequest = {
  workSessionId: string;
  apartmentId: number;
  category: string;
  description: string;
  images: string[];
};

const validCategories: Issue['category'][] = ['maintenance', 'cleaning', 'supplies', 'safety', 'other'];

function isIssueCategory(value: string): value is Issue['category'] {
  return validCategories.includes(value as Issue['category']);
}

function normalizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

async function parseIssueRequest(request: NextRequest): Promise<ParsedIssueRequest> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const imageEntries = formData.getAll('images');
    const images = (
      await Promise.all(
        imageEntries.map(async (entry) => {
          if (entry instanceof File) {
            if (entry.size === 0) {
              return '';
            }

            const mimeType = entry.type || 'application/octet-stream';
            const base64 = Buffer.from(await entry.arrayBuffer()).toString('base64');
            return `data:${mimeType};base64,${base64}`;
          }

          return normalizeString(entry);
        })
      )
    ).filter(Boolean);

    return {
      workSessionId: normalizeString(formData.get('workSessionId')),
      apartmentId: Number(normalizeString(formData.get('apartmentId'))),
      category: normalizeString(formData.get('category')),
      description: normalizeString(formData.get('description')),
      images,
    };
  }

  const body = await request.json();

  return {
    workSessionId: normalizeString(body?.workSessionId),
    apartmentId: Number(body?.apartmentId),
    category: normalizeString(body?.category),
    description: normalizeString(body?.description),
    images: Array.isArray(body?.images)
      ? body.images
          .map((image: unknown) => normalizeString(image))
          .filter(Boolean)
      : [],
  };
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
    const { workSessionId, apartmentId, category, description, images } = await parseIssueRequest(request);

    if (!workSessionId || !category || !description || !Number.isFinite(apartmentId)) {
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

    if (!isIssueCategory(category)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid issue category' },
        { status: 400 }
      );
    }

    const issueCategory: Issue['category'] = category;

    const issue: Issue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workSessionId,
      apartmentId,
      category: issueCategory,
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
