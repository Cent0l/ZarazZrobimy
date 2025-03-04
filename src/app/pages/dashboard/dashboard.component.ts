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
  template: `
    <div class="dashboard-container">
      <nav class="sidebar">
        <ul>
          <li
            (click)="activeComponent = 'inventory'"
            [class.active]="activeComponent === 'inventory'"
          >📦 Zarządzanie inwentarzem</li>
          <li
            (click)="activeComponent = 'history'"
            [class.active]="activeComponent === 'history'"
          >📜 Historia operacji</li>
          <li
            (click)="activeComponent = 'reports'"
            [class.active]="activeComponent === 'reports'"
          >📊 Raporty i statystyki</li>
        </ul>
        <button (click)="logout()">🚪 Wyloguj się</button>
      </nav>

      <div class="content">
        <app-inventory *ngIf="activeComponent === 'inventory'"></app-inventory>
        <app-history *ngIf="activeComponent === 'history'"></app-history>
        <app-reports *ngIf="activeComponent === 'reports'"></app-reports>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 250px;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .sidebar ul {
      list-style-type: none;
      padding: 0;
    }
    .sidebar li {
      padding: 10px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .sidebar li:hover {
      background-color: #e0e0e0;
    }
    .sidebar li.active {
      background-color: #007bff;
      color: white;
    }
    .content {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class DashboardComponent {
  activeComponent: string = 'inventory';

  logout() {
    window.location.reload(); // Tymczasowe rozwiązanie
  }
}
