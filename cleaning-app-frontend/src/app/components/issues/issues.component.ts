import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WorkService } from '../../services/work.service';
import { IssueCategory } from '../../models/types';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent {
  issueCategory: IssueCategory = 'maintenance';
  issueDescription = '';
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];

  categories = [
    { value: 'maintenance', label: '🔧 תחזוקה' },
    { value: 'cleaning', label: '🧹 ניקיון' },
    { value: 'supplies', label: '📦 ציוד' },
    { value: 'safety', label: '⚠ בטיחות' },
    { value: 'other', label: '📝 אחר' }
  ];

  constructor(
    private apiService: ApiService,
    private workService: WorkService
  ) {}

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedImages.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  submitIssue(): void {
    const session = this.workService.getCurrentSession();
    if (!session) {
      alert('יש להתחיל עבודה לפני דיווח על תקלה');
      return;
    }

    if (!this.issueDescription.trim()) {
      alert('נא למלא תיאור');
      return;
    }

    const formData = new FormData();
    formData.append('workSessionId', session.id);
    formData.append('apartmentId', session.apartmentId.toString());
    formData.append('category', this.issueCategory);
    formData.append('description', this.issueDescription);

    this.selectedImages.forEach((image, index) => {
      formData.append('images', image);
    });

    this.apiService.reportIssue(formData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('התקלה דווחה בהצלחה ✓');
          this.resetForm();
        } else {
          alert(response.message || 'שגיאה בדיווח תקלה');
        }
      },
      error: (error) => {
        alert('שגיאה בדיווח תקלה: ' + (error.error?.message || error.message));
      }
    });
  }

  resetForm(): void {
    this.issueCategory = 'maintenance';
    this.issueDescription = '';
    this.selectedImages = [];
    this.imagePreviewUrls = [];
  }
}
