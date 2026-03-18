import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WorkService } from '../../services/work.service';
import { TranslationService } from '../../services/translation.service';
import { Worker } from '../../models/types';
import { WorkTrackingComponent } from '../work-tracking/work-tracking.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { IssuesComponent } from '../issues/issues.component';
import { SummaryComponent } from '../summary/summary.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    WorkTrackingComponent,
    InventoryComponent,
    IssuesComponent,
    SummaryComponent
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  currentWorker: Worker | null = null;
  activeTab = 'work';

  constructor(
    private authService: AuthService,
    private workService: WorkService,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.currentWorker$.subscribe(worker => {
      this.currentWorker = worker;
      if (worker) {
        this.workService.loadCurrentSession(worker.id);
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
}
