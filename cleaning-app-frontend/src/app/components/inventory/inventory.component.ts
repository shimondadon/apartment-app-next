import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {
  inventoryLogs = [
    { task: 'ניקוי משטחים - מטבח', items: [{ name: 'ספריי ניקוי', quantity: 50, unit: 'מ"ל' }], time: '10:30' },
    { task: 'ניקוי אסלה', items: [{ name: 'אקונומיקה', quantity: 100, unit: 'מ"ל' }], time: '10:45' }
  ];

  getLowStockWarnings() {
    return [
      { product: 'ספריי ניקוי', current: '120 מ"ל', threshold: '200 מ"ל' },
      { product: 'אקונומיקה', current: '50 מ"ל', threshold: '100 מ"ל' }
    ];
  }
}
