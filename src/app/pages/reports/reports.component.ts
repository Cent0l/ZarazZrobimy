import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

// Interfejsy
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

interface Category {
  id: number;
  categoryName: string;
  description?: string;
}

interface StatsSummary {
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  totalPurchases: number;
  totalSales: number;
  totalPawns: number;
  totalRedemptions: number;
  averageTransactionValue: number;
  averageProfitPerTransaction: number;
  salesProfit: number;
  redemptionProfit: number;
  topEmployees: { name: string; count: number; revenue: number; profit: number }[];
  monthlyData: { month: string; revenue: number; transactions: number; profit: number }[];
  categoryData: { category: string; count: number; revenue: number; profit: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  stats: StatsSummary = {
    totalTransactions: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalPurchases: 0,
    totalSales: 0,
    totalPawns: 0,
    totalRedemptions: 0,
    averageTransactionValue: 0,
    averageProfitPerTransaction: 0,
    salesProfit: 0,
    redemptionProfit: 0,
    topEmployees: [],
    monthlyData: [],
    categoryData: []
  };

  isLoading = true;
  error: string | null = null;
  authToken: string | null = null;

  // Filtry
  dateFrom: string = '';
  dateTo: string = '';
  selectedTransactionType: string = 'all';

  // Wykresy
  private monthlyChart?: Chart;
  private typeChart?: Chart;
  private employeeChart?: Chart;
  private profitChart?: Chart;

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.authToken = localStorage.getItem('authToken');

    // Ustaw domyślne daty (ostatnie 6 miesięcy)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = sixMonthsAgo.toISOString().split('T')[0];

    if (this.authToken) {
      this.fetchCategories();
    } else {
      this.error = 'Brak autoryzacji. Proszę zalogować się.';
      this.isLoading = false;
    }
  }

  ngAfterViewInit(): void {
    // Inicjalizacja wykresów po załadowaniu danych
    setTimeout(() => {
      if (!this.isLoading && !this.error) {
        this.initializeCharts();
      }
    }, 100);
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  fetchCategories(): void {
    this.http.get<Category[]>('/api/categories', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Pobrane kategorie:', this.categories);
        this.fetchTransactions();
      },
      error: (err) => {
        console.error('Błąd pobierania kategorii:', err);
        // Nie przerywaj procesu - spróbuj załadować transakcje bez kategorii
        this.fetchTransactions();
      }
    });
  }

  fetchTransactions(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<Transaction[]>('/api/transactions', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.transactions = data;
        this.calculateStatistics();
        this.isLoading = false;

        // Inicjalizuj wykresy po załadowaniu danych
        setTimeout(() => this.initializeCharts(), 100);
      },
      error: (err) => {
        console.error('Błąd pobierania transakcji:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
        } else {
          this.error = `Błąd podczas pobierania danych: ${err.message}`;
        }
        this.isLoading = false;
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    const name = category ? category.categoryName : `Kategoria ${categoryId}`;
    console.log(`getCategoryName(${categoryId}) -> "${name}"`); // Debug
    return name;
  }

  calculateStatistics(): void {
    let filteredTransactions = this.transactions;

    // Filtrowanie według dat
    if (this.dateFrom) {
      filteredTransactions = filteredTransactions.filter(t =>
        new Date(t.transactionDate) >= new Date(this.dateFrom)
      );
    }
    if (this.dateTo) {
      filteredTransactions = filteredTransactions.filter(t =>
        new Date(t.transactionDate) <= new Date(this.dateTo)
      );
    }

    // Filtrowanie według typu transakcji
    if (this.selectedTransactionType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        t.transactionType === this.selectedTransactionType
      );
    }

    // Obliczanie podstawowych statystyk
    this.stats.totalTransactions = filteredTransactions.length;
    this.stats.totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    this.stats.totalPurchases = filteredTransactions.filter(t => t.transactionType === 'purchase').length;
    this.stats.totalSales = filteredTransactions.filter(t => t.transactionType === 'sale').length;
    this.stats.totalPawns = filteredTransactions.filter(t => t.transactionType === 'pawn').length;
    this.stats.totalRedemptions = filteredTransactions.filter(t => t.transactionType === 'redemption').length;

    this.stats.averageTransactionValue = this.stats.totalTransactions > 0
      ? this.stats.totalRevenue / this.stats.totalTransactions
      : 0;

    // Obliczanie zysków
    this.calculateProfits(filteredTransactions);

    this.stats.averageProfitPerTransaction = this.stats.totalTransactions > 0
      ? this.stats.totalProfit / this.stats.totalTransactions
      : 0;

    // Top pracownicy (z zyskami)
    this.calculateTopEmployees(filteredTransactions);

    // Dane miesięczne (z zyskami)
    this.calculateMonthlyData(filteredTransactions);

    // Dane kategorii (z zyskami)
    this.calculateCategoryData(filteredTransactions);
  }

  calculateProfits(transactions: Transaction[]): void {
    let salesProfit = 0;
    let redemptionProfit = 0;

    transactions.forEach(t => {
      if (t.transactionType === 'sale') {
        // Dla sprzedaży: zysk = cena sprzedaży - koszt zakupu
        const sellingPrice = t.totalAmount;
        const purchasePrice = t.items.reduce((sum, item) => sum + item.price, 0);
        salesProfit += (sellingPrice - purchasePrice);
      } else if (t.transactionType === 'redemption') {
        // Dla wykupów: zysk = kwota wykupu - kwota pożyczki
        // redemptionPrice to kwota do zapłaty, totalAmount to kwota pożyczki
        const redemptionAmount = t.redemptionPrice || 0; // kwota do zapłaty
        const loanAmount = t.totalAmount; // kwota pożyczki
        redemptionProfit += (redemptionAmount - loanAmount);
      }
    });

    this.stats.salesProfit = salesProfit;
    this.stats.redemptionProfit = redemptionProfit;
    this.stats.totalProfit = salesProfit + redemptionProfit;
  }

  calculateTopEmployees(transactions: Transaction[]): void {
    const employeeStats = new Map<string, { count: number; revenue: number; profit: number }>();

    transactions.forEach(t => {
      const employeeName = t.employeeName;
      const current = employeeStats.get(employeeName) || { count: 0, revenue: 0, profit: 0 };
      current.count++;
      current.revenue += t.totalAmount;

      // Oblicz zysk dla tego pracownika
      if (t.transactionType === 'sale') {
        const sellingPrice = t.totalAmount;
        const purchasePrice = t.items.reduce((sum, item) => sum + item.price, 0);
        current.profit += (sellingPrice - purchasePrice);
      } else if (t.transactionType === 'redemption') {
        // Dla wykupów: zysk = redemptionPrice - totalAmount
        const redemptionAmount = t.redemptionPrice || 0;
        const loanAmount = t.totalAmount;
        current.profit += (redemptionAmount - loanAmount);
      }

      employeeStats.set(employeeName, current);
    });

    this.stats.topEmployees = Array.from(employeeStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }

  calculateMonthlyData(transactions: Transaction[]): void {
    const monthlyStats = new Map<string, { revenue: number; transactions: number; profit: number }>();

    transactions.forEach(t => {
      const date = new Date(t.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const current = monthlyStats.get(monthKey) || { revenue: 0, transactions: 0, profit: 0 };
      current.revenue += t.totalAmount;
      current.transactions++;

      // Oblicz zysk dla tego miesiąca
      if (t.transactionType === 'sale') {
        const sellingPrice = t.totalAmount;
        const purchasePrice = t.items.reduce((sum, item) => sum + item.price, 0);
        current.profit += (sellingPrice - purchasePrice);
      } else if (t.transactionType === 'redemption') {
        // Dla wykupów: zysk = redemptionPrice - totalAmount
        const redemptionAmount = t.redemptionPrice || 0;
        const loanAmount = t.totalAmount;
        current.profit += (redemptionAmount - loanAmount);
      }

      monthlyStats.set(monthKey, current);
    });

    this.stats.monthlyData = Array.from(monthlyStats.entries())
      .map(([key, stats]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' });
        return { month: monthName, ...stats };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  calculateCategoryData(transactions: Transaction[]): void {
    const categoryStats = new Map<number, { count: number; revenue: number; profit: number }>();

    transactions.forEach(t => {
      t.items.forEach(item => {
        const categoryId = item.categoryId;
        const current = categoryStats.get(categoryId) || { count: 0, revenue: 0, profit: 0 };
        current.count++;
        current.revenue += item.price;

        // Oblicz zysk dla kategorii
        if (t.transactionType === 'sale') {
          // Dla sprzedaży podziel zysk proporcjonalnie między przedmioty
          const totalItemValue = t.items.reduce((sum, i) => sum + i.price, 0);
          const itemProportion = item.price / totalItemValue;
          const transactionProfit = t.totalAmount - totalItemValue;
          current.profit += (transactionProfit * itemProportion);
        } else if (t.transactionType === 'redemption') {
          // Dla wykupów podziel zysk proporcjonalnie między przedmioty
          const redemptionAmount = t.redemptionPrice || 0;
          const loanAmount = t.totalAmount;
          const totalItemValue = t.items.reduce((sum, i) => sum + i.price, 0);
          const itemProportion = item.price / totalItemValue;
          const transactionProfit = redemptionAmount - loanAmount;
          current.profit += (transactionProfit * itemProportion);
        }

        categoryStats.set(categoryId, current);
      });
    });

    console.log('Dostępne kategorie:', this.categories); // Debug
    console.log('CategoryStats przed mapowaniem:', Array.from(categoryStats.entries())); // Debug

    this.stats.categoryData = Array.from(categoryStats.entries())
      .map(([categoryId, stats]) => {
        const categoryName = this.getCategoryName(categoryId);
        console.log(`Mapowanie kategorii ${categoryId} -> ${categoryName}`); // Debug
        return {
          category: categoryName,
          count: stats.count,
          revenue: stats.revenue,
          profit: stats.profit
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    console.log('Finalne dane kategorii:', this.stats.categoryData);
  }

  applyFilters(): void {
    this.calculateStatistics();
    this.updateCharts();
  }

  clearFilters(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedTransactionType = 'all';
    this.calculateStatistics();
    this.updateCharts();
  }

  initializeCharts(): void {
    if (typeof Chart !== 'undefined') {
      this.createMonthlyChart();
      this.createTransactionTypeChart();
      this.createEmployeeChart();
      this.createProfitChart();
    } else {
      console.warn('Chart.js nie jest załadowane. Zainstaluj: npm install chart.js');
    }
  }

  updateCharts(): void {
    this.destroyCharts();
    setTimeout(() => this.initializeCharts(), 100);
  }

  destroyCharts(): void {
    if (typeof Chart !== 'undefined') {
      [this.monthlyChart, this.typeChart, this.employeeChart, this.profitChart].forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
      this.monthlyChart = undefined;
      this.typeChart = undefined;
      this.employeeChart = undefined;
      this.profitChart = undefined;
    }
  }

  createMonthlyChart(): void {
    if (typeof Chart === 'undefined') return;

    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.stats.monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'Zysk (PLN)',
            data: this.stats.monthlyData.map(d => d.profit),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            tension: 0.1
          },
          {
            label: 'Przychód (PLN)',
            data: this.stats.monthlyData.map(d => d.revenue),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            yAxisID: 'y1'
          },
          {
            label: 'Liczba transakcji',
            data: this.stats.monthlyData.map(d => d.transactions),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Zysk (PLN)'
            }
          },
          y1: {
            type: 'linear',
            display: false,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Liczba transakcji'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }

  createTransactionTypeChart(): void {
    if (typeof Chart === 'undefined') return;

    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.typeChart) {
      this.typeChart.destroy();
    }

    const typeData = [
      { label: 'Zakupy', value: this.stats.totalPurchases, color: '#FF6384' },
      { label: 'Sprzedaże', value: this.stats.totalSales, color: '#36A2EB' },
      { label: 'Zastawy', value: this.stats.totalPawns, color: '#FFCE56' },
      { label: 'Wykupy', value: this.stats.totalRedemptions, color: '#4BC0C0' }
    ];

    this.typeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: typeData.map(d => d.label),
        datasets: [{
          data: typeData.map(d => d.value),
          backgroundColor: typeData.map(d => d.color),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  createEmployeeChart(): void {
    if (typeof Chart === 'undefined') return;

    const ctx = document.getElementById('employeeChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.employeeChart) {
      this.employeeChart.destroy();
    }

    this.employeeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.stats.topEmployees.map(e => e.name),
        datasets: [
          {
            label: 'Zysk (PLN)',
            data: this.stats.topEmployees.map(e => e.profit),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          },
          {
            label: 'Przychód (PLN)',
            data: this.stats.topEmployees.map(e => e.revenue),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          },
          {
            label: 'Liczba transakcji',
            data: this.stats.topEmployees.map(e => e.count),
            backgroundColor: 'rgba(255, 206, 86, 0.8)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            title: {
              display: true,
              text: 'Zysk (PLN)'
            }
          },
          y1: {
            type: 'linear',
            display: false,
            position: 'right',
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            }
          },
          y2: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Liczba transakcji'
            },
            grid: {
              drawOnChartArea: false,
            }
          }
        }
      }
    });
  }

  createProfitChart(): void {
    if (typeof Chart === 'undefined') return;

    const ctx = document.getElementById('profitChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.profitChart) {
      this.profitChart.destroy();
    }

    this.profitChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Zysk ze sprzedaży', 'Zysk z wykupów', 'Całkowity zysk', 'Całkowity przychód'],
        datasets: [{
          label: 'Kwota (PLN)',
          data: [
            this.stats.salesProfit,
            this.stats.redemptionProfit,
            this.stats.totalProfit,
            this.stats.totalRevenue
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(156, 163, 175, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Kwota (PLN)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.y.toLocaleString('pl-PL')} PLN`;
              }
            }
          }
        }
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  }

  exportData(): void {
    const dataStr = JSON.stringify(this.stats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `raport_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
