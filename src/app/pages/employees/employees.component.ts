import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Role {
  id: number;
  roleName: string;
  description: string;
  permissionsLevel: number;
  maxBuy: number;
}

interface Employee {
  id?: number;
  login: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: Role;  // Changed from roleId to role object
  hireDate: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: string;
}

interface AuthResponse {
  token: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  originalEmployees: Employee[] = []; // Dla resetu sortowania
  roles: Role[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;

  // Zmienne dla logowania
  showLoginModal: boolean = false;
  loginInProgress: boolean = false;
  loginCredentials = {
    username: '',
    password: ''
  };
  authToken: string | null = null;

  // Zmienne dla sortowania
  sortColumn: keyof Employee | 'roleName' | 'status' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Zmienne dla modala zmiany statusu
  showStatusModal: boolean = false;
  employeeToUpdateStatus: Employee | null = null;
  newStatus: string = '';
  statusInProgress: boolean = false;
  availableStatuses = [
    { value: 'active', label: 'AKTYWNY' },
    { value: 'inactive', label: 'NIEAKTYWNY' },
    { value: 'on_leave', label: 'URLOP' },
    { value: 'terminated', label: 'ZWOLNIONY' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Próba pobrania tokenu z localStorage
    this.authToken = localStorage.getItem('authToken');

    if (this.authToken) {
      this.fetchEmployees();
    } else {
      this.showLoginModal = true;
      this.isLoading = false;
    }
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
          this.fetchEmployees();
        },
        error: (err) => {
          console.error('Błąd logowania:', err);
          this.error = 'Błąd logowania. Sprawdź dane logowania.';
          this.loginInProgress = false;

          // Dla celów testowych, umożliwiamy przejście dalej nawet bez logowania
          if (confirm('Czy chcesz przejść do testowego widoku listy pracowników?')) {
            this.showLoginModal = false;
            this.isLoading = true;
            this.testFetchEmployees();
          }
        }
      });
  }

  // Sortowanie pracowników
  sortData(column: keyof Employee | 'roleName' | 'status'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.employees.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Special handling for nested or custom properties
      if (column === 'roleName') {
        aValue = a.role?.roleName || '';
        bValue = b.role?.roleName || '';
      } else if (column === 'status') {
        aValue = this.getStatusDisplay(a.status);
        bValue = this.getStatusDisplay(b.status);
      } else {
        aValue = a[column as keyof Employee];
        bValue = b[column as keyof Employee];
      }

      // Handle different value types appropriately
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const strA = String(aValue || '').toLowerCase();
        const strB = String(bValue || '').toLowerCase();
        return this.sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });
  }

  resetSort(): void {
    this.sortColumn = 'id';
    this.sortDirection = 'asc';
    this.employees = [...this.originalEmployees];
  }

  // Metoda dla celów testowych, która używa json-server
  testFetchEmployees(): void {
    // Używamy starego endpointu json-server
    this.http.get<any[]>('http://localhost:3000/employees')
      .subscribe({
        next: (data) => {
          // Mapujemy dane ze starego formatu na nowy
          this.employees = data.map(emp => {
            const roleId = emp.rank_id;
            // Stwórz podstawowy obiekt roli (zostanie zaktualizowany po pobraniu ról)
            const role: Role = {
              id: roleId,
              roleName: 'Ładowanie...',
              description: '',
              permissionsLevel: 0,
              maxBuy: 0
            };

            return {
              id: emp.employee_id,
              login: emp.login,
              firstName: emp.first_name,
              lastName: emp.last_name,
              role: role,  // Używamy obiektu roli zamiast roleId
              hireDate: emp.hire_date,
              address: emp.adress,
              phoneNumber: emp.phone_number,
              email: emp.email,
              status: this.mapStatus(emp.status)
            };
          });
          this.originalEmployees = [...this.employees];
          this.isLoading = false;
          this.testFetchRoles();
        },
        error: (err) => {
          console.error('Błąd pobierania danych testowych:', err);
          this.error = 'Nie można pobrać testowych danych pracowników.';
          this.isLoading = false;
        }
      });
  }

  testFetchRoles(): void {
    this.http.get<any[]>('http://localhost:3000/roles')
      .subscribe({
        next: (data) => {
          this.roles = data.map(role => ({
            id: role.role_id,
            roleName: role.role_name,
            description: role.desciption,
            permissionsLevel: role.permissions_level,
            maxBuy: role.max_buy
          }));

          // Po pobraniu ról, aktualizujemy informacje o rolach w pracownikach
          this.employees = this.employees.map(emp => {
            const matchingRole = this.roles.find(r => r.id === emp.role.id);
            if (matchingRole) {
              emp.role = matchingRole;
            }
            return emp;
          });
          this.originalEmployees = [...this.employees];
        },
        error: (err) => {
          console.error('Błąd pobierania ról testowych:', err);
        }
      });
  }

  mapStatus(oldStatus: string): string {
    // Mapowanie ze starego formatu statusu na nowy
    if (oldStatus === 'AKTYWNY') return 'active';
    if (oldStatus === 'NIEAKTYWNY') return 'inactive';
    if (oldStatus === 'URLOP') return 'on_leave';
    if (oldStatus === 'ZWOLNIONY') return 'terminated';
    return 'active';
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  fetchEmployees(): void {
    this.http.get<Employee[]>('/api/employees', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.employees = data;
        this.originalEmployees = [...data]; // Kopia dla resetu sortowania
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd pobierania pracowników:', err);
        if (err.status === 401) {
          this.error = 'Błąd autoryzacji. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        } else {
          this.error = `Błąd podczas pobierania danych pracowników: ${err.message}`;
          this.testFetchEmployees();
        }
        this.isLoading = false;
      }
    });
  }

  // Modal zmiany statusu pracownika
  openStatusModal(employee: Employee): void {
    this.employeeToUpdateStatus = employee;
    this.newStatus = employee.status; // Domyślnie wybrany obecny status
    this.showStatusModal = true;
    this.error = null;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.employeeToUpdateStatus = null;
    this.error = null;
  }

  updateEmployeeStatus(): void {
    if (!this.employeeToUpdateStatus || !this.employeeToUpdateStatus.id) {
      this.error = "Nie można znaleźć wybranego pracownika.";
      return;
    }

    this.statusInProgress = true;
    this.error = null;

    // Przygotowanie danych do wysłania
    const statusUpdate = {
      status: this.newStatus
    };

    // Wywołanie API
    this.http.patch<Employee>(`/api/employees/${this.employeeToUpdateStatus.id}/status`, statusUpdate, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (updatedEmployee) => {
        // Aktualizacja pracownika na liście
        const index = this.employees.findIndex(e => e.id === updatedEmployee.id);
        if (index !== -1) {
          this.employees[index].status = updatedEmployee.status;
        }
        // Również aktualizacja w originalEmployees
        const originalIndex = this.originalEmployees.findIndex(e => e.id === updatedEmployee.id);
        if (originalIndex !== -1) {
          this.originalEmployees[originalIndex].status = updatedEmployee.status;
        }

        this.statusInProgress = false;
        this.showStatusModal = false;
        this.successMessage = `Status pracownika ${updatedEmployee.firstName} ${updatedEmployee.lastName} został zmieniony na ${this.getStatusDisplay(updatedEmployee.status)}.`;

        // Ukryj wiadomość po 3 sekundach
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd aktualizacji statusu pracownika:', err);
        this.statusInProgress = false;

        if (err.status === 401) {
          this.error = 'Sesja wygasła. Proszę zalogować się ponownie.';
          this.authToken = null;
          localStorage.removeItem('authToken');
          this.showLoginModal = true;
        } else {
          this.error = `Nie udało się zaktualizować statusu: ${err.message || 'Nieznany błąd'}`;
        }
      }
    });
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'AKTYWNY',
      'inactive': 'NIEAKTYWNY',
      'on_leave': 'URLOP',
      'terminated': 'ZWOLNIONY'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'bg-success',
      'inactive': 'bg-secondary',
      'on_leave': 'bg-warning text-dark',
      'terminated': 'bg-danger'
    };
    return statusClasses[status] || 'bg-primary';
  }

  getRoleBadgeClass(roleId: number): string {
    // Unikalne kolory dla każdej roli
    switch (roleId) {
      case 1: return 'bg-danger';          // admin - czerwony
      case 2: return 'bg-primary';          // Właściciel - niebieski
      case 3: return 'bg-warning';          // Specjalista - żółty
      case 4: return 'bg-info text-dark';    // Specjalista (drugi) - jasnoniebieski
      case 5: return 'bg-success';          // Pracownik z stażem 2 lata+ - zielony
      case 6: return 'bg-secondary';        // Nowy Pracownik - szary
      default: return 'bg-dark text-white'; // Domyślnie ciemny
    }
  }
}
