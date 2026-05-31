import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactoComponent } from './contacto.component';

describe('ContactoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renderiza la plantilla publica de contacto', () => {
    const fixture = TestBed.createComponent(ContactoComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(compiled.querySelector('app-aqua-header')).toBeTruthy();
    expect(compiled.querySelector('.contact-main')).toBeTruthy();
    expect(compiled.querySelector('.contact-shell')).toBeTruthy();
    expect(compiled.querySelector('app-aqua-footer')).toBeTruthy();
    expect(text).toContain('Contacta con AquaComunidad');
    expect(text).toContain('Horario de atención');
    expect(text).toContain('Teléfono principal');
    expect(text).toContain('Soporte técnico');
    expect(text).toContain('WhatsApp soporte');
  });
});
