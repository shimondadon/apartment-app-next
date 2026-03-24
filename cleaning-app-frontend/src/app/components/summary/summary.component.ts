import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WorkService } from '../../services/work.service';
import { AuthService } from '../../services/auth.service';
import { WorkSummary, WorkSession } from '../../models/types';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, OnChanges {
  @Input() refreshToken = 0;

  summary: WorkSummary | null = null;
  isLoading = false;
  recentSessions: WorkSession[] = [];
  sessionOptions: { id: string; label: string }[] = [];
  selectedSessionId: string | null = null;
  selectedIssueImage: string | null = null;

  constructor(
    private apiService: ApiService,
    private workService: WorkService,
    private authService: AuthService,
    private router: Router
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

  /** ASCII status markers — emoji break in wa.me URLs / some WhatsApp clients after truncation. */
  private static readonly TASK_OK = '[V]';
  private static readonly TASK_NO = '[X]';

  /** Encoded URL length above this risks truncation mid-UTF-8 → replacement chars (). */
  private static readonly MAX_WA_ME_TEXT_ENCODED = 3200;

  private issueCategoryHebrew(category: string): string {
    const map: Record<string, string> = {
      maintenance: 'תחזוקה',
      cleaning: 'ניקיון',
      supplies: 'ציוד',
      safety: 'בטיחות',
      other: 'אחר',
    };
    return map[category] ?? category;
  }

  private async dataUrlToFile(dataUrl: string, filename: string): Promise<File | null> {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (!blob.size) {
        return null;
      }
      const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'image/jpeg';
      return new File([blob], filename, { type });
    } catch {
      return null;
    }
  }

  private async collectIssueImageFiles(maxFiles = 8): Promise<File[]> {
    if (!this.summary?.issuesReported?.length) {
      return [];
    }

    const files: File[] = [];
    let n = 0;
    for (const issue of this.summary.issuesReported) {
      if (!issue.images?.length) {
        continue;
      }
      for (let i = 0; i < issue.images.length && files.length < maxFiles; i++) {
        const src = issue.images[i];
        if (typeof src !== 'string' || !src.startsWith('data:image/')) {
          continue;
        }
        const file = await this.dataUrlToFile(src, `issue-${++n}.jpg`);
        if (file) {
          files.push(file);
        }
      }
    }
    return files;
  }

  async shareToWhatsApp(): Promise<void> {
    if (!this.summary) {
      return;
    }

    const message = this.generateReportMessage();
    const imageFiles = await this.collectIssueImageFiles();

    const shareData: ShareData = {
      title: 'דוח עבודת ניקיון',
      text: message,
      ...(imageFiles.length > 0 ? { files: imageFiles } : {}),
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return;
        }
      }

      // Text-only share (e.g. desktop / no file support)
      const textOnly: ShareData = { title: shareData.title, text: message };
      if (navigator.canShare?.(textOnly)) {
        try {
          await navigator.share(textOnly);
          if (imageFiles.length > 0) {
            window.alert(
              'הטקסט נשלח. תמונות התקלה לא צורפו אוטומטית — הוסיפו אותן ידנית מהמסך או מהגלריה.'
            );
          }
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return;
          }
        }
      }
    }

    const encoded = encodeURIComponent(message);
    if (encoded.length <= SummaryComponent.MAX_WA_ME_TEXT_ENCODED) {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
      if (imageFiles.length > 0) {
        window.alert(
          'בקישור wa.me אי אפשר לצרף תמונות. הוסיפו תמונות מהאפליקציה ידנית אחרי שליחת ההודעה.'
        );
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      window.open('https://wa.me/', '_blank');
      let hint =
        'הדוח הועתק ללוח — הדביקו בשדה ההודעה בוואטסאפ (Ctrl+V או לחיצה ארוכה → הדבקה).';
      if (imageFiles.length > 0) {
        hint +=
          '\n\nתמונות: בוואטסאפ לחצו על סיכה והוסיפו מהמכשיר; או חזרו למסך הסיכום והוסיפו צילומי מסך.';
      }
      window.alert(hint);
    } catch {
      window.alert('לא ניתן להעתיק ללוח אוטומטית. העתיקו את הדוח מהמסך או השתמשו במכשיר עם שיתוף מערכת.');
    }
  }

  generateReportMessage(): string {
    if (!this.summary) return '';

    let message = `*דוח עבודת ניקיון*\n\n`;
    message += `עובדת: ${this.summary.worker.name}\n`;
    message += `דירה: ${this.summary.apartment.name}\n`;
    message += `תאריך: ${this.formatDate(this.summary.startTime)}\n`;
    message += `התחלה: ${this.formatTime(this.summary.startTime)}\n`;

    if (this.summary.endTime) {
      message += `סיום: ${this.formatTime(this.summary.endTime)}\n`;
    }

    if (this.summary.duration) {
      message += `משך: ${this.formatDuration(this.summary.duration)}\n`;
    }

    message += `\n*משימות (${this.summary.tasksCompleted}/${this.summary.totalTasks})*\n`;
    message += `${SummaryComponent.TASK_OK} = בוצע, ${SummaryComponent.TASK_NO} = לא בוצע\n\n`;

    // Group tasks by category
    const tasksByCategory = new Map<string, typeof this.summary.tasks>();
    this.summary.tasks.forEach(task => {
      if (!tasksByCategory.has(task.categoryName)) {
        tasksByCategory.set(task.categoryName, []);
      }
      tasksByCategory.get(task.categoryName)?.push(task);
    });

    // List all tasks with status
    tasksByCategory.forEach((tasks, categoryName) => {
      message += `*${categoryName}*\n`;
      tasks.forEach(task => {
        const status = task.completed ? SummaryComponent.TASK_OK : SummaryComponent.TASK_NO;
        message += `${status} ${task.text}\n`;
      });
      message += `\n`;
    });

    if (this.summary.inventoryUsed && this.summary.inventoryUsed.length > 0) {
      message += `*מלאי שנוצל*\n`;
      this.summary.inventoryUsed.forEach(log => {
        log.items.forEach(item => {
          message += `- ${item.name}: ${item.quantity} ${item.unit}\n`;
        });
      });
      message += `\n`;
    }

    if (this.summary.issuesReported && this.summary.issuesReported.length > 0) {
      message += `*תקלות*\n`;
      this.summary.issuesReported.forEach(issue => {
        const cat = this.issueCategoryHebrew(issue.category);
        message += `- ${cat}: ${issue.description}`;
        if (issue.images && issue.images.length > 0) {
          message += ` (צורפו ${issue.images.length} תמונות באפליקציה)`;
        }
        message += `\n`;
      });
    } else {
      message += `*עבודה נקייה ללא תקלות*\n`;
    }

    return message;
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
