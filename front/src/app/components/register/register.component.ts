// components/register/register.component.ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
//import { Router } from '@angular/router';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule,
    RouterModule],
  template: `
    <div class="form-container">
      <h1 class="form-title">Crear Cuenta</h1>
      
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <input
            type="text"
            class="form-input"
            formControlName="username"
            placeholder="Nombre de usuario"
          >
        </div>
        
        <div class="form-group">
          <input
            type="password"
            class="form-input"
            formControlName="password"
            placeholder="Contraseña"
          >
        </div>
  
        <button type="submit" class="form-button">Registrarse</button>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
  
      <div class="links-container">
        <a routerLink="/login">¿Ya tienes cuenta? Inicia Sesión</a>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    const { username, password } = this.registerForm.value;

    if (!username || !password) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    this.authService.register(username, password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Registration failed';
      }
    });
  }
}