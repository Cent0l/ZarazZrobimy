import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

declare var bootstrap: any;

interface TransactionItem {
  id: number;
  itemId: number;
  itemName: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  serialNumber: string | null;
  condition: string;
  categoryId: number;
  askingPrice: number;
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

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './history.component.html',
  styles: [`
    .profit { color: green; font-weight: bold; }
    .loss { color: red; font-weight: bold; }
    .no-change { color: gray; }
    .sortable-header {
      cursor: pointer;
    }
    .sortable-header:hover {
      background-color: rgba(0,0,0,0.1);
    }
    .cursor-help {
      cursor: help;
    }

    /* Style dla responsywnej tabeli */
    .table-responsive-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .smart-table {
      min-width: 800px;
    }

    .smart-table th {
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .smart-table td {
      font-size: 0.9rem;
      padding: 0.5rem;
    }

    /* Responsywne zachowanie na bardzo małych ekranach */
    @media (max-width: 576px) {
      .smart-table th,
      .smart-table td {
        padding: 0.4rem;
        font-size: 0.85rem;
      }
    }
  `]
})
export class HistoryComponent implements OnInit, AfterViewInit {
  transactions: Transaction[] = [];
  originalTransactions: Transaction[] = [];
  isLoading = true;
  error: string | null = null;
  authToken: string | null = null;

  // Dla modalu szczegółów
  selectedItem: TransactionItem | null = null;
  selectedTransaction: Transaction | null = null;

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Summary
  totalBought = 0;
  totalSold = 0;
  totalProfit = 0;
  totalProfitPercentage = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchSaleTransactions();
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

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  fetchSaleTransactions(): void {
    this.isLoading = true;
    this.http.get<Transaction[]>('/api/transactions/type/sale', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.transactions = data;
        this.originalTransactions = [...data];
        this.calculateTotals();
        this.isLoading = false;
        setTimeout(() => this.initTooltips(), 100);
      },
      error: (err) => {
        console.error('Błąd pobierania transakcji sprzedaży:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
        } else {
          this.error = `Błąd podczas pobierania danych transakcji: ${err.message}`;
        }
        this.isLoading = false;
      }
    });
  }

  showItemDetails(item: TransactionItem, transaction: Transaction): void {
    this.selectedItem = item;
    this.selectedTransaction = transaction;

    // Otwieramy modal z detalami
    const modal = new bootstrap.Modal(document.getElementById('itemDetailsModal'));
    modal.show();
  }

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
      } else if (column === 'totalAmount') {
        valueA = transactionA.totalAmount;
        valueB = transactionB.totalAmount;
      } else if (column === 'condition') {
        // Use numerical value for condition sorting
        valueA = this.getConditionRating(itemA.condition);
        valueB = this.getConditionRating(itemB.condition);
      } else if (column === 'profit') {
        // Sortowanie po zysku
        valueA = this.calculateMargin(itemA, transactionA);
        valueB = this.calculateMargin(itemB, transactionB);
      } else if (column === 'profitPercentage') {
        // Sortowanie po zysku procentowym
        valueA = this.calculateMarginPercentage(itemA, transactionA);
        valueB = this.calculateMarginPercentage(itemB, transactionB);
      } else {
        valueA = itemA[column as keyof TransactionItem];
        valueB = itemB[column as keyof TransactionItem];
      }

      // Handle different types of values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
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
  }

  resetSort(): void {
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.transactions = JSON.parse(JSON.stringify(this.originalTransactions));
    setTimeout(() => this.initTooltips(), 100);
  }

  calculateTotals(): void {
    // Initialize totals
    this.totalBought = 0;
    this.totalSold = 0;
    this.totalProfit = 0;

    // Calculate totals by summing up all item prices
    this.transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        this.totalBought += item.price;
        this.totalSold += transaction.totalAmount;
      });
    });

    this.totalProfit = this.totalSold - this.totalBought;

    if (this.totalBought > 0) {
      this.totalProfitPercentage = Number(((this.totalProfit / this.totalBought) * 100).toFixed(2));
    } else {
      this.totalProfitPercentage = 0;
    }
  }

  getConditionRating(condition: string): number {
    switch (condition?.toLowerCase()) {
      case 'nowy':
      case 'idealny': return 5;
      case 'bardzo dobry': return 4;
      case 'dobry': return 3;
      case 'średni': return 2;
      case 'dostateczny': return 1;
      default: return 0;
    }
  }

  getMarginClass(value: number): string {
    if (value > 0) return 'profit';
    if (value < 0) return 'loss';
    return 'no-change';
  }

  calculateMargin(item: TransactionItem, transaction: Transaction): number {
    return transaction.totalAmount - item.price;
  }

  calculateMarginPercentage(item: TransactionItem, transaction: Transaction): number {
    if (item.price === 0) return 0;
    return Number(((transaction.totalAmount - item.price) / item.price * 100).toFixed(2));
  }
}
