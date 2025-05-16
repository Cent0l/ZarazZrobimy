import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryComponent } from '../inventory/inventory.component';
import { HistoryComponent } from '../history/history.component';
import { ReportsComponent } from '../reports/reports.component';
import { AddItemComponent } from '../add-item/add-item.component';
import { EmployeesComponent } from '../employees/employees.component';
import { CustomersComponent } from '../customers/customers.component';
import { PawnsComponent } from '../pawn/pawn.component';
import { CategoriesComponent } from '../categories/categories.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InventoryComponent,
    HistoryComponent,
    ReportsComponent,
    AddItemComponent,
    EmployeesComponent,
    CustomersComponent,
    PawnsComponent,
    CategoriesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  activeComponent: string = 'inventory';

  logout() {
    window.location.reload();
  }
}
