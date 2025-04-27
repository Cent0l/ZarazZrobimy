import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginPageComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  // Poprawiona ścieżka bazowa
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Wprowadź login i hasło';
      return;
    }

    this.loading = true;
    this.error = '';

    // Zmienione z login na username zgodnie z oczekiwaniami API
    const credentials = {
      username: this.username,
      password: this.password
    };

    console.log('Wysyłam żądanie logowania:', credentials);

    // Dodanie nagłówków i poprawiona ścieżka (usunięta duplikacja)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    this.http.post<any>(`${this.baseUrl}/login`, credentials, httpOptions)
      .pipe(
        tap(response => {
          console.log('Odpowiedź serwera:', response);
          // Zapisz token w localStorage
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userLogin', this.username);
          localStorage.setItem('userId', response.id);

          // Powiadom rodzica o udanym logowaniu
          this.loginSuccess.emit();
          this.loading = false;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('Błąd logowania:', err);

          if (err.status === 0) {
            this.error = 'Nie można połączyć się z serwerem. Sprawdź, czy serwer jest uruchomiony.';
          } else {
            this.error = `Błąd logowania (${err.status}): ${err.error?.message || err.message || 'Nieznany błąd'}`;
          }

          this.loading = false;
          return of(null);
        })
      )
      .subscribe();
  }
}
