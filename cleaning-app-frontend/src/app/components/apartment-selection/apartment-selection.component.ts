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

  /** מתמלא מ־GET /api/apartments — מקור האמת ב־backend: lib/catalog.ts */
  apartments: Apartment[] = [];
  loadingApartments = true;

  selectedApartmentId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadApartments();
  }

  loadApartments(): void {
    this.loadingApartments = true;
    this.apiService.getApartments().subscribe({
      next: (response) => {
        this.loadingApartments = false;
        if (response.success && response.data) {
          this.apartments = response.data;
        }
      },
      error: (error) => {
        this.loadingApartments = false;
        console.error('Error loading apartments:', error);
      },
    });
  }

  selectApartment(apartmentId: number): void {
    this.selectedApartmentId = apartmentId;
    this.apartmentSelected.emit(apartmentId);
  }
}
