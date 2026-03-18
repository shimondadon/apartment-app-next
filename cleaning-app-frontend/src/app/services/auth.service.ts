import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Worker, LoginRequest } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'cleaning_app_token';
  private workerKey = 'cleaning_app_worker';
  private currentWorkerSubject = new BehaviorSubject<Worker | null>(this.getStoredWorker());
  public currentWorker$ = this.currentWorkerSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<any> {
    return this.apiService.login(credentials).pipe(
      tap(response => {
        if (response.success && response.token && response.worker) {
          this.setToken(response.token);
          this.setWorker(response.worker);
          this.currentWorkerSubject.next(response.worker);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.workerKey);
    this.currentWorkerSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  setWorker(worker: Worker): void {
    localStorage.setItem(this.workerKey, JSON.stringify(worker));
  }

  getStoredWorker(): Worker | null {
    const workerStr = localStorage.getItem(this.workerKey);
    return workerStr ? JSON.parse(workerStr) : null;
  }

  getCurrentWorker(): Worker | null {
    return this.currentWorkerSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
