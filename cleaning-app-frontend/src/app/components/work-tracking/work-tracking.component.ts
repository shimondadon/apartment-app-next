import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkService } from '../../services/work.service';
import { AuthService } from '../../services/auth.service';
import { ApartmentSelectionComponent } from '../apartment-selection/apartment-selection.component';
import { TaskChecklistComponent } from '../task-checklist/task-checklist.component';
import { WorkSession } from '../../models/types';

@Component({
  selector: 'app-work-tracking',
  standalone: true,
  imports: [CommonModule, ApartmentSelectionComponent, TaskChecklistComponent],
  templateUrl: './work-tracking.component.html',
  styleUrls: ['./work-tracking.component.css']
})
export class WorkTrackingComponent implements OnInit {
  currentSession: WorkSession | null = null;
  selectedApartmentId: number | null = null;
  timer = 0;
  isWorking = false;

  constructor(
    private workService: WorkService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.workService.currentSession$.subscribe(session => {
      this.currentSession = session;
      this.isWorking = !!session;
      if (session) {
        this.selectedApartmentId = session.apartmentId;
      }
    });

    this.workService.timer$.subscribe(seconds => {
      this.timer = seconds;
    });
  }

  onApartmentSelected(apartmentId: number): void {
    this.selectedApartmentId = apartmentId;
  }

  async startWork(): Promise<void> {
    if (!this.selectedApartmentId) {
      alert('נא לבחור דירה');
      return;
    }

    const worker = this.authService.getCurrentWorker();
    if (!worker) {
      alert('שגיאת הזדהות');
      return;
    }

    try {
      const position = await this.workService.requestLocation();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      this.workService.startWork({
        workerId: worker.id,
        apartmentId: this.selectedApartmentId,
        location
      }).subscribe({
        next: (response) => {
          if (response.success) {
            // Session started successfully
          } else {
            alert(response.message || 'שגיאה בהתחלת עבודה');
          }
        },
        error: (error) => {
          alert('שגיאה בהתחלת עבודה: ' + (error.error?.message || error.message));
        }
      });
    } catch (error) {
      // Location not available, start without it
      this.workService.startWork({
        workerId: worker.id,
        apartmentId: this.selectedApartmentId
      }).subscribe({
        next: (response) => {
          if (!response.success) {
            alert(response.message || 'שגיאה בהתחלת עבודה');
          }
        },
        error: (error) => {
          alert('שגיאה בהתחלת עבודה: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  endWork(): void {
    if (!this.currentSession) return;

    if (confirm('האם את בטוחה שסיימת לעבוד?')) {
      this.workService.endWork(this.currentSession.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Work ended successfully
          } else {
            alert(response.message || 'שגיאה בסיום עבודה');
          }
        },
        error: (error) => {
          alert('שגיאה בסיום עבודה: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  getFormattedTime(): string {
    return this.workService.formatTime(this.timer);
  }

  getStatusText(): string {
    if (!this.isWorking) return 'טרם התחלתי לעבוד';
    return 'עובדת כעת';
  }

  getStatusClass(): string {
    return this.isWorking ? 'status-working' : 'status-idle';
  }
}
