import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  WorkSession,
  StartWorkRequest,
  CompleteTaskRequest,
  ReportIssueRequest,
  WorkSummary,
  Apartment,
  TaskCategory,
  Worker
} from '../models/types';

export type ManagerWorkerRow = Pick<Worker, 'id' | 'name'>;
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  // Apartment endpoints
  getApartments(): Observable<ApiResponse<Apartment[]>> {
    return this.http.get<ApiResponse<Apartment[]>>(`${this.baseUrl}/apartments`);
  }

  // Work session endpoints
  startWork(request: StartWorkRequest): Observable<ApiResponse<WorkSession>> {
    return this.http.post<ApiResponse<WorkSession>>(`${this.baseUrl}/work/start`, request);
  }

  endWork(sessionId: string): Observable<ApiResponse<WorkSession>> {
    return this.http.post<ApiResponse<WorkSession>>(`${this.baseUrl}/work/end`, { sessionId });
  }

  getCurrentSession(workerId: string): Observable<ApiResponse<WorkSession>> {
    return this.http.get<ApiResponse<WorkSession>>(`${this.baseUrl}/work/current/${workerId}`);
  }

  getWorkSessions(workerId: string, status?: string): Observable<ApiResponse<WorkSession[]>> {
    let url = `${this.baseUrl}/work-sessions?workerId=${workerId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<ApiResponse<WorkSession[]>>(url);
  }

  // Task endpoints
  getTasks(): Observable<ApiResponse<TaskCategory[]>> {
    return this.http.get<ApiResponse<TaskCategory[]>>(`${this.baseUrl}/tasks`);
  }

  completeTask(request: CompleteTaskRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/tasks`, request);
  }

  // Issue endpoints
  reportIssue(request: FormData): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/issues/report`, request);
  }

  // Summary endpoints
  getSummary(sessionId: string): Observable<ApiResponse<WorkSummary>> {
    return this.http.get<ApiResponse<WorkSummary>>(`${this.baseUrl}/summary/${sessionId}`);
  }

  adminLogin(password: string): Observable<ApiResponse<{ token: string }>> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.baseUrl}/admin/login`, {
      password,
    });
  }

  /** סיכום עבודה למנהל — sessionId כמו ב-work-sessions.json */
  getManagerReportSummary(sessionId: string, adminToken: string): Observable<ApiResponse<WorkSummary>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${adminToken}` });
    return this.http.get<ApiResponse<WorkSummary>>(
      `${this.baseUrl}/manager/reports/${encodeURIComponent(sessionId)}`,
      { headers }
    );
  }

  getManagerWorkers(adminToken: string): Observable<ApiResponse<ManagerWorkerRow[]>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${adminToken}` });
    return this.http.get<ApiResponse<ManagerWorkerRow[]>>(`${this.baseUrl}/manager/workers`, { headers });
  }

  getManagerWorkerSessions(workerId: string, adminToken: string): Observable<ApiResponse<WorkSession[]>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${adminToken}` });
    return this.http.get<ApiResponse<WorkSession[]>>(
      `${this.baseUrl}/manager/workers/${encodeURIComponent(workerId)}/sessions`,
      { headers }
    );
  }

  deleteManagerSession(sessionId: string, adminToken: string): Observable<ApiResponse<void>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${adminToken}` });
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/manager/sessions/${encodeURIComponent(sessionId)}`,
      { headers }
    );
  }
}
