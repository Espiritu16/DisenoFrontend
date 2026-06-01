import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WireframeInicioComponent } from './wireframe-inicio.component';

describe('WireframeInicioComponent', () => {
  let fixture: ComponentFixture<WireframeInicioComponent>;

  beforeEach(async () => {
    document.body.classList.remove('aqua-wireframe-open');

    await TestBed.configureTestingModule({
      imports: [WireframeInicioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(WireframeInicioComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.classList.remove('aqua-wireframe-open');
  });

  it('renderiza el wireframe como espejo del inicio publico con ciudadano logueado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(text).toContain('AquaComunidad');
    expect(text).toContain('María Ciudadana');
    expect(text).toContain('Gestión del agua');
    expect(text).toContain('simple');
    expect(text).toContain('para tu comunidad.');
    expect(text).toContain('Reporta incidencias, revisa avances y mantén trazabilidad clara desde cualquier dispositivo.');
    expect(text).toContain('Reportar ahora');
    expect(text).toContain('Ver plataforma');
    expect(text).toContain('Aliados y referentes en servicios de saneamiento');
    expect(text).toContain('Sedapar');
    expect(text).toContain('Sedalib');
    expect(text).toContain('Sedacusco');
    expect(text).toContain('Epsel');
    expect(text).toContain('Emapa');
    expect(text).toContain('Proceso de atención');
    expect(text).toContain('Desde el reporte ciudadano hasta la resolución con trazabilidad.');
    expect(text).toContain('Reporta');
    expect(text).toContain('Valida');
    expect(text).toContain('Asigna');
    expect(text).toContain('Atiende');
    expect(text).toContain('Consulta');
    expect(text).toContain('Sistema seguro · Portal ciudadano');
    expect(compiled.querySelector('.wf-trust')).toBeTruthy();
    expect(compiled.querySelector('.wf-steps')).toBeTruthy();
    expect(compiled.querySelector('.wf-footer')).toBeTruthy();
  });

  it('activa el modo wireframe para ocultar widgets globales', () => {
    expect(document.body.classList.contains('aqua-wireframe-open')).toBe(true);
  });
});
