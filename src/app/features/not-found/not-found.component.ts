import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-background p-container-margin">
      <section class="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-xl text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h1 class="text-h1 font-h1 text-primary">404</h1>
        <p class="text-body-lg text-on-surface mt-sm">Página no encontrada</p>
        <a routerLink="/inicio" class="inline-block mt-lg bg-primary-container text-on-primary px-lg py-sm rounded-lg">Ir a inicio</a>
      </section>
    </main>
  `
})
export class NotFoundComponent {}
