import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AquaLogoComponent } from '../aqua-logo/aqua-logo.component';

@Component({
  selector: 'app-aqua-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, AquaLogoComponent],
  templateUrl: './aqua-footer.component.html',
  styleUrl: './aqua-footer.component.css'
})
export class AquaFooterComponent {
  @Input() reportHref = '/reportar';
  @Input() reportsHref = '/mis-reportes';
  @Input() serviceStatusHref = '/estado-servicio';
  @Input() contactHref = '/contacto';

  readonly partners = ['Sedapar', 'Sedalib', 'Sedacusco', 'Epsel', 'Emapa'];
}
