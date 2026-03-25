import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { WorkSummary, WorkSession } from '../../models/types';
import { issueCategoryHebrew } from '../../constants/issue-categories';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, OnChanges {
  @Input() refreshToken = 0;

  readonly issueCategoryLabel = issueCategoryHebrew;

  summary: WorkSummary | null = null;
  isLoading = false;
  recentSessions: WorkSession[] = [];
  sessionOptions: { id: string; label: string }[] = [];
  selectedSessionId: string | null = null;
  selectedIssueImage: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load fresh data every time component is opened
    this.loadRecentSessions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['refreshToken'] || changes['refreshToken'].firstChange) {
      return;
    }

    this.loadRecentSessions();
  }

  loadRecentSessions(): void {
    const worker = this.authService.getCurrentWorker();
    if (!worker) return;

    this.apiService.getWorkSessions(worker.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentSessions = [...response.data].reverse(); // All sessions, most recent first
          this.sessionOptions = this.recentSessions.map((session) => ({
            id: session.id,
            label: `${this.formatDate(session.startTime)} - ${session.apartmentId} דירה - ${this.formatTime(session.startTime)}`,
          }));

          // Load summary for most recent session
          if (this.recentSessions.length > 0) {
            this.loadSummary(this.recentSessions[0].id);
          } else {
            this.selectedSessionId = null;
            this.summary = null;
          }
        } else {
          this.recentSessions = [];
          this.sessionOptions = [];
          this.selectedSessionId = null;
          this.summary = null;
        }
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
      }
    });
  }

  loadSummary(sessionId: string): void {
    this.selectedSessionId = sessionId;
    this.isLoading = true;

    this.apiService.getSummary(sessionId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.summary = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.isLoading = false;
      }
    });
  }

  onSessionChange(sessionId: string): void {
    if (!sessionId || sessionId === this.selectedSessionId) {
      return;
    }

    this.loadSummary(sessionId);
  }

  trackBySessionId(_index: number, option: { id: string; label: string }): string {
    return option.id;
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
    return new Date(date).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getCompletionPercentage(): number {
    if (!this.summary || !this.summary.totalTasks) return 0;
    return Math.round((this.summary.tasksCompleted / this.summary.totalTasks) * 100);
  }

  /** דף מנהל: `/report/{sessionId}` — המנהל נכנס עם סיסמה. */
  get managerReportFullUrl(): string {
    if (!this.selectedSessionId) {
      return '';
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/report/${encodeURIComponent(this.selectedSessionId)}`;
  }

  copyManagerLink(): void {
    const url = this.managerReportFullUrl;
    if (!url) {
      return;
    }
    navigator.clipboard.writeText(url).then(
      () => window.alert('הקישור הועתק ללוח'),
      () => window.alert('לא ניתן להעתיק — נסו שוב או העתיקו ידנית מהדפדפן')
    );
  }

  shareManagerLinkWhatsApp(): void {
    const url = this.managerReportFullUrl;
    if (!url || !this.summary) {
      return;
    }
    const line = `דוח ניקיון — ${this.summary.worker.name}, ${this.summary.apartment.name}, ${this.formatDate(this.summary.startTime)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${line}\n${url}`)}`, '_blank');
  }

  isRenderableImageSource(source: unknown): boolean {
    if (typeof source !== 'string') {
      return false;
    }

    const normalized = source.trim().toLowerCase();
    return normalized.startsWith('data:image/') || normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('/');
  }

  getImageLabel(source: unknown, index: number): string {
    if (typeof source !== 'string') {
      return `תמונה ${index + 1}`;
    }

    const normalizedSource = source.trim();
    if (!normalizedSource) {
      return `תמונה ${index + 1}`;
    }

    if (normalizedSource.startsWith('data:image/')) {
      return `תמונה ${index + 1}`;
    }

    const parts = normalizedSource.split('/');
    return parts[parts.length - 1] || `תמונה ${index + 1}`;
  }

  openImageLightbox(source: unknown): void {
    if (!this.isRenderableImageSource(source) || typeof source !== 'string') {
      return;
    }

    this.selectedIssueImage = source;
  }

  closeImageLightbox(): void {
    this.selectedIssueImage = null;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeImageLightbox();
  }
}
