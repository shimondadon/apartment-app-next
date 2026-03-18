import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WorkSession, StartWorkRequest } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  private currentSessionSubject = new BehaviorSubject<WorkSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  private timerSubject = new BehaviorSubject<number>(0);
  public timer$ = this.timerSubject.asObservable();

  private timerInterval: any;

  constructor(private apiService: ApiService) {}

  startWork(request: StartWorkRequest): Observable<any> {
    return this.apiService.startWork(request).pipe(
      map(response => {
        if (response.success && response.data) {
          this.currentSessionSubject.next(response.data);
          this.startTimer(response.data.startTime);
        }
        return response;
      })
    );
  }

  endWork(sessionId: string): Observable<any> {
    return this.apiService.endWork(sessionId).pipe(
      map(response => {
        if (response.success) {
          this.stopTimer();
          this.currentSessionSubject.next(null);
        }
        return response;
      })
    );
  }

  loadCurrentSession(workerId: string): void {
    this.apiService.getCurrentSession(workerId).subscribe(response => {
      if (response.success && response.data) {
        this.currentSessionSubject.next(response.data);
        this.startTimer(response.data.startTime);
      }
    });
  }

  getCurrentSession(): WorkSession | null {
    return this.currentSessionSubject.value;
  }

  private startTimer(startTime: Date): void {
    this.stopTimer();
    const start = new Date(startTime).getTime();
    
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      this.timerSubject.next(elapsed);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerSubject.next(0);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  requestLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }
}
