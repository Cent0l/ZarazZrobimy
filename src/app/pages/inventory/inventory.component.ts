import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InventoryComponent implements OnInit {
  inventoryData: InventoryItem[] = [];
  soldData: InventoryItem[] = [];
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchInventory();
  }

  fetchInventory(): void {
    this.http.get<InventoryItem[]>(`${this.apiUrl}/items`).subscribe(data => {
      this.inventoryData = data;
    });

    this.http.get<InventoryItem[]>(`${this.apiUrl}/sold`).subscribe(data => {
      this.soldData = data;
    });
  }

  markAsSold(item: InventoryItem): void {
    // 1. Dodaj przedmiot do "sold"
    this.http.post(`${this.apiUrl}/sold`, item).subscribe({
      next: () => {
        console.log('Przedmiot dodany do sold:', item);

        // 2. Usuń przedmiot z "items"
        this.http.delete(`${this.apiUrl}/items/${item.id}`).subscribe({
          next: () => {
            console.log('Przedmiot usunięty z items:', item.id);
            this.fetchInventory(); // Odśwież listę
          },
          error: (err) => {
            console.error('Błąd podczas usuwania przedmiotu:', err);
            // Mimo błędu, odśwież listę
            this.fetchInventory();
          }
        });
      },
      error: (err) => {
        console.error('Błąd podczas dodawania do sold:', err);
      }
    });
  }
}
