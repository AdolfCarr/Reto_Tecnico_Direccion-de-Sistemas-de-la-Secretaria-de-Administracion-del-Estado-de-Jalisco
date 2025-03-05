import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom([
      BrowserAnimationsModule, // Necesario para las animaciones de toastr
      ToastrModule.forRoot({   // Configuración global de toastr
        timeOut: 5000,         // Duración del toast en milisegundos
        positionClass:  'toast-center', // Clase personalizada para centrar el toast
        preventDuplicates: true,
      }),
    ]),
  ],
};

