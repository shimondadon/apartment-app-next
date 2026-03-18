import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Apartment } from '../../models/types';

@Component({
  selector: 'app-apartment-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apartment-selection.component.html',
  styleUrls: ['./apartment-selection.component.css']
})
export class ApartmentSelectionComponent implements OnInit {
  @Output() apartmentSelected = new EventEmitter<number>();
  
  apartments: Apartment[] = [
    { id: 6, name: 'דירה 6', icon: '✨', badges: [
      { type: 'new', label: 'חדש' },
      { type: 'special', label: 'פנג שואי' }
    ]},
    { id: 7, name: 'דירה 7', icon: '🏡' },
    { id: 8, name: 'דירה 8', icon: '🌟' },
    { id: 9, name: 'דירה 9', icon: '🏠' },
    { id: 10, name: 'דירה 10', icon: '✨' },
    { id: 11, name: 'דירה 11', icon: '🏡' }
  ];
  
  selectedApartmentId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadApartments();
  }

  loadApartments(): void {
    this.apiService.getApartments().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.apartments = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading apartments:', error);
      }
    });
  }

  selectApartment(apartmentId: number): void {
    this.selectedApartmentId = apartmentId;
    this.apartmentSelected.emit(apartmentId);
  }
}
