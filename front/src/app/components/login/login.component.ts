import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule,
    RouterModule
  ],
  template: `
  <div class="form-container">
    <h1 class="form-title">Iniciar Sesión</h1>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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

      <button type="submit" class="form-button">Ingresar</button>
      
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>

    <div class="links-container">
      <a routerLink="/register">¿No tienes cuenta? Regístrate</a>
    </div>
  </div>
`
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    const { username, password } = this.loginForm.value;
    this.authService.login(username!, password!)
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.errorMessage = 'Invalid credentials'
      });
  }
}