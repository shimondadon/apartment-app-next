// Authentication API - Login endpoint

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { workersStorage } from '@/lib/storage';
import { generateToken } from '@/lib/auth';
import type { Worker, LoginRequest, AuthResponse } from '@/lib/types';

// Valid access codes (in production, store these securely in database)
const VALID_CODES: Record<string, boolean> = {
  'עובדת1234': true,
  'ניקיון2024': true,
  'test': true,
  '1234': true
};

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Validate code
    if (!VALID_CODES[code]) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Find or create worker
    let worker = workersStorage.findOne<Worker>((w) => w.name === name && w.code === code);
    
    if (!worker) {
      // Create new worker
      worker = {
        id: uuidv4(),
        name,
        code,
        createdAt: new Date()
      };
      workersStorage.add(worker);
    }

    // Generate JWT token
    const token = generateToken({
      workerId: worker.id,
      name: worker.name
    });

    return NextResponse.json<AuthResponse>({
      success: true,
      token,
      worker: {
        id: worker.id,
        name: worker.name,
        createdAt: worker.createdAt
      } as Worker
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
