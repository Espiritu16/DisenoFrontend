import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { authTokenInterceptor } from './core/api/auth-token.interceptor';
import { mockApiInterceptor } from '../demo/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // `mockApiInterceptor` va primero: resuelve toda la API contra datos en memoria
    // y ninguna petición llega a salir a la red. Sólo existe en la rama `demo`.
    provideHttpClient(withInterceptors([mockApiInterceptor, authTokenInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    )
  ]
};
