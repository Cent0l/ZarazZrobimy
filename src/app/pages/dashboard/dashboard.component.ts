import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryComponent } from '../inventory/inventory.component';
import { HistoryComponent } from '../history/history.component';
import { ReportsComponent } from '../reports/reports.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InventoryComponent,
    HistoryComponent,
    ReportsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  activeComponent: string = 'inventory';

  logout() {
    window.location.reload(); // Tymczasowe rozwiązanie do wylogowania
  }
}
