import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

declare var bootstrap: any;

interface SoldItem {
  id: number;
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

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styles: [`
    .profit { color: green; }
    .loss { color: red; }
    .no-change { color: gray; }
  `]
})
export class HistoryComponent implements OnInit, AfterViewInit {
  soldItems: SoldItem[] = [];
  originalSoldItems: SoldItem[] = [];
  loading = true;
  error = '';

  // Sortowanie
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Podsumowanie
  totalBoughtFor = 0;
  totalAskingPrice = 0;
  totalMargin = 0;
  totalMarginPercentage = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSoldItems();
  }

  ngAfterViewInit(): void {
    this.initTooltips();
  }

  private initTooltips(): void {
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, 500);
  }

  fetchSoldItems(): void {
    this.loading = true;
    this.http.get<SoldItem[]>('http://localhost:3000/sold').subscribe({
      next: (data) => {
        this.soldItems = data;
        this.originalSoldItems = [...data];
        this.calculateTotals();
        this.loading = false;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        this.error = 'Nie udało się pobrać danych sprzedanych przedmiotów. Spróbuj ponownie później.';
        console.error('Błąd podczas pobierania sprzedanych przedmiotów:', err);
        this.loading = false;
      }
    });
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.soldItems.sort((a, b) => {
      if (column === 'margin') {
        const marginA = this.calculateMargin(a);
        const marginB = this.calculateMargin(b);
        return this.sortDirection === 'asc'
          ? marginA - marginB
          : marginB - marginA;
      }
      else if (column === 'bought_for' || column === 'asking_price') {
        return this.sortDirection === 'asc'
          ? (a[column] as number) - (b[column] as number)
          : (b[column] as number) - (a[column] as number);
      }
      else if (column === 'sales_data') {
        const dateA = new Date(a.sales_data);
        const dateB = new Date(b.sales_data);
        return this.sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      else {
        const valueA = String(a[column as keyof SoldItem]).toLowerCase();
        const valueB = String(b[column as keyof SoldItem]).toLowerCase();
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  }

  resetSort(): void {
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.soldItems = [...this.originalSoldItems];
  }

  calculateMargin(item: SoldItem): number {
    return item.asking_price - item.bought_for;
  }

  calculateMarginPercentage(item: SoldItem): number {
    if (item.bought_for === 0) return 0;
    return Number(((item.asking_price - item.bought_for) / item.bought_for * 100).toFixed(2));
  }

  getMarginClass(item: SoldItem): string {
    const margin = this.calculateMargin(item);
    if (margin > 0) return 'profit';
    if (margin < 0) return 'loss';
    return 'no-change';
  }

  calculateTotals(): void {
    this.totalBoughtFor = this.soldItems.reduce((sum, item) => sum + item.bought_for, 0);
    this.totalAskingPrice = this.soldItems.reduce((sum, item) => sum + item.asking_price, 0);
    this.totalMargin = this.totalAskingPrice - this.totalBoughtFor;

    if (this.totalBoughtFor > 0) {
      this.totalMarginPercentage = Number(((this.totalMargin / this.totalBoughtFor) * 100).toFixed(2));
    } else {
      this.totalMarginPercentage = 0;
    }
  }

  getTotalMarginClass(): string {
    if (this.totalMargin > 0) return 'profit';
    if (this.totalMargin < 0) return 'loss';
    return 'no-change';
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
