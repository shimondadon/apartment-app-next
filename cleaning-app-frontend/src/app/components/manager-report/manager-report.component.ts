import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ManagerWorkerRow } from '../../services/api.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { WorkSession, WorkSummary } from '../../models/types';
import { issueCategoryHebrew } from '../../constants/issue-categories';

@Component({
  selector: 'app-manager-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-report.component.html',
  styleUrls: ['./manager-report.component.css'],
})
export class ManagerReportComponent implements OnInit {
  /** מזהה עבודה — כמו ב-work-sessions */
  sessionId = '';
  username = '';
  password = '';
  loginError = '';
  loginLoading = false;
  loadError = '';
  loading = false;
  summary: WorkSummary | null = null;
  selectedIssueImage: string | null = null;

  workers: ManagerWorkerRow[] = [];
  workersLoading = false;
  sessionsLoading = false;
  selectedWorkerId: string | null = null;
  sessionsForWorker: WorkSession[] = [];
  sessionOptions: { id: string; label: string }[] = [];
  deleteLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private adminAuth: AdminAuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.adminAuth.isLoggedIn();
  }

  ngOnInit(): void {
    if (this.adminAuth.isLoggedIn()) {
      this.loadWorkers();
    }
    this.route.paramMap.subscribe(() => {
      this.sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
      if (!this.adminAuth.isLoggedIn()) {
        return;
      }
      if (this.sessionId) {
        this.fetchReport();
      } else {
        this.summary = null;
        this.loadError = '';
      }
    });
  }

  submitLogin(): void {
    this.loginError = '';
    this.loginLoading = true;
    this.api.adminLogin(this.password).subscribe({
      next: (res) => {
        this.loginLoading = false;
        if (res.success && res.data?.token) {
          this.adminAuth.setToken(res.data.token);
          this.password = '';
          this.loadWorkers();
          if (this.sessionId) {
            this.fetchReport();
          }
        } else {
          this.loginError = res.error ?? 'התחברות נכשלה';
        }
      },
      error: () => {
        this.loginLoading = false;
        this.loginError = 'שגיאת שרת';
      },
    });
  }

  logout(): void {
    this.adminAuth.clearToken();
    this.summary = null;
    this.loadError = '';
    this.workers = [];
    this.selectedWorkerId = null;
    this.sessionsForWorker = [];
    this.sessionOptions = [];
  }

  loadWorkers(): void {
    const token = this.adminAuth.getToken();
    if (!token) {
      return;
    }
    this.workersLoading = true;
    this.api.getManagerWorkers(token).subscribe({
      next: (res) => {
        this.workersLoading = false;
        if (res.success && res.data) {
          this.workers = res.data;
        } else {
          this.workers = [];
        }
      },
      error: () => {
        this.workersLoading = false;
        this.workers = [];
      },
    });
  }

  loadWorkerSessions(workerId: string, after?: () => void): void {
    const token = this.adminAuth.getToken();
    if (!token || !workerId) {
      return;
    }
    this.sessionsLoading = true;
    this.api.getManagerWorkerSessions(workerId, token).subscribe({
      next: (res) => {
        this.sessionsLoading = false;
        if (res.success && res.data) {
          this.sessionsForWorker = res.data;
          this.sessionOptions = this.sessionsForWorker.map((s) => ({
            id: s.id,
            label: `${this.formatDate(s.startTime)} - דירה ${s.apartmentId} - ${this.formatTime(s.startTime)}`,
          }));
          this.selectedWorkerId = workerId;
          after?.();
        } else {
          this.sessionsForWorker = [];
          this.sessionOptions = [];
        }
      },
      error: () => {
        this.sessionsLoading = false;
        this.sessionsForWorker = [];
        this.sessionOptions = [];
      },
    });
  }

  onWorkerChange(workerId: string | null): void {
    if (!workerId) {
      return;
    }
    this.loadWorkerSessions(workerId, () => {
      if (this.sessionsForWorker.length === 0) {
        void this.router.navigate(['/report']);
        return;
      }
      const first = this.sessionsForWorker[0].id;
      if (first !== this.sessionId) {
        void this.router.navigate(['/report', first]);
      }
    });
  }

  onSessionChange(newSessionId: string): void {
    if (!newSessionId || newSessionId === this.sessionId) {
      return;
    }
    void this.router.navigate(['/report', newSessionId]);
  }

  trackBySessionId(_index: number, option: { id: string; label: string }): string {
    return option.id;
  }

  deleteCurrentReport(): void {
    if (!this.sessionId) {
      return;
    }
    if (!window.confirm('למחוק את הדוח הזה? הפעולה בלתי הפיכה.')) {
      return;
    }
    const token = this.adminAuth.getToken();
    if (!token) {
      return;
    }
    this.deleteLoading = true;
    const wid = this.selectedWorkerId ?? this.summary?.worker.id;
    this.api.deleteManagerSession(this.sessionId, token).subscribe({
      next: (res) => {
        this.deleteLoading = false;
        if (res.success) {
          if (wid) {
            this.loadWorkerSessions(wid, () => {
              if (this.sessionsForWorker.length === 0) {
                void this.router.navigate(['/report']);
              } else {
                void this.router.navigate(['/report', this.sessionsForWorker[0].id]);
              }
            });
          } else {
            void this.router.navigate(['/report']);
          }
        } else {
          window.alert(res.error ?? 'מחיקה נכשלה');
        }
      },
      error: () => {
        this.deleteLoading = false;
        window.alert('שגיאת רשת');
      },
    });
  }

  fetchReport(): void {
    const adminToken = this.adminAuth.getToken();
    if (!adminToken || !this.sessionId) {
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.summary = null;
    this.api.getManagerReportSummary(this.sessionId, adminToken).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.summary = res.data;
          this.selectedWorkerId = res.data.worker.id;
          this.loadWorkerSessions(res.data.worker.id);
        } else if (res.error === 'Unauthorized' || !res.success) {
          this.adminAuth.clearToken();
          this.loadError = 'ההתחברות פגה או אינה תקפה — התחברו שוב.';
        } else {
          this.loadError = res.error ?? 'לא ניתן לטעון את הדוח';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.adminAuth.clearToken();
          this.loadError = 'ההתחברות פגה — התחברו שוב.';
        } else {
          this.loadError = 'שגיאת רשת';
        }
      },
    });
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '0 דקות';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} שעות ו-${minutes} דקות`;
    }
    return `${minutes} דקות`;
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getCompletionPercentage(): number {
    if (!this.summary?.totalTasks) return 0;
    return Math.round((this.summary.tasksCompleted / this.summary.totalTasks) * 100);
  }

  issueCategoryLabel = issueCategoryHebrew;

  isRenderableImageSource(source: unknown): boolean {
    if (typeof source !== 'string') return false;
    const n = source.trim().toLowerCase();
    return (
      n.startsWith('data:image/') ||
      n.startsWith('http://') ||
      n.startsWith('https://') ||
      n.startsWith('/')
    );
  }

  openImageLightbox(src: string): void {
    this.selectedIssueImage = src;
  }

  closeImageLightbox(): void {
    this.selectedIssueImage = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeImageLightbox();
  }
}
