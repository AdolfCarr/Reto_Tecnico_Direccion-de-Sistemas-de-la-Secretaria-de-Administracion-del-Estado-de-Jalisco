// components/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; 

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>
    <button (click)="logout()">Logout</button>
  `
})
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();// Llama al método logout del servicio
    //window.location.reload();
  }
}