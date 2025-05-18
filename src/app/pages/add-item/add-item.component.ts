import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  idType: 'passport' | 'driver_license' | 'id_card' | 'other';
  idNumber: string;
  doNotServe: boolean;
}

interface Category {
  id: number;
  categoryName: string;
  description: string;
  parentCategoryId: number | null;
  subcategories?: Category[];
}

interface PurchaseItem {
  categoryId: number;
  name: string;
  description: string;
  serialNumber: string;
  brand: string;
  model: string;
  condition: string;
  boughtFor: number;
  askingPrice: number;
}

interface PurchaseTransaction {
  customerId?: number;
  newCustomer?: Customer;
  items: PurchaseItem[];
  notes: string;
}

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {
  // Używamy relatywnego URL zamiast pełnego adresu z portem
  apiUrl = '/api';

  // Token autoryzacji
  authToken: string | null = null;

  // Lista klientów
  customers: Customer[] = [];
  isLoadingCustomers = false;
  customerLoadError: string | null = null;

  // Lista kategorii
  categories: Category[] = [];
  isLoadingCategories = false;
  categoriesLoadError: string | null = null;

  // For existing customer selection
  useExistingCustomer = false;
  customerId: number | null = null;

  // Transaction data
  transaction: PurchaseTransaction = {
    items: [{
      categoryId: 1,
      name: '',
      description: '',
      serialNumber: '',
      brand: '',
      model: '',
      condition: 'Nowy',
      boughtFor: 0,
      askingPrice: 0
    }],
    notes: ''
  };

  // New customer data
  newCustomer: Customer = {
    id: 0,
    firstName: '',
    lastName: '',
    idType: 'id_card',
    idNumber: '',
    doNotServe: false
  };

  // Form options
  conditions = ['Nowy', 'Bardzo dobry', 'Dobry', 'Średni', 'Dostateczny'];

  idTypes = [
    { value: 'passport', label: 'Paszport' },
    { value: 'driver_license', label: 'Prawo jazdy' },
    { value: 'id_card', label: 'Dowód osobisty' },
    { value: 'other', label: 'Inny' }
  ];

  constructor(private http: HttpClient, private router: Router) {
    // Pobieramy token z localStorage
    this.authToken = localStorage.getItem('authToken');
  }

  ngOnInit(): void {
    // Pobieramy listę klientów na starcie komponentu
    this.loadCustomers();
    // Pobieramy listę kategorii
    this.loadCategories();
  }

  // Przygotowanie nagłówków z tokenem uwierzytelniającym
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  // Pobieranie listy klientów z API
  loadCustomers(): void {
    if (!this.authToken) {
      return;
    }

    this.isLoadingCustomers = true;
    this.customerLoadError = null;

    this.http.get<Customer[]>(`${this.apiUrl}/customers`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoadingCustomers = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania listy klientów:', err);
        this.customerLoadError = 'Nie udało się pobrać listy klientów. Spróbuj ponownie.';
        this.isLoadingCustomers = false;

        // Obsługa błędu autoryzacji
        if (err.status === 401) {
          alert('Sesja wygasła. Proszę zalogować się ponownie.');
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Pobieranie listy kategorii z API
  loadCategories(): void {
    if (!this.authToken) {
      return;
    }

    this.isLoadingCategories = true;
    this.categoriesLoadError = null;

    this.http.get<Category[]>(`${this.apiUrl}/categories`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania listy kategorii:', err);
        this.categoriesLoadError = 'Nie udało się pobrać listy kategorii. Spróbuj ponownie.';
        this.isLoadingCategories = false;

        // Obsługa błędu autoryzacji
        if (err.status === 401) {
          alert('Sesja wygasła. Proszę zalogować się ponownie.');
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Metoda to get category path - dla lepszej czytelności w dropdownie
  getCategoryPath(categoryId: number): string {
    const paths: string[] = [];
    let currentCategory = this.categories.find(c => c.id === categoryId);

    while (currentCategory) {
      paths.unshift(currentCategory.categoryName);

      if (currentCategory.parentCategoryId) {
        currentCategory = this.categories.find(c => c.id === currentCategory?.parentCategoryId);
      } else {
        currentCategory = undefined;
      }
    }

    return paths.join(' / ');
  }

  addItem(): void {
    this.transaction.items.push({
      categoryId: 1,
      name: '',
      description: '',
      serialNumber: '',
      brand: '',
      model: '',
      condition: 'Nowy',
      boughtFor: 0,
      askingPrice: 0
    });
  }

  removeItem(index: number): void {
    if (this.transaction.items.length > 1) {
      this.transaction.items.splice(index, 1);
    }
  }

  // Metoda sprawdzająca, czy wybrany klient ma flagę doNotServe
  isCustomerBlocked(): boolean {
    if (this.useExistingCustomer && this.customerId) {
      const selectedCustomer = this.customers.find(c => c.id === this.customerId);
      return selectedCustomer ? selectedCustomer.doNotServe : false;
    }
    return false;
  }

  onSubmit(): void {
    // Basic validation
    if (!this.validateForm()) {
      return;
    }

    // Create final transaction object
    const purchaseTransaction: PurchaseTransaction = {
      items: this.transaction.items.map(item => ({
        ...item,
        // Set asking price automatically if not provided
        askingPrice: item.askingPrice || item.boughtFor * 1.3
      })),
      notes: this.transaction.notes
    };

    // Add customer data
    if (this.useExistingCustomer && this.customerId) {
      purchaseTransaction.customerId = this.customerId;
    } else {
      purchaseTransaction.newCustomer = this.newCustomer;
    }

    // Jeśli brak tokenu, pokazujemy komunikat
    if (!this.authToken) {
      alert('Musisz być zalogowany, aby dodać przedmiot.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Wysyłam dane:', purchaseTransaction);

    // Submit to API with authorization header
    this.http.post(`${this.apiUrl}/transactions/purchase`, purchaseTransaction, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Przedmiot dodany:', response);
        alert('Przedmiot został dodany pomyślnie!');
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error('Błąd podczas dodawania przedmiotu:', err);

        // Obsługa błędu autoryzacji
        if (err.status === 401) {
          alert('Sesja wygasła. Proszę zalogować się ponownie.');
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        } else {
          alert(`Wystąpił błąd podczas dodawania przedmiotu: ${err.message || 'Nieznany błąd'}`);
        }
      }
    });
  }

  private validateForm(): boolean {
    // Validate customer information
    if (!this.useExistingCustomer) {
      if (!this.newCustomer.firstName || !this.newCustomer.lastName || !this.newCustomer.idNumber) {
        alert('Wypełnij dane klienta poprawnie!');
        return false;
      }

      // Sprawdzanie flagi doNotServe dla nowego klienta
      if (this.newCustomer.doNotServe) {
        alert('Uwaga: Ten klient został oznaczony jako osoba, od której nie przyjmujemy przedmiotów!');
        return false;
      }
    } else if (!this.customerId) {
      alert('Wybierz istniejącego klienta!');
      return false;
    } else {
      // Sprawdzanie flagi doNotServe dla istniejącego klienta
      if (this.isCustomerBlocked()) {
        alert('Uwaga: Ten klient jest na liście osób, od których nie przyjmujemy przedmiotów!');
        return false;
      }
    }

    // Validate items
    for (const item of this.transaction.items) {
      if (!item.brand || !item.model || item.boughtFor <= 0) {
        alert('Wypełnij wszystkie wymagane pola przedmiotów!');
        return false;
      }
    }

    return true;
  }
}
