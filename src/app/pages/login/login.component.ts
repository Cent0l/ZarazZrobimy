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
    // Podstawowa walidacja formularza
    if (!this.username || !this.password) {
      this.error = 'Wprowadź login i hasło';
      return;
    }

    this.loading = true;
    this.error = '';

    // Przygotowanie danych logowania
    const credentials = {
      username: this.username,
      password: this.password
    };

    console.log('Wysyłam żądanie logowania:', credentials);

    // Konfiguracja nagłówków
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
          this.handleLoginError(err);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Obsługa różnych kodów błędów HTTP
   */
  private handleLoginError(err: HttpErrorResponse): void {
    if (!err.status) {
      this.error = 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe lub skontaktuj się z administratorem.';
      return;
    }

    switch (err.status) {
      case 401:
        this.error = 'Nieprawidłowy login lub hasło. Spróbuj ponownie.';
        break;
      case 403:
        this.error = 'Brak uprawnień do zalogowania się. Skontaktuj się z administratorem.';
        break;
      case 404:
        this.error = 'Serwer nie znalazł usługi logowania. Skontaktuj się z administratorem.';
        break;
      case 429:
        this.error = 'Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        this.error = 'Błąd serwera. Spróbuj ponownie później lub skontaktuj się z administratorem.';
        break;
      default:
        // Jeśli serwer przesłał specyficzny komunikat błędu, używamy go
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.error = `Błąd logowania: ${err.error.message}`;
        } else if (err.error && typeof err.error === 'string') {
          this.error = `Błąd logowania: ${err.error}`;
        } else {
          this.error = `Wystąpił nieoczekiwany błąd (${err.status}). Spróbuj ponownie lub skontaktuj się z administratorem.`;
        }
    }
  }
}
