import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

interface InventoryItem {
  id: string;
  category_id: number;
  description: string;
  serial_number: number;
  brand: string;
  model: string;
  condition: string;
  bought_for: number;
  asking_price: number;
  reported_stolen: boolean;
  sold_by: string;
  sales_data: string;
}

interface SaleData {
  finalPrice: number;
  soldBy: string;
  saleDate: string;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class InventoryComponent implements OnInit, AfterViewInit {
  inventoryData: InventoryItem[] = [];
  soldData: InventoryItem[] = [];
  apiUrl = 'http://localhost:3000';
  originalInventoryData: InventoryItem[] = [];

  // Sortowanie
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal
  selectedItem: InventoryItem | null = null;
  saleModal: any;
  todayDate: string;
  saleData: SaleData = {
    finalPrice: 0,
    soldBy: '',
    saleDate: ''
  };

  constructor(private http: HttpClient) {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.fetchInventory();
  }

  ngAfterViewInit(): void {
    this.initTooltips();
    const modalElement = document.getElementById('saleModal');
    if (modalElement) {
      this.saleModal = new bootstrap.Modal(modalElement);
    }
  }

  private initTooltips(): void {
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, 500);
  }

  fetchInventory(): void {
    this.http.get<InventoryItem[]>(`${this.apiUrl}/items`).subscribe(data => {
      this.inventoryData = data;
      this.originalInventoryData = [...data];
      setTimeout(() => this.initTooltips(), 100);
    });

    this.http.get<InventoryItem[]>(`${this.apiUrl}/sold`).subscribe(data => {
      this.soldData = data;
    });
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.inventoryData.sort((a, b) => {
      if (column === 'bought_for' || column === 'asking_price') {
        return this.sortDirection === 'asc'
          ? (a[column] as number) - (b[column] as number)
          : (b[column] as number) - (a[column] as number);
      }
      else if (column === 'reported_stolen') {
        return this.sortDirection === 'asc'
          ? (a[column] === b[column] ? 0 : a[column] ? -1 : 1)
          : (a[column] === b[column] ? 0 : a[column] ? 1 : -1);
      }
      else {
        const valueA = String(a[column as keyof InventoryItem]).toLowerCase();
        const valueB = String(b[column as keyof InventoryItem]).toLowerCase();
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  }

  resetSort(): void {
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.inventoryData = [...this.originalInventoryData];
  }

  openSaleModal(item: InventoryItem): void {
    this.selectedItem = item;
    this.saleData = {
      finalPrice: item.asking_price,
      soldBy: '',
      saleDate: this.todayDate
    };

    if (this.saleModal) {
      this.saleModal.show();
    }
  }

  markAsSold(): void {
    if (!this.selectedItem) return;

    const soldItem = {
      ...this.selectedItem,
      asking_price: this.saleData.finalPrice,
      sold_by: this.saleData.soldBy,
      sales_data: this.saleData.saleDate
    };

    this.http.post(`${this.apiUrl}/sold`, soldItem).subscribe({
      next: () => {
        this.http.delete(`${this.apiUrl}/items/${this.selectedItem!.id}`).subscribe({
          next: () => {
            if (this.saleModal) {
              this.saleModal.hide();
            }
            this.fetchInventory();
          },
          error: (err) => {
            console.error('Error deleting item:', err);
            if (this.saleModal) {
              this.saleModal.hide();
            }
            this.fetchInventory();
          }
        });
      },
      error: (err) => {
        console.error('Error adding to sold:', err);
      }
    });
  }

  getConditionRating(condition: string): number {
    switch(condition?.toLowerCase()) {
      case 'nowy': return 5;
      case 'bardzo dobry': return 4;
      case 'dobry': return 3;
      case 'średni': return 2;
      case 'dostateczny': return 1;
      default: return 0;
    }
  }
}
