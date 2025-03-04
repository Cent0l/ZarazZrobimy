import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <h2>Logowanie</h2>
      <form (ngSubmit)="login()">
        <div class="form-group">
          <label>Login:</label>
          <input
            type="text"
            [(ngModel)]="username"
            name="username"
            required
          >
        </div>
        <div class="form-group">
          <label>Hasło:</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
          >
        </div>
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .form-group {
      margin-bottom: 15px;
      width: 300px;
    }
    input {
      width: 100%;
      padding: 10px;
      margin-top: 5px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
    }
  `]
})
export class LoginPageComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  username: string = '';
  password: string = '';

  login() {
    // Na razie prosta symulacja logowania bo backend spi
    if (this.username && this.password) {
      this.loginSuccess.emit();
    } else {
      alert('Wprowadź login i hasło');
    }
  }
}
