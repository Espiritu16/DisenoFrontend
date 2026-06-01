import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WireframeContactoComponent } from './wireframe-contacto.component';

describe('WireframeContactoComponent', () => {
  let fixture: ComponentFixture<WireframeContactoComponent>;

  beforeEach(async () => {
    document.body.classList.remove('aqua-wireframe-open');

    await TestBed.configureTestingModule({
      imports: [WireframeContactoComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(WireframeContactoComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.classList.remove('aqua-wireframe-open');
  });

  it('renderiza el wireframe como espejo de contacto con ciudadano logueado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(text).toContain('AquaComunidad');
    expect(text).toContain('María Ciudadana');
    expect(text).toContain('Contacta con AquaComunidad');
    expect(text).toContain('Encuentra canales de atención para consultas, soporte y seguimiento de incidencias.');
    expect(text).toContain('Horario de atención');
    expect(text).toContain('Emergencias');
    expect(text).toContain('Cobertura');
    expect(text).toContain('Teléfono principal');
    expect(text).toContain('Soporte técnico');
    expect(text).toContain('WhatsApp general');
    expect(text).toContain('WhatsApp soporte');
    expect(text).toContain('+51 999 000 111');
    expect(text).toContain('+51 944 555 221');
    expect(text).toContain('Lo que puedes resolver:');
    expect(text).toContain('Abrir WhatsApp');
    expect(compiled.querySelectorAll('.wf-contact-card')).toHaveLength(4);
    expect(compiled.querySelectorAll('.wf-quick__item')).toHaveLength(3);
  });

  it('activa el modo wireframe para ocultar widgets globales', () => {
    expect(document.body.classList.contains('aqua-wireframe-open')).toBe(true);
  });
});
