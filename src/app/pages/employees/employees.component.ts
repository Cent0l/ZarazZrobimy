import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Employee {
  employee_id: number;
  login: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  rank_id: number;
  hire_date: string;
  adress: string;
  phone_number: string;
  email: string;
  status: string;
  id?: string;
}

interface Role {
  role_id: number;
  role_name: string;
  desciption: string;
  permissions_level: number;
  max_buy: number;
  id: string;
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

  // Zmienne dla modala
  showAddModal: boolean = false;
  newEmployee: Employee = {
    employee_id: 0,
    login: '',
    password_hash: '',
    first_name: '',
    last_name: '',
    rank_id: 1,
    hire_date: new Date().toISOString().split('T')[0],
    adress: '',
    phone_number: '',
    email: '',
    status: 'AKTYWNY'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEmployees();
    this.fetchRoles();
  }

  fetchEmployees(): void {
    this.http.get<Employee[]>('http://localhost:3000/employees')
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Wystąpił błąd podczas ładowania pracowników';
          this.isLoading = false;
          console.error('Error fetching employees:', err);
        }
      });
  }

  fetchRoles(): void {
    this.http.get<Role[]>('http://localhost:3000/roles')
      .subscribe({
        next: (data) => {
          this.roles = data;
        },
        error: (err) => {
          console.error('Error fetching roles:', err);
        }
      });
  }

  getRoleName(rankId: number): string {
    const role = this.roles.find(r => r.role_id === rankId);
    return role ? role.role_name : 'Nieznana rola';
  }

  getTransactionLimit(rankId: number): number {
    const role = this.roles.find(r => r.role_id === rankId);
    return role ? role.max_buy : 0;
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetNewEmployeeForm();
  }

  resetNewEmployeeForm(): void {
    this.newEmployee = {
      employee_id: 0,
      login: '',
      password_hash: '',
      first_name: '',
      last_name: '',
      rank_id: 1,
      hire_date: new Date().toISOString().split('T')[0],
      adress: '',
      phone_number: '',
      email: '',
      status: 'AKTYWNY'
    };
  }

  addEmployee(): void {
    // Rzutowanie rank_id na number (na wypadek gdyby był stringiem z <select>)
    this.newEmployee.rank_id = Number(this.newEmployee.rank_id);

    // Generowanie tymczasowego ID (w rzeczywistej aplikacji powinno pochodzić z backendu)
    this.newEmployee.employee_id = Math.max(...this.employees.map(e => e.employee_id), 0) + 1;

    this.http.post<Employee>('http://localhost:3000/employees', this.newEmployee)
      .subscribe({
        next: (addedEmployee) => {
          this.employees.push(addedEmployee);
          this.closeAddModal();
        },
        error: (err) => {
          console.error('Error adding employee:', err);
          this.error = 'Wystąpił błąd podczas dodawania pracownika';
        }
      });
  }
}
