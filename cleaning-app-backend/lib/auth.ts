// JWT Authentication utilities

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'cleaning-app-secret-key-change-in-production';

export interface WorkerTokenPayload {
  workerId: string;
  name: string;
}

export interface AdminTokenPayload {
  role: 'admin';
}

export type VerifiedTokenPayload = WorkerTokenPayload | AdminTokenPayload;

export function isAdminPayload(p: VerifiedTokenPayload | null): p is AdminTokenPayload {
  return p !== null && 'role' in p && p.role === 'admin';
}

export function isWorkerPayload(p: VerifiedTokenPayload | null): p is WorkerTokenPayload {
  return p !== null && 'workerId' in p;
}

export function generateToken(payload: WorkerTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function generateAdminToken(): string {
  return jwt.sign({ role: 'admin' } satisfies AdminTokenPayload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): VerifiedTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as VerifiedTokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function authenticateRequest(request: NextRequest): WorkerTokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  const payload = verifyToken(token);
  if (isWorkerPayload(payload)) {
    return payload;
  }
  return null;
}

export function authenticateAdminRequest(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  if (!token) {
    return false;
  }
  const payload = verifyToken(token);
  return isAdminPayload(payload);
}
