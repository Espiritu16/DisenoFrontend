import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InicioComponent } from './inicio.component';

describe('InicioComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renderiza la base visual de inicio sin widget flotante', async () => {
    const fixture = TestBed.createComponent(InicioComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(compiled.querySelector('.aqua-phone')).toBeNull();
    expect(compiled.querySelector('.aqua-trust')).toBeTruthy();
    expect(compiled.querySelector('.aqua-steps')).toBeTruthy();
    expect(compiled.querySelector('.aqua-footer')).toBeTruthy();
    expect(text).toContain('Gestión del agua simple');
    expect(text).toContain('AquaComunidad');
    expect(text).toContain('Proceso de atención');
    expect(text).toContain('Reporta');
    expect(text).toContain('Valida');
    expect(text).toContain('Asigna');
    expect(text).toContain('Atiende');
    expect(text).toContain('Consulta');
    expect(text).toContain('Sistema seguro · Portal ciudadano');
    expect(compiled.querySelector('img[alt="Sedapar"]')).toBeTruthy();
    expect(compiled.querySelector('img[alt="Sedalib"]')).toBeTruthy();
    expect(compiled.querySelector('img[alt="Sedacusco"]')).toBeTruthy();
    expect(compiled.querySelector('img[alt="Epsel"]')).toBeTruthy();
    expect(compiled.querySelector('img[alt="Emapa"]')).toBeTruthy();
    expect(compiled.querySelector('[aria-label="Abrir chat de AQUACOMUNIDAD"]')).toBeNull();
    expect(compiled.querySelector('.aqua-chat')).toBeNull();
  });
});
