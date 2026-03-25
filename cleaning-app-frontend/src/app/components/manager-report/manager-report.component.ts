import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { WorkSummary } from '../../models/types';
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

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private adminAuth: AdminAuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.adminAuth.isLoggedIn();
  }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    if (this.sessionId && this.adminAuth.isLoggedIn()) {
      this.fetchReport();
    }
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
          this.fetchReport();
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
