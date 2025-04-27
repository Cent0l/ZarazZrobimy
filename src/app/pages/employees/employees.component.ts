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
  roles: Role[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  // Zmienne dla logowania
  showLoginModal: boolean = false;
  loginInProgress: boolean = false;
  loginCredentials = {
    username: '',
    password: ''
  };
  authToken: string | null = null;

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
