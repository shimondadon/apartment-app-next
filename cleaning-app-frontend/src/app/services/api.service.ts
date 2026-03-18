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
  TaskCategory
} from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001/api';

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
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/tasks/complete`, request);
  }

  // Issue endpoints
  reportIssue(request: FormData): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/issues/report`, request);
  }

  // Summary endpoints
  getSummary(sessionId: string): Observable<ApiResponse<WorkSummary>> {
    return this.http.get<ApiResponse<WorkSummary>>(`${this.baseUrl}/summary/${sessionId}`);
  }
}
