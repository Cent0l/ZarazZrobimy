import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  doNotServe: boolean;
}

interface PawnItem {
  id: number;
  itemId: number;
  itemName: string;
  description: string;
  serialNumber: string | null;
  brand: string;
  model: string;
  condition: string;
  categoryId: number;
  loanAmount: number;
  price?: number;
  askingPrice?: number;
  categoryName?: string; // Dodana właściwość na potrzeby wyświetlania nazwy kategorii
}

interface PawnTransaction {
  id: number;
  customerId: number;
  customerName: string;
  employeeId: number;
  employeeName: string;
  transactionDate: string;
  transactionType: string;
  totalAmount: number;
  pawnDurationDays: number;
  interestRate: number;
  redemptionPrice: number;
  expiryDate: string;
  relatedTransactionId: number | null;
  notes: string;
  items: PawnItem[];
  status?: string; // Dodane pole statusu dla UI (aktywny, przeterminowany, wykupiony)
}

interface NewPawnTransaction {
  customerId?: number;
  newCustomer?: {
    firstName: string;
    lastName: string;
    idType: string;
    idNumber: string;
    doNotServe: boolean;
  };
  pawnDurationDays: number;
  interestRate: number;
  items: {
    categoryId: number;
    name: string;
    description: string;
    serialNumber: string;
    brand: string;
    model: string;
    condition: string;
    loanAmount: number;
  }[];
  notes: string;
}

interface Category {
  id: number;
  categoryName: string;
  description: string;
  parentCategoryId?: number | null;
}

interface RedemptionTransaction {
  id: number;
  customerId: number;
  customerName: string;
  employeeId: number;
  employeeName: string;
  transactionDate: string;
  pawnTransactionId: number;
  totalAmount: number;
  notes: string;
  items: PawnItem[];
  // New fields to match the enhanced display
  originalTransactionDate?: string;
  itemPrice?: number; // Używamy tego zamiast loanAmount
  profit?: number; // calculated field
  redemptionPrice?: number; // Dodajemy to pole
}

@Component({
  selector: 'app-pawns',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pawn.component.html',
  styleUrls: ['./pawn.component.css']
})
export class PawnsComponent implements OnInit, AfterViewInit {
  pawns: PawnTransaction[] = [];
  originalPawns: PawnTransaction[] = [];
  customers: Customer[] = [];
  categories: Category[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  authToken: string | null = null;
  successMessage: string | null = null;

  // Zmienne dla obsługi kategorii
  isLoadingCategories: boolean = false;
  categoriesLoadError: string | null = null;

  // Zmienne dla sortowania
  sortColumn: string = 'expiryDate';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Zmienne dla filtrowania
  filterStatus: string = 'all'; // 'all', 'active', 'expired', 'redeemed'

  // Zmienne dla dodawania nowego zastawu
  showAddPawnModal: boolean = false;
  newPawn: NewPawnTransaction = this.getEmptyPawn();
  addPawnInProgress: boolean = false;
  useExistingCustomer: boolean = false;
  customerId: number | null = null;
  isLoadingCustomers: boolean = false;
  customerLoadError: string | null = null;

  // Zmienne dla modalu wykupu
  showRedemptionModal: boolean = false;
  pawnToRedeem: PawnTransaction | null = null;
  redemptionInProgress: boolean = false;

  // Zmienne dla modalu przedawnienia
  showForfeitureModal: boolean = false;
  pawnToForfeit: PawnTransaction | null = null;
  forfeitureInProgress: boolean = false;

  // Zmienne dla modalu z przedmiotami
  showItemsModal: boolean = false;
  selectedPawnItems: PawnTransaction | null = null;

  // Stałe
  readonly CONDITIONS = ['Nowy', 'Bardzo dobry', 'Dobry', 'Średni', 'Dostateczny'];
  readonly DEFAULT_PAWN_DURATION = 30; // dni
  readonly DEFAULT_INTEREST_RATE = 10; // procent

  // Properties for redemption transactions
  redemptionTransactions: RedemptionTransaction[] = [];
  originalRedemptionTransactions: RedemptionTransaction[] = [];
  isLoadingRedemptions: boolean = false;
  redemptionError: string | null = null;
  activeTab: 'pawns' | 'redemptions' = 'pawns';  // To toggle between tabs

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchPawns();
      this.loadCategories(); // Zmieniono nazwę metody, by lepiej pasowała do zmiennych
    } else {
      this.error = 'Brak autoryzacji. Proszę zalogować się na stronie głównej.';
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

  getEmptyPawn(): NewPawnTransaction {
    return {
      pawnDurationDays: this.DEFAULT_PAWN_DURATION,
      interestRate: this.DEFAULT_INTEREST_RATE,
      newCustomer: this.getEmptyCustomer(), // Dodane, aby zapobiec błędom undefined
      items: [{
        categoryId: 1,
        name: '',
        description: '',
        serialNumber: '',
        brand: '',
        model: '',
        condition: 'Dobry',
        loanAmount: 0
      }],
      notes: ''
    };
  }

  getRedemptionAmount(redemption: RedemptionTransaction): number {
    return (redemption as any).redemptionPrice || redemption.totalAmount;
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  fetchPawns(): void {
    this.isLoading = true;

    // Pobieramy wszystkie transakcje
    this.http.get<PawnTransaction[]>('/api/transactions', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        console.log('Otrzymane dane z API (wszystkie transakcje):', data);

        // Przetwarzamy dane dla wszystkich transakcji
        const allTransactions = data.map(pawn => {
          // Oblicz status
          let status = this.calculatePawnStatus(pawn);

          // Jeśli to jest zastaw zmieniony na wykup, ustaw status na 'redeemed'
          if (pawn.transactionType === 'redemption') {
            status = 'redeemed';
          }

          return {
            ...pawn,
            status: status
          };
        });

        // Zapisz wszystkie dane do originalPawns
        this.originalPawns = [...allTransactions];

        console.log('Wszystkie przetworzone transakcje:', this.originalPawns);

        // Filtruj zastawy zgodnie z aktualnym filtrem
        this.applyStatusFilter();

        // Dodanie nazw kategorii do przedmiotów jeśli kategorie są już załadowane
        if (this.categories.length > 0) {
          this.enrichItemsWithCategoryNames();
        }

        this.isLoading = false;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        // obsługa błędów bez zmian
      }
    });
  }

  logTransactionData(): void {
    // Znajdź wszystkie zastawy o typie 'redemption'
    const redemptionTransactions = this.pawns.filter(p => p.transactionType === 'redemption');

    console.log('Zastawy typu redemption:', redemptionTransactions);

    if (redemptionTransactions.length > 0) {
      redemptionTransactions.forEach(t => {
        console.log(`Zastaw ID ${t.id}, typ: ${t.transactionType}`);
        console.log(`totalAmount: ${t.totalAmount}, redemptionPrice: ${t.redemptionPrice}`);
      });
    }
  }

// Funkcja do uzyskania kwoty wykupu
  getDisplayRedemptionPrice(pawn: PawnTransaction): string {
    // Jeśli to jest zastaw przekształcony na wykup, używamy redemptionPrice
    if (pawn.transactionType === 'redemption') {
      return this.formatCurrency(pawn.redemptionPrice);
    }

    // Dla zwykłych zastawów również pokazujemy redemptionPrice
    return this.formatCurrency(pawn.redemptionPrice);
  }
// Zmieniona metoda do ładowania kategorii
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesLoadError = null;

    this.http.get<Category[]>('/api/categories', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoadingCategories = false;

        // Dodajemy nazwy kategorii do przedmiotów, jeśli zastawy zostały już załadowane
        if (this.pawns.length > 0) {
          this.enrichItemsWithCategoryNames();
        }

        // Also add category names to redemption items if those are loaded
        if (this.redemptionTransactions.length > 0) {
          this.enrichRedemptionItemsWithCategoryNames();
        }
      },
      error: (err) => {
        console.error('Błąd pobierania kategorii:', err);
        this.categoriesLoadError = 'Nie udało się pobrać listy kategorii. Spróbuj ponownie.';
        this.isLoadingCategories = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        }
      }
    });
  }

// Nowa metoda do dodania nazw kategorii do przedmiotów
  enrichItemsWithCategoryNames(): void {
    if (this.pawns.length > 0 && this.categories.length > 0) {
      this.pawns.forEach(pawn => {
        pawn.items.forEach(item => {
          const category = this.categories.find(c => c.id === item.categoryId);
          if (category) {
            item.categoryName = category.categoryName;
          } else {
            item.categoryName = 'Nieznana kategoria';
          }
        });
      });
    }
  }

// Method to add category names to redemption items
  enrichRedemptionItemsWithCategoryNames(): void {
    if (this.redemptionTransactions.length > 0 && this.categories.length > 0) {
      this.redemptionTransactions.forEach(redemption => {
        redemption.items.forEach(item => {
          const category = this.categories.find(c => c.id === item.categoryId);
          if (category) {
            item.categoryName = category.categoryName;
          } else {
            item.categoryName = 'Nieznana kategoria';
          }
        });
      });
    }
  }

// Metoda do uzyskania pełnej ścieżki kategorii
  getCategoryPath(categoryId: number): string {
    const paths: string[] = [];
    let currentCategory = this.categories.find(c => c.id === categoryId);

    while (currentCategory) {
      paths.unshift(currentCategory.categoryName);

      // Użycie opcjonalnego łańcuchowania - TypeScript nie będzie protestować
      const parentCategoryId = currentCategory?.parentCategoryId;
      currentCategory = parentCategoryId
        ? this.categories.find(c => c.id === parentCategoryId)
        : undefined;
    }

    return paths.join(' / ');
  }

  loadCustomers(): void {
    if (!this.authToken) {
      return;
    }

    this.isLoadingCustomers = true;
    this.customerLoadError = null;

    this.http.get<Customer[]>(`/api/customers`, {
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

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        }
      }
    });
  }

// Status zastawu - wyznaczany na podstawie dat - ZMODYFIKOWANE
  calculatePawnStatus(pawn: PawnTransaction): string {
    console.log(`Obliczanie statusu dla zastawu ID: ${pawn.id}`); // DODANE: Logowanie

    // Jeżeli zastaw ma relatedTransactionId, to znaczy że został już wykupiony
    if (pawn.relatedTransactionId) {
      console.log(`Zastaw ID: ${pawn.id} ma relatedTransactionId: ${pawn.relatedTransactionId}, oznaczany jako 'redeemed'`); // DODANE: Logowanie
      return 'redeemed';
    }

    // Sprawdzamy czy zastaw jest przeterminowany
    const expiryDate = new Date(pawn.expiryDate);
    const today = new Date();

    if (today > expiryDate) {
      console.log(`Zastaw ID: ${pawn.id} jest przeterminowany, data wygaśnięcia: ${pawn.expiryDate}, oznaczany jako 'expired'`); // DODANE: Logowanie
      return 'expired';
    }

    // W przeciwnym razie zastaw jest aktywny
    console.log(`Zastaw ID: ${pawn.id} jest aktywny, oznaczany jako 'active'`); // DODANE: Logowanie
    return 'active';
  }

// Formatowanie statusu do wyświetlenia
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'active':
        return 'Aktywny';
      case 'expired':
        return 'Przeterminowany';
      case 'redeemed':
        return 'Wykupiony';
      case 'forfeited':
        return 'Przedawniony';
      default:
        return status;
    }
  }

// Klasa CSS dla etykiety statusu
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'bg-success',
      'expired': 'bg-danger',
      'redeemed': 'bg-info',
      'forfeited': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  }

// Ocena stanu przedmiotu (gwiazdki)
  getConditionRating(condition: string): number {
    switch (condition?.toLowerCase()) {
      case 'nowy':
        return 5;
      case 'bardzo dobry':
        return 4;
      case 'dobry':
        return 3;
      case 'średni':
        return 2;
      case 'dostateczny':
        return 1;
      default:
        return 0;
    }
  }

// Metoda otwierająca modal z przedmiotami
  openItemsModal(pawn: PawnTransaction): void {
    this.selectedPawnItems = pawn;
    this.showItemsModal = true;
  }

// Metoda zamykająca modal z przedmiotami
  closeItemsModal(): void {
    this.showItemsModal = false;
    this.selectedPawnItems = null;
  }

// Sortowanie
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.pawns.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Obsługa specjalnych przypadków sortowania
      if (column === 'customerName') {
        valueA = a.customerName;
        valueB = b.customerName;
      } else if (column === 'employeeName') {
        valueA = a.employeeName;
        valueB = b.employeeName;
      } else if (column === 'transactionDate' || column === 'expiryDate') {
        valueA = new Date(a[column as keyof PawnTransaction] as string);
        valueB = new Date(b[column as keyof PawnTransaction] as string);
      } else if (column === 'status') {
        valueA = a.status;
        valueB = b.status;
      } else if (column === 'totalAmount' || column === 'redemptionPrice') {
        valueA = a[column as keyof PawnTransaction];
        valueB = b[column as keyof PawnTransaction];
      } else {
        valueA = a[column as keyof PawnTransaction];
        valueB = b[column as keyof PawnTransaction];
      }

      // Sortowanie według typu danych
      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const strA = String(valueA || '').toLowerCase();
        const strB = String(valueB || '').toLowerCase();
        return this.sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });
  }

  resetSort(): void {
    this.sortColumn = 'expiryDate';
    this.sortDirection = 'asc';
    this.pawns = [...this.originalPawns];
    this.applyStatusFilter();
    setTimeout(() => this.initTooltips(), 100);
  }

// Filtrowanie według statusu - ZMODYFIKOWANE
  applyStatusFilter(): void {
    console.log('Stosowanie filtru statusu:', this.filterStatus);
    console.log('Oryginalne zastawy przed filtrowaniem:', this.originalPawns);

    // Najpierw filtrujemy, aby w zakładce "Aktualne zastawy" pokazywały się tylko zastawy typu 'pawn'
    let filteredPawns = this.originalPawns.filter(pawn => pawn.transactionType === 'pawn');

    console.log('Zastawy po filtrowaniu typu transakcji (tylko pawn):', filteredPawns);

    // Następnie stosujemy filtr statusu
    if (this.filterStatus === 'all') {
      this.pawns = [...filteredPawns];
    } else {
      this.pawns = filteredPawns.filter(pawn => {
        const matchesFilter = pawn.status === this.filterStatus;
        console.log(`Sprawdzanie zastawu ID ${pawn.id}, status: ${pawn.status}, pasuje do filtru: ${matchesFilter}`);
        return matchesFilter;
      });
    }

    console.log('Zastawy po filtrowaniu statusu:', this.pawns);

    // Ponowne sortowanie po filtrowaniu
    this.sortData(this.sortColumn);
  }

// Zmiana filtru statusu
  changeStatusFilter(status: string): void {
    this.filterStatus = status;
    this.applyStatusFilter();
  }

// Otwieranie i zamykanie modala dodawania zastawu
  openAddPawnModal(): void {
    this.newPawn = this.getEmptyPawn();
    this.showAddPawnModal = true;
    this.useExistingCustomer = false;
    this.customerId = null;
    this.error = null;

    // Pobierz listę klientów dla dropdown
    this.loadCustomers();

    // Upewnij się, że kategorie są załadowane
    if (this.categories.length === 0) {
      this.loadCategories();
    }
  }

  closeAddPawnModal(): void {
    this.showAddPawnModal = false;
    this.error = null;
  }

// Dodawanie nowego przedmiotu do formularza zastawu
  addItem(): void {
    this.newPawn.items.push({
      categoryId: 1,
      name: '',
      description: '',
      serialNumber: '',
      brand: '',
      model: '',
      condition: 'Dobry',
      loanAmount: 0
    });
  }

// Usuwanie przedmiotu z formularza zastawu
  removeItem(index: number): void {
    if (this.newPawn.items.length > 1) {
      this.newPawn.items.splice(index, 1);
    }
  }

// Obliczanie całkowitej kwoty pożyczki
  calculateTotalLoanAmount(): number {
    return this.newPawn.items.reduce((sum, item) => sum + item.loanAmount, 0);
  }

// Obliczanie kwoty wykupu
  calculateRedemptionAmount(): number {
    const totalLoan = this.calculateTotalLoanAmount();
    const interest = (totalLoan * this.newPawn.interestRate) / 100;
    return totalLoan + interest;
  }

// Dodawanie nowego zastawu - ZMODYFIKOWANE
  submitPawn(): void {
    // Podstawowa walidacja
    if (!this.validatePawnForm()) {
      return;
    }

    this.addPawnInProgress = true;
    this.error = null;

    // Przygotowanie obiektu transakcji
    const pawnTransaction: NewPawnTransaction = {
      pawnDurationDays: this.newPawn.pawnDurationDays,
      interestRate: this.newPawn.interestRate,
      items: this.newPawn.items,
      notes: this.newPawn.notes
    };

    // Dodaj dane klienta
    if (this.useExistingCustomer && this.customerId) {
      pawnTransaction.customerId = this.customerId;
    } else if (!this.useExistingCustomer) {
      pawnTransaction.newCustomer = {
        firstName: this.newPawn.newCustomer?.firstName || '',
        lastName: this.newPawn.newCustomer?.lastName || '',
        idType: this.newPawn.newCustomer?.idType || 'id_card',
        idNumber: this.newPawn.newCustomer?.idNumber || '',
        doNotServe: false
      };
    }

    // Jeśli brak tokenu, pokazujemy komunikat
    if (!this.authToken) {
      this.error = 'Musisz być zalogowany, aby dodać zastaw.';
      this.addPawnInProgress = false;
      return;
    }

    console.log('Wysyłam dane zastawu:', pawnTransaction);

    // Wysłanie do API
    this.http.post<PawnTransaction>('/api/transactions/pawn', pawnTransaction, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Zastaw dodany:', response);
        this.successMessage = 'Zastaw został dodany pomyślnie!';
        this.showAddPawnModal = false;
        this.addPawnInProgress = false;

        // ZMODYFIKOWANE: Odśwież listę zastawów z timeoutem
        setTimeout(() => {
          this.filterStatus = 'all'; // Resetuj filtr
          this.fetchPawns();

          // Zmień sortowanie na najnowsze
          this.sortColumn = 'transactionDate';
          this.sortDirection = 'desc';
        }, 500);

        // Ukryj wiadomość po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd podczas dodawania zastawu:', err);
        this.addPawnInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else {
          this.error = `Wystąpił błąd podczas dodawania zastawu: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

// Walidacja formularza zastawu
  private validatePawnForm(): boolean {
    // Sprawdzanie danych klienta
    if (!this.useExistingCustomer) {
      if (!this.newPawn.newCustomer?.firstName || !this.newPawn.newCustomer?.lastName || !this.newPawn.newCustomer?.idNumber) {
        this.error = 'Wypełnij dane klienta poprawnie!';
        return false;
      }
    } else if (!this.customerId) {
      this.error = 'Wybierz istniejącego klienta!';
      return false;
    }

    // Walidacja przedmiotów
    for (const item of this.newPawn.items) {
      if (!item.name || !item.brand || !item.model || item.loanAmount <= 0) {
        this.error = 'Wypełnij wszystkie wymagane pola przedmiotów i podaj kwotę pożyczki!';
        return false;
      }
    }

    // Walidacja parametrów zastawu
    if (this.newPawn.pawnDurationDays <= 0) {
      this.error = 'Okres zastawu musi być większy niż 0 dni!';
      return false;
    }

    if (this.newPawn.interestRate < 0) {
      this.error = 'Oprocentowanie nie może być ujemne!';
      return false;
    }

    return true;
  }

// Improved redeemPawn function
  redeemPawn(): void {
    if (!this.pawnToRedeem || !this.pawnToRedeem.id) {
      this.error = "Nie można znaleźć zastawu do wykupu.";
      return;
    }

    // Additional check if pawn can be redeemed
    if (this.pawnToRedeem.relatedTransactionId) {
      this.error = "Ten zastaw został już wykupiony lub przedawniony.";
      return;
    }

    if (this.pawnToRedeem.status !== 'active') {
      this.error = `Nie można wykupić zastawu o statusie: ${this.getStatusDisplay(this.pawnToRedeem.status || '')}.`;
      return;
    }

    this.redemptionInProgress = true;
    this.error = null;

    // Zmodyfikowane: używamy PATCH zamiast POST do zmiany typu transakcji
    const updateData = {
      newType: "redemption",  // Używamy pola newType zgodnie z ustaleniem
      notes: `Wykupione w dniu ${new Date().toISOString().split('T')[0]}`
    };

    console.log('Wysyłam żądanie zmiany typu zastawu na wykup:', updateData);
    console.log('Przed zmianą - zastaw:', this.pawnToRedeem);

    // Używamy nowego endpointu PATCH zamiast POST
    this.http.patch<PawnTransaction>(`/api/transactions/${this.pawnToRedeem.id}/type`, updateData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Zastaw pomyślnie zmieniony na wykupiony, odpowiedź API:', response);
        this.successMessage = 'Zastaw został pomyślnie wykupiony!';
        this.showRedemptionModal = false;
        this.redemptionInProgress = false;

        // Po udanym wykupie odświeżamy obie zakładki
        this.fetchPawns(); // odśwież listę aktywnych zastawów (powinny zniknąć wykupione)
        this.fetchRedemptionTransactions(); // odśwież listę wykupionych zastawów

        // Ukryj wiadomość po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd podczas wykupu zastawu:', err);
        this.redemptionInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else if (err.status === 400 && err.error && err.error.error) {
          const errorMsg = err.error.error;
          this.error = `Błąd: ${errorMsg}`;
        } else {
          this.error = `Wystąpił błąd podczas wykupu zastawu: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

  openRedemptionModal(pawn: PawnTransaction): void {
    this.pawnToRedeem = pawn;
    this.showRedemptionModal = true;
    this.error = null;
  }

  closeRedemptionModal(): void {
    this.showRedemptionModal = false;
    this.pawnToRedeem = null;
    this.error = null;
  }

  openForfeitureModal(pawn: PawnTransaction): void {
    this.pawnToForfeit = pawn;
    this.showForfeitureModal = true;
    this.error = null;
  }

  closeForfeitureModal(): void {
    this.showForfeitureModal = false;
    this.pawnToForfeit = null;
    this.error = null;
  }

  forfeitPawn(): void {
    if (!this.pawnToForfeit || !this.pawnToForfeit.id) {
      this.error = "Nie można znaleźć zastawu do przedawnienia.";
      return;
    }

    // Additional check if pawn can be forfeited
    if (this.pawnToForfeit.relatedTransactionId) {
      this.error = "Ten zastaw został już wykupiony lub przedawniony.";
      return;
    }

    if (this.pawnToForfeit.status !== 'expired') {
      this.error = `Tylko przeterminowane zastawy mogą zostać przedawnione. Obecny status: ${this.getStatusDisplay(this.pawnToForfeit.status || '')}.`;
      return;
    }

    this.forfeitureInProgress = true;
    this.error = null;

    // Przygotowanie danych przedawnienia
    const forfeitureData = {
      pawnTransactionId: this.pawnToForfeit.id,
      notes: `Przedawniony w dniu ${new Date().toISOString().split('T')[0]}`
    };

    console.log('Wysyłam żądanie przedawnienia zastawu:', forfeitureData);

    // Zakładamy, że API ma endpoint /forfeiture
    this.http.post('/api/transactions/forfeiture', forfeitureData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Zastaw przedawniony, odpowiedź API:', response);
        this.successMessage = 'Zastaw został oznaczony jako przedawniony!';
        this.showForfeitureModal = false;
        this.forfeitureInProgress = false;

        // Ręczna aktualizacja statusu zastawu w lokalnych danych
        const index = this.originalPawns.findIndex(p => p.id === this.pawnToForfeit?.id);
        if (index !== -1) {
          console.log(`Aktualizuję status zastawu ID ${this.pawnToForfeit?.id} na 'forfeited'`);

          // Dodajemy pole relatedTransactionId
          if (response && 'id' in response) {
            this.originalPawns[index].relatedTransactionId = (response as any).id;
          } else {
            this.originalPawns[index].relatedTransactionId = 2; // Domyślna wartość, jeśli API nie zwraca ID
          }

          this.originalPawns[index].status = 'forfeited';

          // Aktualizacja głównej tablicy zastawów
          const mainIndex = this.pawns.findIndex(p => p.id === this.pawnToForfeit?.id);
          if (mainIndex !== -1) {
            this.pawns[mainIndex] = {...this.originalPawns[index]};
          }
        }

        // Odśwież listę zastawów z API (jako zapasowa opcja)
        setTimeout(() => this.fetchPawns(), 500);

        // Ukryj wiadomość po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd podczas przedawniania zastawu:', err);
        this.forfeitureInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else if (err.status === 400 && err.error && err.error.error) {
          // Bardziej szczegółowa obsługa błędów
          const errorMsg = err.error.error;
          if (errorMsg.includes('redeemed or forfeited')) {
            this.error = 'Ten zastaw został już wykupiony lub jest przedawniony.';

            // Jeśli backend twierdzi, że zastaw jest już przedawniony, aktualizujemy UI
            const index = this.originalPawns.findIndex(p => p.id === this.pawnToForfeit?.id);
            if (index !== -1) {
              this.originalPawns[index].relatedTransactionId = 999; // Dummy ID
              this.originalPawns[index].status = 'forfeited';

              // Aktualizacja głównej tablicy
              const mainIndex = this.pawns.findIndex(p => p.id === this.pawnToForfeit?.id);
              if (mainIndex !== -1) {
                this.pawns[mainIndex] = {...this.originalPawns[index]};
              }

              // Zamknij modal
              this.showForfeitureModal = false;

              // Odśwież listę kompletnie
              setTimeout(() => this.fetchPawns(), 500);
            }
          } else {
            this.error = `Błąd: ${errorMsg}`;
          }
        } else {
          this.error = `Wystąpił błąd podczas przedawniania zastawu: ${err.message || 'Nieznany błąd'}`;

          // Implementacja UI-only jako ostateczność, jeśli API nie obsługuje przedawnienia
          if (confirm('API może nie obsługiwać przedawnienia. Czy chcesz oznaczyć zastaw jako przedawniony tylko w UI?')) {
            // Aktualizacja w UI
            const index = this.originalPawns.findIndex(p => p.id === this.pawnToForfeit?.id);
            if (index !== -1) {
              console.log(`Aktualizuję status zastawu ID ${this.pawnToForfeit?.id} na 'forfeited' (tylko UI)`);

              // Dodanie pola relatedTransactionId symuluje wykupienie/przedawnienie
              this.originalPawns[index].relatedTransactionId = 999999; // Dummy ID
              this.originalPawns[index].status = 'forfeited'; // Nowy status

              // Aktualizacja głównej tablicy
              const mainIndex = this.pawns.findIndex(p => p.id === this.pawnToForfeit?.id);
              if (mainIndex !== -1) {
                this.pawns[mainIndex] = {...this.originalPawns[index]};
              }

              // Odśwież listę z filtrowaniem
              this.applyStatusFilter();

              this.successMessage = 'Zastaw został oznaczony jako przedawniony (tylko w UI)!';
              this.showForfeitureModal = false;

              // Ukryj wiadomość po 3 sekundach
              setTimeout(() => {
                this.successMessage = null;
              }, 3000);
            }
          }
        }
      }
    });
  }

// Helper do pokazywania cen
  formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) return '-';
    return amount.toFixed(2) + ' PLN';
  }

// Dodaj pustego klienta do formularza
  getEmptyCustomer(): any {
    return {
      firstName: '',
      lastName: '',
      idType: 'id_card',
      idNumber: '',
      doNotServe: false
    };
  }

// Sprawdzanie czy klient ma zakaz
  isCustomerBlocked(): boolean {
    if (this.useExistingCustomer && this.customerId) {
      const selectedCustomer = this.customers.find(c => c.id === this.customerId);
      return selectedCustomer ? selectedCustomer.doNotServe : false;
    } else if (this.newPawn.newCustomer) {
      return this.newPawn.newCustomer.doNotServe;
    }
    return false;
  }

// Formatowanie daty do wyświetlenia
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  }

// NOWA FUNKCJA - Ręczne odświeżanie listy - DODANA
  manualRefresh(): void {
    console.log('Ręczne odświeżanie listy zastawów');
    this.filterStatus = 'all'; // Resetuj filtr

    // Zmień sortowanie na najnowsze
    this.sortColumn = 'transactionDate';
    this.sortDirection = 'desc';

    this.fetchPawns(); // Pobierz dane ponownie
    this.successMessage = 'Lista zastawów została odświeżona.';
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

// NOWA FUNKCJA - Pobieranie transakcji wykupu
  fetchRedemptionTransactions(): void {
    this.isLoadingRedemptions = true;
    this.redemptionError = null;

    // Pobieramy wszystkie transakcje typu redemption
    this.http.get<PawnTransaction[]>('/api/transactions/type/redemption', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (redemptionTransactions) => {
        console.log('Pobrane transakcje typu redemption:', redemptionTransactions);

        // Przekształć transakcje typu PawnTransaction na RedemptionTransaction
        const convertedRedemptions = redemptionTransactions.map(transaction => {
          // Oblicz sumę cen przedmiotów
          const itemTotalPrice = this.getItemTotalPrice(transaction.items);

          // Oblicz zysk (kwota wykupu - kwota pożyczki)
          const profit = transaction.redemptionPrice - itemTotalPrice;

          // Utwórz obiekt RedemptionTransaction
          return {
            id: transaction.id,
            customerId: transaction.customerId,
            customerName: transaction.customerName,
            employeeId: transaction.employeeId,
            employeeName: transaction.employeeName,
            transactionDate: transaction.transactionDate,
            pawnTransactionId: transaction.relatedTransactionId || transaction.id, // używaj relatedTransactionId jeśli istnieje
            totalAmount: transaction.redemptionPrice, // kwota wykupu
            redemptionPrice: transaction.redemptionPrice, // dodane pole redemptionPrice
            notes: transaction.notes,
            items: transaction.items,
            itemPrice: itemTotalPrice,
            profit: profit
          } as RedemptionTransaction;
        });

        this.redemptionTransactions = convertedRedemptions;
        this.originalRedemptionTransactions = [...this.redemptionTransactions];

        // Sortuj od najnowszych
        this.sortRedemptionData('transactionDate');

        this.isLoadingRedemptions = false;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        // obsługa błędów bez zmian
      }
    });
  }

// NOWA FUNKCJA - Wzbogacanie transakcji wykupu o dane z oryginalnych zastawów
  enrichRedemptionTransactions(redemptions: RedemptionTransaction[]): void {
    // Jeśli nie mamy zastawów, najpierw je pobieramy
    if (this.originalPawns.length === 0) {
      this.fetchPawnsForRedemptions(redemptions);
      return;
    }

    // Dopasowujemy transakcje wykupu do oryginalnych zastawów
    const enrichedRedemptions = redemptions.map(redemption => {
      // Oblicz sumę cen przedmiotów (to będzie kwota pożyczki/cena zakupu)
      const itemTotalPrice = this.getItemTotalPrice(redemption.items);

      // Oblicz zysk
      const profit = redemption.totalAmount - itemTotalPrice;

      // Szukamy oryginalnego zastawu - używamy pawnTransactionId
      const originalPawn = this.originalPawns.find(pawn => pawn.id === redemption.pawnTransactionId);

      // Wzbogacamy dane wykupu o informacje z zastawu oraz obliczone wartości
      if (originalPawn) {
        return {
          ...redemption,
          originalTransactionDate: originalPawn.transactionDate,
          itemPrice: itemTotalPrice,
          profit: profit
        };
      } else {
        // Domyślne wartości, jeśli nie znaleziono oryginalnego zastawu
        return {
          ...redemption,
          itemPrice: itemTotalPrice,
          profit: profit
        };
      }
    });

    this.redemptionTransactions = enrichedRedemptions;
  }

// NOWA FUNKCJA - Pobieranie zastawów specjalnie dla wzbogacenia transakcji wykupu
  fetchPawnsForRedemptions(redemptions: RedemptionTransaction[]): void {
    this.http.get<PawnTransaction[]>('/api/transactions/type/pawn', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (pawns) => {
        this.originalPawns = pawns.map(pawn => ({
          ...pawn,
          status: this.calculatePawnStatus(pawn)
        }));

        // Teraz, gdy mamy zastawy, wzbogacamy transakcje wykupu
        this.enrichRedemptionTransactions(redemptions);
      },
      error: (err) => {
        console.error('Błąd pobierania zastawów dla wzbogacenia wykupów:', err);
        // W przypadku niepowodzenia, nadal wyświetlamy wykupy z domyślnymi wartościami
        this.redemptionTransactions = redemptions.map(redemption => ({
          ...redemption,
          originalTransactionDate: 'Data nieznana',
          itemPrice: this.getItemTotalPrice(redemption.items),
          profit: redemption.totalAmount - this.getItemTotalPrice(redemption.items)
        }));
      }
    });
  }

// NOWA FUNKCJA - Sortowanie transakcji wykupu
  sortRedemptionData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc'; // Domyślnie od najnowszych
    }

    this.redemptionTransactions.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Obsługa specjalnych przypadków sortowania
      if (column === 'customerName') {
        valueA = a.customerName;
        valueB = b.customerName;
      } else if (column === 'employeeName') {
        valueA = a.employeeName;
        valueB = b.employeeName;
      } else if (column === 'transactionDate') {
        valueA = new Date(a.transactionDate);
        valueB = new Date(b.transactionDate);
      } else if (column === 'itemPrice') {
        valueA = this.getItemTotalPrice(a.items);
        valueB = this.getItemTotalPrice(b.items);
      } else if (column === 'totalAmount') {
        valueA = a.totalAmount;
        valueB = b.totalAmount;
      } else if (column === 'profit') {
        valueA = a.totalAmount - this.getItemTotalPrice(a.items);
        valueB = b.totalAmount - this.getItemTotalPrice(b.items);
      } else {
        valueA = a[column as keyof RedemptionTransaction];
        valueB = b[column as keyof RedemptionTransaction];
      }

      // Sortowanie według typu danych
      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const strA = String(valueA || '').toLowerCase();
        const strB = String(valueB || '').toLowerCase();
        return this.sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });
  }

// NOWA FUNKCJA - Resetowanie sortowania wykupów
  resetRedemptionSort(): void {
    this.sortColumn = 'transactionDate';
    this.sortDirection = 'desc'; // Od najnowszych
    this.redemptionTransactions = [...this.originalRedemptionTransactions];
    this.sortRedemptionData('transactionDate');
    setTimeout(() => this.initTooltips(), 100);
  }

// NOWA FUNKCJA - Przełączanie między zakładkami
  switchTab(tab: 'pawns' | 'redemptions'): void {
    this.activeTab = tab;

    // Jeśli przełączamy na zakładkę wykupów i jeszcze ich nie załadowaliśmy
    if (tab === 'redemptions' && this.redemptionTransactions.length === 0) {
      this.fetchRedemptionTransactions();
    }

    // Resetowanie błędów
    this.error = null;
    this.redemptionError = null;

    // Ponowna inicjalizacja tooltipów po przełączeniu zakładki
    setTimeout(() => this.initTooltips(), 200);
  }

// NOWA FUNKCJA - Otwieranie modalu z przedmiotami dla transakcji wykupu - ZMODYFIKOWANE
  openRedemptionItemsModal(redemption: RedemptionTransaction): void {
    // Używamy istniejącego modalu z przedmiotami
    this.selectedPawnItems = {
      id: redemption.id,
      customerId: redemption.customerId,
      customerName: redemption.customerName,
      employeeId: redemption.employeeId,
      employeeName: redemption.employeeName,
      transactionDate: redemption.originalTransactionDate || redemption.transactionDate,
      transactionType: 'redemption',
      totalAmount: this.getItemTotalPrice(redemption.items), // ZMIENIONO z redemption.loanAmount
      pawnDurationDays: 0, // Nie ma zastosowania dla wykupu
      interestRate: 0, // Nie ma zastosowania dla wykupu
      redemptionPrice: redemption.totalAmount,
      expiryDate: redemption.transactionDate, // Używamy daty wykupu jako daty ważności
      relatedTransactionId: redemption.pawnTransactionId,
      notes: redemption.notes,
      items: redemption.items,
      status: 'redeemed'
    };
    this.showItemsModal = true;
  }

// NOWA FUNKCJA - Wyświetlanie szczegółów oryginalnego zastawu
  viewOriginalPawn(pawnTransactionId: number): void {
    // Szukamy oryginalnego zastawu w lokalnych danych
    const originalPawn = this.originalPawns.find(p => p.id === pawnTransactionId);

    if (originalPawn) {
      // Używamy istniejącego modalu z przedmiotami do wyświetlenia szczegółów
      this.selectedPawnItems = originalPawn;
      this.showItemsModal = true;
    } else {
      // Jeśli nie znaleziono w lokalnych danych, możemy potrzebować pobrać go z API
      this.error = 'Nie można znaleźć oryginalnego zastawu w lokalnych danych.';
      // Opcjonalnie: Implementacja metody pobierania pojedynczego zastawu po ID
    }
  }

// Obsługa zmiany opcji wyboru klienta
  onCustomerSelectionChange(useExisting: boolean): void {
    this.useExistingCustomer = useExisting;
    if (useExisting && this.customers.length === 0) {
      this.loadCustomers();
    }
  }

// Widoczność przycisku wykupu - tylko dla aktywnych zastawów
  canBeRedeemed(pawn: PawnTransaction): boolean {
    // Sprawdzamy czy zastaw jest aktywny i NIE ma relatedTransactionId (co oznaczałoby, że jest już wykupiony)
    return pawn.status === 'active' && !pawn.relatedTransactionId;
  }

// Widoczność przycisku przedawnienia
  canBeForfeited(pawn: PawnTransaction): boolean {
    return pawn.status === 'expired';
  }

// NOWA FUNKCJA - Pobiera całkowitą cenę/wartość przedmiotów - DODANA
  getItemTotalPrice(items: PawnItem[]): number {
    if (!items || items.length === 0) return 0;

    // Sumuj cenę przedmiotów - najpierw próbujemy użyć price, a jeśli nie ma, to loanAmount
    return items.reduce((total, item) => {
      const itemValue = item.price || item.loanAmount || 0;
      return total + itemValue;
    }, 0);
  }
}
