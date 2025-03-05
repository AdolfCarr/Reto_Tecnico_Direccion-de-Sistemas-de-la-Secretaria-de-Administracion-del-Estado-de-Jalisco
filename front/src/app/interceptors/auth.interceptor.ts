import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const token = authService.getToken();

  console.log('Interceptor ejecutado');

  if (token) {
    console.log('Token:', token);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
   // Manejar la respuesta y capturar errores
   return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error:', error);
      if (error.status === 401) { // Si el error es 401 (Unauthorized)
        console.error('Error 401: Sesión expirada', error);
        toastr.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Error', {
          timeOut: 5000, // Duración del toast
          positionClass: 'toast-center', // Clase personalizada para centrar el toast
        }).onHidden.subscribe(() => {
          authService.logout(true); // Cerrar sesión y redirigir al login
        });
      }
      return throwError(() => error); // Reenviar el error
    })
  );
};