import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginPageComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  username: string = '';
  password: string = '';

  login() {
    if (this.username && this.password) {
      this.loginSuccess.emit();
    } else {
      alert('Wprowadź login i hasło');
    }
  }
}
