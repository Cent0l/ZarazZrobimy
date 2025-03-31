import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface InventoryItem {
  id?: string;
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
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent {
  apiUrl = 'http://localhost:3000';
  newItem: InventoryItem = {
    category_id: 1,
    description: '',
    serial_number: 0,
    brand: '',
    model: '',
    condition: 'Nowy',
    bought_for: 0,
    asking_price: 0,
    reported_stolen: false,
    sold_by: '',
    sales_data: ''
  };

  conditions = ['Nowy', 'Bardzo dobry', 'Dobry', 'Średni', 'Dostateczny'];
  categories = [
    { id: 1, name: 'Elektronika' },
    { id: 2, name: 'Biżuteria' },
    { id: 3, name: 'Narzędzia' }
    /// testowe kategorie - wiecej bedzie wyciaganych z bazy danych sql po jej implementacji
  ];

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    // Walidacja podstawowych pól
    if (!this.newItem.brand || !this.newItem.model || this.newItem.bought_for <= 0) {
      alert('Wypełnij wymagane pola poprawnie!');
      return;
    }

    // Automatyczne ustawienie ceny sprzedaży jeśli nie podano
    if (this.newItem.asking_price <= 0) {
      this.newItem.asking_price = this.newItem.bought_for * 1.3;
    }

    this.http.post<InventoryItem>(`${this.apiUrl}/items`, this.newItem).subscribe({
      next: (response) => {
        console.log('Dodano nowy przedmiot:', response);
        alert('Przedmiot został dodany pomyślnie!');
        this.router.navigate(['/inventory']); // Przekierowanie do listy
      },
      error: (err) => {
        console.error('Błąd podczas dodawania przedmiotu:', err);
        alert('Wystąpił błąd podczas dodawania przedmiotu');
      }
    });
  }
}
