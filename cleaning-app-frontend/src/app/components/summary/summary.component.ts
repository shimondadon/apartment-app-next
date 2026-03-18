import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
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
export class SummaryComponent implements OnInit, OnDestroy {
  summary: WorkSummary | null = null;
  isLoading = false;
  recentSessions: WorkSession[] = [];
  selectedSessionId: string | null = null;
  private routerSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private workService: WorkService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecentSessions();
    
    // Reload data when navigating to this page
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url === '/summary') {
        this.loadRecentSessions();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  loadRecentSessions(): void {
    const worker = this.authService.getCurrentWorker();
    if (!worker) return;

    this.apiService.getWorkSessions(worker.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.recentSessions = response.data.slice(-5).reverse(); // Last 5 sessions
          
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

    message += `\n✅ *משימות*\n`;
    message += `הושלמו: ${this.summary.tasksCompleted} מתוך ${this.summary.totalTasks} (${this.getCompletionPercentage()}%)\n`;

    if (this.summary.inventoryUsed && this.summary.inventoryUsed.length > 0) {
      message += `\n📦 *מלאי שנוצל*\n`;
      this.summary.inventoryUsed.forEach(log => {
        log.items.forEach(item => {
          message += `• ${item.name}: ${item.quantity} ${item.unit}\n`;
        });
      });
    }

    if (this.summary.issuesReported && this.summary.issuesReported.length > 0) {
      message += `\n🚨 *תקלות*\n`;
      this.summary.issuesReported.forEach(issue => {
        message += `• ${issue.category}: ${issue.description}\n`;
      });
    } else {
      message += `\n🌟 *עבודה נקייה ללא תקלות!*\n`;
    }

    return message;
  }
}
