import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-aqua-logo',
  standalone: true,
  templateUrl: './aqua-logo.component.html',
  styleUrl: './aqua-logo.component.css'
})
export class AquaLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
