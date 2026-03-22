import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
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
