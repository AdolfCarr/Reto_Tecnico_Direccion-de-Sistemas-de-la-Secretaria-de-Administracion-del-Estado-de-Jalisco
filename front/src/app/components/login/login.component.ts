import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html', // Usar archivo HTML externo
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  showErrors = false; // Controla si se muestran los mensajes de error
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    // Mostrar errores al hacer clic en "Ingresar"
    this.showErrors = true;

    // Verificar si el formulario es inválido
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const { username, password } = this.loginForm.value;
    this.authService.login(username!, password!)
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.errorMessage = 'Credenciales inválidas'
      });
  }
}