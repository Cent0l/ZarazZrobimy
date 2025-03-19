import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
}
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {
  soldItems: SoldItem[] = [];
  loading = true;
  error = '';

  // Zmienne dla podsumowania
  totalBoughtFor = 0;
  totalAskingPrice = 0;
  totalMargin = 0;
  totalMarginPercentage = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSoldItems();
  }

  fetchSoldItems(): void {
    this.loading = true;
    this.http.get<SoldItem[]>('http://localhost:3000/sold').subscribe({
      next: (data) => {
        this.soldItems = data;
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Nie udało się pobrać danych sprzedanych przedmiotów. Spróbuj ponownie później.';
        console.error('Błąd podczas pobierania sprzedanych przedmiotów:', err);
        this.loading = false;
      }
    });
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
}
