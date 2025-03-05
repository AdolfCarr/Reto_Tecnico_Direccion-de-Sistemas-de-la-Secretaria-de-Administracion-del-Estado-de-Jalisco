import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html', // Usar archivo HTML externo
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm = new FormGroup({
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
    // Mostrar errores al hacer clic en "Registrarse"
    this.showErrors = true;

    // Verificar si el formulario es inválido
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const { username, password } = this.registerForm.value;
    this.authService.register(username!, password!)
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (error) => this.errorMessage = error.message || 'Error en el registro'
      });
  }
}