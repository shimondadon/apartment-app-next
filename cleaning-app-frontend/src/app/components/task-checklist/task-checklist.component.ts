import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WorkService } from '../../services/work.service';
import { TaskCategory, Task, InventoryItem } from '../../models/types';

@Component({
  selector: 'app-task-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-checklist.component.html',
  styleUrls: ['./task-checklist.component.css']
})
export class TaskChecklistComponent implements OnInit {
  taskCategories: TaskCategory[] = [];
  expandedTasks: Set<string> = new Set();

  constructor(
    private apiService: ApiService,
    private workService: WorkService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.apiService.getTasks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.taskCategories = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        // Fallback to default tasks
        this.taskCategories = this.getDefaultTasks();
      }
    });
  }

  getDefaultTasks(): TaskCategory[] {
    return [
      {
        name: '🧹 סלון',
        tasks: [
          { id: 'living-1', text: 'שאיבת אבק', hasInventory: false },
          { id: 'living-2', text: 'ניקוי משטחים', hasInventory: true },
          { id: 'living-3', text: 'ארגון כריות', hasInventory: false }
        ]
      },
      {
        name: '🍳 מטבח',
        tasks: [
          { id: 'kitchen-1', text: 'ניקוי משטחים', hasInventory: true },
          { id: 'kitchen-2', text: 'שטיפת כלים', hasInventory: true },
          { id: 'kitchen-3', text: 'ניקוי כיריים', hasInventory: true },
          { id: 'kitchen-4', text: 'ריצפה', hasInventory: true }
        ]
      },
      {
        name: '🛁 אמבטיה',
        tasks: [
          { id: 'bath-1', text: 'ניקוי אסלה', hasInventory: true },
          { id: 'bath-2', text: 'ניקוי מקלחת', hasInventory: true },
          { id: 'bath-3', text: 'ניקוי כיור', hasInventory: true },
          { id: 'bath-4', text: 'ריצפה', hasInventory: true }
        ]
      },
      {
        name: '🛏️ חדר שינה',
        tasks: [
          { id: 'bed-1', text: 'החלפת מצעים', hasInventory: false },
          { id: 'bed-2', text: 'שאיבת אבק', hasInventory: false },
          { id: 'bed-3', text: 'ארגון ארונות', hasInventory: false }
        ]
      }
    ];
  }

  toggleTask(task: Task): void {
    const session = this.workService.getCurrentSession();
    if (!session) return;

    task.completed = !task.completed;

    if (task.completed && task.hasInventory) {
      this.expandTask(task.id);
    } else {
      this.completeTask(task);
    }
  }

  expandTask(taskId: string): void {
    if (this.expandedTasks.has(taskId)) {
      this.expandedTasks.delete(taskId);
    } else {
      this.expandedTasks.add(taskId);
    }
  }

  isTaskExpanded(taskId: string): boolean {
    return this.expandedTasks.has(taskId);
  }

  completeTask(task: Task): void {
    const session = this.workService.getCurrentSession();
    if (!session) return;

    this.apiService.completeTask({
      workSessionId: session.id,
      taskId: task.id,
      inventory: task.inventory
    }).subscribe({
      next: (response) => {
        if (!response.success) {
          console.error('Error completing task:', response.message);
        }
      },
      error: (error) => {
        console.error('Error completing task:', error);
      }
    });
  }

  saveInventory(task: Task): void {
    this.expandTask(task.id);
    this.completeTask(task);
  }

  getTotalTasks(): number {
    return this.taskCategories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  }

  getCompletedTasks(): number {
    return this.taskCategories.reduce(
      (sum, cat) => sum + cat.tasks.filter(t => t.completed).length,
      0
    );
  }

  getProgress(): number {
    const total = this.getTotalTasks();
    return total > 0 ? Math.round((this.getCompletedTasks() / total) * 100) : 0;
  }
}
