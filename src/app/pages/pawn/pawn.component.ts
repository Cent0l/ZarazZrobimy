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
}

@Component({
  selector: 'app-pawns', // Zmieniony selektor, aby pasował do użycia w dashboard.component.html
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchPawns();
      this.fetchCategories();
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

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  fetchPawns(): void {
    this.isLoading = true;

    // Pobieramy wszystkie transakcje typu pawn
    this.http.get<PawnTransaction[]>('/api/transactions/type/pawn', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        // TO MOŻNA ODKOMENTOWAĆ DO TESTÓW - modyfikuje datę wygaśnięcia po stronie frontendu
        // data.forEach(pawn => {
        //   // Modyfikuj tylko konkretny zastaw lub kilka dla testów
        //   if (pawn.id === 34) { // Zmień na ID zastawu, który chcesz przeterminować
        //     // Ustaw datę wygaśnięcia na wczoraj
        //     const yesterday = new Date();
        //     yesterday.setDate(yesterday.getDate() - 1);
        //     pawn.expiryDate = yesterday.toISOString().split('T')[0];
        //     console.log(`Zmodyfikowano datę wygaśnięcia dla zastawu ID ${pawn.id} na ${pawn.expiryDate}`);
        //   }
        // });

        this.pawns = data.map(pawn => ({
          ...pawn,
          status: this.calculatePawnStatus(pawn)
        }));
        this.originalPawns = [...this.pawns];
        this.sortData(this.sortColumn);
        this.applyStatusFilter();
        this.isLoading = false;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        console.error('Błąd pobierania zastawów:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else {
          this.error = `Błąd podczas pobierania danych zastawów: ${err.message}`;
        }
        this.isLoading = false;
      }
    });
  }

  fetchCategories(): void {
    this.http.get<Category[]>('/api/categories', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Błąd pobierania kategorii:', err);
      }
    });
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

  // Status zastawu - wyznaczany na podstawie dat
  calculatePawnStatus(pawn: PawnTransaction): string {
    // TO MOŻNA ODKOMENTOWAĆ DO TESTÓW - wymusza status EXPIRED dla konkretnego zastawu
    // if (pawn.id === 34) { // Zmień na ID zastawu, który chcesz oznaczyć jako przeterminowany
    //   console.log("Wymuszenie statusu EXPIRED dla zastawu ID:", pawn.id);
    //   return 'expired';
    // }

    // Jeżeli zastaw ma relatedTransactionId, to znaczy że został już wykupiony
    if (pawn.relatedTransactionId) {
      return 'redeemed';
    }

    // Sprawdzamy czy zastaw jest przeterminowany
    const expiryDate = new Date(pawn.expiryDate);
    const today = new Date();

    if (today > expiryDate) {
      return 'expired';
    }

    // W przeciwnym razie zastaw jest aktywny
    return 'active';
  }

  // Formatowanie statusu do wyświetlenia
  getStatusDisplay(status: string): string {
    switch(status) {
      case 'active': return 'Aktywny';
      case 'expired': return 'Przeterminowany';
      case 'redeemed': return 'Wykupiony';
      default: return status;
    }
  }

  // Klasa CSS dla etykiety statusu
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'bg-success',
      'expired': 'bg-danger',
      'redeemed': 'bg-info'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  // Ocena stanu przedmiotu (gwiazdki)
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

  // Metoda, która tworzy tekst tooltip dla przedmiotów
  getItemsTooltip(items: PawnItem[]): string {
    if (!items || items.length === 0) return '';
    return items.map(item =>
      `${item.itemName || ''} (${item.brand || ''} ${item.model || ''})`
    ).join('<br>');
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

  // Filtrowanie według statusu
  applyStatusFilter(): void {
    if (this.filterStatus === 'all') {
      this.pawns = [...this.originalPawns];
    } else {
      this.pawns = this.originalPawns.filter(pawn => pawn.status === this.filterStatus);
    }

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

  // Dodawanie nowego zastawu
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

        // Odśwież listę zastawów
        this.fetchPawns();

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

  // Obsługa wykupu zastawu
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

  redeemPawn(): void {
    if (!this.pawnToRedeem || !this.pawnToRedeem.id) {
      this.error = "Nie można znaleźć zastawu do wykupu.";
      return;
    }

    this.redemptionInProgress = true;
    this.error = null;

    const redemptionData = {
      pawnTransactionId: this.pawnToRedeem.id,
      notes: `Wykupione w dniu ${new Date().toISOString().split('T')[0]}`
    };

    this.http.post('/api/transactions/redemption', redemptionData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Zastaw wykupiony:', response);
        this.successMessage = 'Zastaw został pomyślnie wykupiony!';
        this.showRedemptionModal = false;
        this.redemptionInProgress = false;

        // Odśwież listę zastawów
        this.fetchPawns();

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
        } else {
          this.error = `Wystąpił błąd podczas wykupu zastawu: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

  // Obsługa przedawnienia zastawu
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

    this.forfeitureInProgress = true;
    this.error = null;

    // Przygotowanie danych przedawnienia
    // W API powinien być endpoint /forfeiture, ale jeśli nie ma, można symulować ten proces
    // poprzez dodanie nowej transakcji o typie "forfeiture" z odniesieniem do oryginalnego zastawu
    const forfeitureData = {
      pawnTransactionId: this.pawnToForfeit.id,
      notes: `Przedawniony w dniu ${new Date().toISOString().split('T')[0]}`
    };

    // Zakładamy, że API ma endpoint /forfeiture
    this.http.post('/api/transactions/forfeiture', forfeitureData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Zastaw przedawniony:', response);
        this.successMessage = 'Zastaw został oznaczony jako przedawniony!';
        this.showForfeitureModal = false;
        this.forfeitureInProgress = false;

        // Odśwież listę zastawów
        this.fetchPawns();

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
        } else {
          this.error = `Wystąpił błąd podczas przedawniania zastawu: ${err.message || 'Nieznany błąd'}`;

          // Jeśli API nie obsługuje przedawnienia, można zaimplementować to po stronie klienta
          if (confirm('API może nie obsługiwać przedawnienia. Czy chcesz oznaczyć zastaw jako przedawniony tylko w UI?')) {
            // Aktualizacja w UI
            const index = this.originalPawns.findIndex(p => p.id === this.pawnToForfeit?.id);
            if (index !== -1) {
              // Dodanie pola relatedTransactionId symuluje wykupienie/przedawnienie
              this.originalPawns[index].relatedTransactionId = 999999; // Dummy ID
              this.originalPawns[index].status = 'expired';

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
  formatCurrency(amount: number): string {
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
    }
    return false;
  }

  // Konwersja typu dokumentu na polską etykietę
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
