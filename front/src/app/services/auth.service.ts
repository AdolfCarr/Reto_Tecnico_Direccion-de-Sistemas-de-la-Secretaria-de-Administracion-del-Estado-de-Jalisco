import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.backendUrl;

  constructor(private http: HttpClient,
    private router: Router
  ) { }

  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.access_token);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  register(username: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/users/register`,
      { username, password },
      { responseType: 'text' } // Añadir si el backend no devuelve JSON
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);// Redirige al login
  }

  syncData() {
    return this.http.post(`${this.apiUrl}/data/sync`, {});
  }
}