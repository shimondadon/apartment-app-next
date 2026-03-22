import { Component, HostListener, OnInit } from '@angular/core';
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
export class SummaryComponent implements OnInit {
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
          }
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

  shareToWhatsApp(): void {
    if (!this.summary) return;

    const message = this.generateReportMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }

  generateReportMessage(): string {
    if (!this.summary) return '';

    let message = `📊 *דוח עבודת ניקיון*\n\n`;
    message += `👤 עובדת: ${this.summary.worker.name}\n`;
    message += `🏡 דירה: ${this.summary.apartment.name}\n`;
    message += `📅 תאריך: ${this.formatDate(this.summary.startTime)}\n`;
    message += `⏰ התחלה: ${this.formatTime(this.summary.startTime)}\n`;

    if (this.summary.endTime) {
      message += `⏱ סיום: ${this.formatTime(this.summary.endTime)}\n`;
    }

    if (this.summary.duration) {
      message += `⌛ משך: ${this.formatDuration(this.summary.duration)}\n`;
    }

    message += `\n✅ *משימות (${this.summary.tasksCompleted}/${this.summary.totalTasks})*\n\n`;

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
        const status = task.completed ? '✅' : '❌';
        message += `${status} ${task.text}\n`;
      });
      message += `\n`;
    });

    if (this.summary.inventoryUsed && this.summary.inventoryUsed.length > 0) {
      message += `📦 *מלאי שנוצל*\n`;
      this.summary.inventoryUsed.forEach(log => {
        log.items.forEach(item => {
          message += `• ${item.name}: ${item.quantity} ${item.unit}\n`;
        });
      });
      message += `\n`;
    }

    if (this.summary.issuesReported && this.summary.issuesReported.length > 0) {
      message += `🚨 *תקלות*\n`;
      this.summary.issuesReported.forEach(issue => {
        message += `• ${issue.category}: ${issue.description}\n`;
      });
    } else {
      message += `🌟 *עבודה נקייה ללא תקלות!*\n`;
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
