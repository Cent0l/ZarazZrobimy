import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    LoginPageComponent,
    DashboardComponent,
    CommonModule
  ],
  template: `
    <div class="app-container">
      <app-login
        *ngIf="!isLoggedIn"
        (loginSuccess)="onLoginSuccess()"
      ></app-login>

      <app-dashboard
        *ngIf="isLoggedIn"
      ></app-dashboard>
    </div>
  `
})
export class AppComponent {
  isLoggedIn = false;

  onLoginSuccess() {
    this.isLoggedIn = true;
  }
}
