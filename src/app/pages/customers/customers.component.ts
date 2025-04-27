import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// interfejs kliencii
interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  registrationDate: string;
  doNotServe: boolean;
}
interface AuthResponse {
  token: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;

  // zmienne dla logowania
  showLoginModal: boolean = false;
  loginInProgress: boolean = false;
  loginCredentials = {
    username: '',
    password: ''
  };
  authToken: string | null = null;

  // zmienne dla flagi (doNotServe)
  showFlagModal: boolean = false;
  customerToFlag: Customer | null = null;
  flagAction: string = '';
  flagInProgress: boolean = false;

  // zmienne do sortowania
  sortColumn: keyof Customer | 'status' = 'id';
  sortDirection: 'asc' | 'desc' = 'desc'; // domyslne sorotwanie

  // zmienne dla dodawania klientów i usuwania
  showAddModal: boolean = false;
  addInProgress: boolean = false;
  newCustomer: Customer = this.getEmptyCustomer();
  showDeleteModal: boolean = false;
  customerToDelete: Customer | null = null;
  deleteInProgress: boolean = false;

  constructor(private http: HttpClient) {}

  // odczytanie tokena i przekazanie go do modala
  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchCustomers();
    } else {
      this.showLoginModal = true;
      this.isLoading = false;
    }
  }

  // pobierz pustego klienta
  getEmptyCustomer(): Customer {
    return {
      firstName: '',
      lastName: '',
      idType: 'id_card',
      idNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      doNotServe: false
    };
  }

  // otwieranie i zamykanie modala dodawanie klientow
  openAddModal(): void {
    this.newCustomer = this.getEmptyCustomer();
    this.showAddModal = true;
  }
  closeAddModal(): void {
    this.showAddModal = false;
    this.error = null;
  }
  // metoda do dodawania nowego klienta
  addCustomer(): void {
    this.addInProgress = true;
    this.error = null;

    this.http.post<Customer>('/api/customers', this.newCustomer, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (addedCustomer) => {
        this.customers.unshift(addedCustomer); // dodanie na początek listy
        this.sortData(this.sortColumn); // ponowne sortowanie
        this.showAddModal = false;
        this.addInProgress = false;
        this.successMessage = `Klient ${addedCustomer.firstName} ${addedCustomer.lastName} został dodany pomyślnie`;
        // ukryj wiadomość po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd dodawania klienta:', err);
        this.error = `Nie udało się dodać klienta: ${err.message || 'Nieznany błąd'}`;
        this.addInProgress = false;
      }
    });
  }
  // metoda do otwierania i zamkykania modala usuwania klienta
  openDeleteModal(customer: Customer): void {
    this.customerToDelete = customer;
    this.showDeleteModal = true;
  }
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.customerToDelete = null;
    this.error = null;
  }
  // metoda do usuwania klienta
  deleteCustomer(): void {
    if (!this.customerToDelete || !this.customerToDelete.id) return;

    this.deleteInProgress = true;
    this.error = null;

    this.http.delete(`/api/customers/${this.customerToDelete.id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        const index = this.customers.findIndex(c => c.id === this.customerToDelete?.id);
        if (index !== -1) {
          this.customers.splice(index, 1);
        }
        this.showDeleteModal = false;
        this.deleteInProgress = false;
        this.successMessage = `Klient ${this.customerToDelete?.firstName} ${this.customerToDelete?.lastName} został usunięty`;
        this.customerToDelete = null;
        // ukryj wiadomość po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd usuwania klienta:', err);
        this.error = `Nie udało się usunąć klienta: ${err.message || 'Nieznany błąd'}`;
        this.deleteInProgress = false;
      }
    });
  }
  // meotoda sortujaca
  sortData(column: keyof Customer | 'status'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.customers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (column === 'status') {
        aValue = a.doNotServe ? 1 : 0;
        bValue = b.doNotServe ? 1 : 0;
      } else {
        aValue = a[column as keyof Customer] ?? '';
        bValue = b[column as keyof Customer] ?? '';
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // pobieranie listy klientow domyślnym sortowaniem (id od 1 do n)
  fetchCustomers(): void {
    this.http.get<Customer[]>('/api/customers', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.customers = data;
        this.sortData('id');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd pobierania klientów:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        } else {
          this.error = `Błąd podczas pobierania danych klientów: ${err.message}`;
        }
        this.isLoading = false;
      }
    });
  }


  login(): void {
    this.loginInProgress = true;
    this.error = null;

    this.http.post<AuthResponse>('/api/auth/login', this.loginCredentials)
      .subscribe({
        next: (response) => {
          this.authToken = response.token;
          localStorage.setItem('authToken', this.authToken);
          this.showLoginModal = false;
          this.loginInProgress = false;
          this.fetchCustomers();
        },
        error: (err) => {
          console.error('Błąd logowania:', err);
          this.error = 'Błąd logowania. Sprawdź dane logowania.';
          this.loginInProgress = false;
        }
      });
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }
 // otwieranie modala do doNotServe
  openFlagModal(customer: Customer): void {
    this.customerToFlag = customer;
    this.flagAction = customer.doNotServe ? 'odblokuj' : 'zablokuj';
    this.showFlagModal = true;
  }

  confirmFlagChange(): void {
    if (!this.customerToFlag) return;

    this.flagInProgress = true;
    const newFlagValue = !this.customerToFlag.doNotServe;

    this.http.patch<Customer>(`/api/customers/${this.customerToFlag.id}/flag`,
      { doNotServe: newFlagValue },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (updatedCustomer) => {
        const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
        if (index !== -1) {
          this.customers[index].doNotServe = updatedCustomer.doNotServe;
        }
        this.showFlagModal = false;
        this.flagInProgress = false;
        this.customerToFlag = null;
      },
      error: (err) => {
        console.error('Błąd podczas aktualizacji flagi:', err);
        this.error = 'Nie udało się zaktualizować statusu klienta.';
        this.flagInProgress = false;
      }
    });
  }

  closeFlagModal(): void {
    this.showFlagModal = false;
    this.customerToFlag = null;
    this.flagInProgress = false;
  }
  // sformatowane wyswietlanie doNotServe i ich konwersja z bool na string (Nie obsluguj, OK)
  getDoNotServeBadgeClass(doNotServe: boolean): string {
    return doNotServe ? 'bg-danger' : 'bg-success';
  }
  getDoNotServeDisplay(doNotServe: boolean): string {
    return doNotServe ? 'Nie obsługuj' : 'OK';
  }
  // konwersja danych z bazy na polskie
  getIdTypeDisplay(idType: string): string {
    const types: {[key: string]: string} = {
      'id_card': 'Dowód osobisty',
      'passport': 'Paszport',
      'driver_license': 'Prawo jazdy',
      'other': 'Inny'
    };
    return types[idType] || idType;
  }
}
