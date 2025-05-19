import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

interface TransactionItem {
  id: number;
  itemId: number;
  itemName: string;
  description: string;
  price: number;  // This should be the purchase price
  brand: string;
  model: string;
  serialNumber: string;
  condition: string;
  categoryId: number;
  askingPrice: number;  // Original asking price
  soldPrice?: number;   // Add this to track the actual sale price
}

interface Transaction {
  id: number;
  customerId: number;
  customerName: string;
  employeeId: number;
  employeeName: string;
  transactionDate: string;
  transactionType: string;
  totalAmount: number;
  pawnDurationDays: number | null;
  interestRate: number | null;
  redemptionPrice: number | null;
  expiryDate: string | null;
  relatedTransactionId: number | null;
  notes: string;
  items: TransactionItem[];
}

interface AuthResponse {
  token: string;
}

interface SaleData {
  finalPrice: number;
  soldBy: string;
  saleDate: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
}

interface Category {
  id: number;
  categoryName: string;
  description: string;
  parentCategoryId: number | null;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class InventoryComponent implements OnInit, AfterViewInit {
  transactions: Transaction[] = [];
  originalTransactions: Transaction[] = [];
  employees: Employee[] = [];
  categories: Category[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Login
  showLoginModal: boolean = false;
  loginInProgress: boolean = false;
  loginCredentials = {
    username: '',
    password: ''
  };
  authToken: string | null = null;

  // Sale Modal
  showSaleModal: boolean = false;
  selectedItem: TransactionItem | null = null;
  selectedTransaction: Transaction | null = null;
  saleData: SaleData = {
    finalPrice: 0,
    soldBy: '',
    saleDate: new Date().toISOString().split('T')[0]
  };
  isProcessingSale: boolean = false;
  saleSuccess: boolean = false;
  saleError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchTransactions();
      this.fetchEmployees();
      this.fetchCategories();
    } else {
      this.showLoginModal = true;
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    this.initTooltips();
  }

  private initTooltips(): void {
    setTimeout(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      if (tooltipTriggerList.length > 0) {
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      }
    }, 500);
  }

  login(): void {
    this.loginInProgress = true;
    this.error = null;

    this.http.post<AuthResponse>('/api/auth/login', this.loginCredentials).subscribe({
      next: (response) => {
        this.authToken = response.token;
        localStorage.setItem('authToken', this.authToken);
        this.showLoginModal = false;
        this.loginInProgress = false;
        this.fetchTransactions();
        this.fetchEmployees();
        this.fetchCategories();
      },
      error: (err) => {
        console.error('Błąd logowania:', err);
        this.error = 'Błąd logowania. Sprawdź dane logowania.';
        this.loginInProgress = false;

        if (confirm('Czy chcesz przejść do testowego widoku transakcji?')) {
          this.showLoginModal = false;
          this.isLoading = true;
        }
      }
    });
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  fetchTransactions(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<Transaction[]>('/api/transactions/type/purchase', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.transactions = data;
        this.originalTransactions = JSON.parse(JSON.stringify(data)); // Deep copy
        this.isLoading = false;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        console.error('Błąd pobierania transakcji:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        } else {
          this.error = `Błąd podczas pobierania danych transakcji: ${err.message}`;
        }
        this.isLoading = false;
      }
    });
  }

  fetchEmployees(): void {
    this.http.get<Employee[]>('/api/employees', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        // Add a fullName property for display purposes
        this.employees = data.map(emp => ({
          ...emp,
          fullName: `${emp.firstName} ${emp.lastName}`
        }));
      },
      error: (err) => {
        console.error('Błąd pobierania pracowników:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        }
      }
    });
  }

  fetchCategories(): void {
    this.http.get<Category[]>('/api/categories', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.categories = data;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        console.error('Błąd pobierania kategorii:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        }
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.categoryName : 'Nieznana kategoria';
  }

  getCategoryDescription(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.description : '';
  }

  openSaleModal(item: TransactionItem): void {
    this.selectedItem = item;
    // Find the transaction that contains this item
    this.selectedTransaction = this.transactions.find(t =>
      t.items.some(i => i.id === item.id)
    ) || null;

    this.saleData = {
      finalPrice: item.askingPrice, // Use asking price as starting point
      soldBy: '',
      saleDate: new Date().toISOString().split('T')[0]
    };
    this.showSaleModal = true;
    this.saleSuccess = false;
    this.saleError = null;
    this.isProcessingSale = false;

    const modal = document.getElementById('saleModal');
    if (modal) {
      modal.classList.add('show');
      document.body.classList.add('modal-open');
    }
  }

  markAsSold(): void {
    if (!this.selectedItem || !this.selectedTransaction) {
      this.saleError = "Nie można znaleźć transakcji dla wybranego przedmiotu.";
      return;
    }

    this.isProcessingSale = true;
    this.saleError = null;

    // Verify token is valid before proceeding
    if (!this.authToken) {
      this.saleError = "Brak autoryzacji. Proszę zalogować się.";
      this.isProcessingSale = false;
      this.showLoginModal = true;
      return;
    }

    // Znajdź ID pracownika na podstawie jego pełnego imienia
    let employeeId: number | null = null;
    const employee = this.employees.find(e => e.fullName === this.saleData.soldBy);
    if (employee) {
      employeeId = employee.id;
    }

    // Notatki o sprzedaży
    const notesData = `Sprzedane przez: ${this.saleData.soldBy} w dniu ${this.saleData.saleDate}`;

    // Dane dla żądania zmiany typu transakcji
    const updateData = {
      newType: "sale",
      notes: notesData,
      finalPrice: this.saleData.finalPrice,
      employeeId: employeeId
    };

    // Wysłanie żądania do API
    this.http.patch(`/api/transactions/${this.selectedTransaction.id}/type`, updateData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Transakcja zaktualizowana:', response);
        this.handleSuccessfulSale();
      },
      error: (err) => {
        console.error('Błąd aktualizacji transakcji:', err);
        this.isProcessingSale = false;

        if (err.status === 401) {
          this.saleError = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        } else {
          this.saleError = 'Nie udało się przetworzyć sprzedaży. Spróbuj ponownie.';

          // For testing - simulate successful sale if needed
          if (confirm('Błąd API. Czy chcesz zasymulować udaną sprzedaż?')) {
            this.handleSuccessfulSale(true);
          }
        }
      }
    });
  }

  handleSuccessfulSale(isSimulation: boolean = false): void {
    // Show appropriate success message
    if (isSimulation) {
      console.warn('Symulacja: Przedmiot oznaczony jako sprzedany tylko w interfejsie użytkownika.');
    }

    // Update UI
    if (!isSimulation) {
      // Nie usuwamy transakcji z UI, po prostu aktualizujemy jej typ
      if (this.selectedTransaction && this.transactions) {
        // Znajdź transakcję w tablicy transactions
        const transactionIndex = this.transactions.findIndex(t => t.id === this.selectedTransaction!.id);
        if (transactionIndex >= 0) {
          // Zmień typ transakcji
          this.transactions[transactionIndex].transactionType = 'sale';
          // Zmień totalAmount na cenę sprzedaży
          this.transactions[transactionIndex].totalAmount = this.saleData.finalPrice;
        }
      }
    }

    this.isProcessingSale = false;
    this.saleSuccess = true;

    // Close modal after delay and refresh data
    setTimeout(() => {
      this.closeSaleModal();
      // Refresh transactions to ensure sync with backend
      if (!isSimulation) {
        this.fetchTransactions();
      }
    }, 1500);
  }

  closeSaleModal(): void {
    this.showSaleModal = false;
    this.selectedItem = null;
    this.selectedTransaction = null;

    const modal = document.getElementById('saleModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  }

  // Sorting function
  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Create a flat array of all items from all transactions for sorting
    let allItems: { item: TransactionItem, transaction: Transaction }[] = [];
    this.transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        allItems.push({ item, transaction });
      });
    });

    // Sort the items
    allItems.sort((a, b) => {
      const itemA = a.item;
      const itemB = b.item;
      const transactionA = a.transaction;
      const transactionB = b.transaction;

      let valueA: any;
      let valueB: any;

      // Handle special column cases
      if (column === 'transactionDate') {
        valueA = transactionA.transactionDate;
        valueB = transactionB.transactionDate;
      } else if (column === 'customerName') {
        valueA = transactionA.customerName;
        valueB = transactionB.customerName;
      } else if (column === 'employeeName') {
        valueA = transactionA.employeeName;
        valueB = transactionB.employeeName;
      } else if (column === 'condition') {
        // Use numeric value for condition sorting
        valueA = this.getConditionRating(itemA.condition);
        valueB = this.getConditionRating(itemB.condition);
      } else if (column === 'categoryId') {
        // For sorting by category, use category name
        valueA = this.getCategoryName(itemA.categoryId);
        valueB = this.getCategoryName(itemB.categoryId);
      } else {
        valueA = itemA[column as keyof TransactionItem];
        valueB = itemB[column as keyof TransactionItem];
      }

      // Handle different types
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return this.sortDirection === 'asc'
          ? (valueA === valueB ? 0 : valueA ? -1 : 1)
          : (valueA === valueB ? 0 : valueA ? 1 : -1);
      } else {
        const strA = String(valueA || '').toLowerCase();
        const strB = String(valueB || '').toLowerCase();
        return this.sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });

    // Rebuild transactions from sorted items
    this.rebuildTransactionsFromSortedItems(allItems);
  }

  rebuildTransactionsFromSortedItems(sortedItems: { item: TransactionItem, transaction: Transaction }[]): void {
    // Create a new array of transactions
    const newTransactions: Transaction[] = [];

    sortedItems.forEach(({ item, transaction }) => {
      // Find if this transaction is already in our new array
      let existingTransaction = newTransactions.find(t => t.id === transaction.id);

      if (!existingTransaction) {
        // If not, create a new transaction with just this item
        existingTransaction = {
          ...transaction,
          items: [item]
        };
        newTransactions.push(existingTransaction);
      } else {
        // If it exists, just add this item if it's not already there
        if (!existingTransaction.items.some(i => i.id === item.id)) {
          existingTransaction.items.push(item);
        }
      }
    });

    this.transactions = newTransactions;
    setTimeout(() => this.initTooltips(), 100);
  }

  resetSort(): void {
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.transactions = JSON.parse(JSON.stringify(this.originalTransactions));
    setTimeout(() => this.initTooltips(), 100);
  }

  // Condition rating function
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

  // Function to check if the token is expired/invalid
  isTokenValid(): boolean {
    if (!this.authToken) {
      return false;
    }

    // If we can implement JWT token checking, we would do that here
    // For now, we'll just check if it exists
    return true;
  }

  // Function to refresh token if needed
  refreshToken(): void {
    // Implementation would depend on your backend's token refresh mechanism
    // This is a placeholder
    this.http.post<AuthResponse>('/api/auth/refresh', {}, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        this.authToken = response.token;
        localStorage.setItem('authToken', this.authToken);
      },
      error: () => {
        // If refresh fails, show login modal
        this.authToken = null;
        localStorage.removeItem('authToken');
        this.showLoginModal = true;
      }
    });
  }

  logout(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
    this.showLoginModal = true;
    this.transactions = [];
    this.originalTransactions = [];
  }
}
