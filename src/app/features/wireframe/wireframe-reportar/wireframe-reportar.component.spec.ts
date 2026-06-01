import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WireframeReportarComponent } from './wireframe-reportar.component';

describe('WireframeReportarComponent', () => {
  let fixture: ComponentFixture<WireframeReportarComponent>;

  beforeEach(async () => {
    document.body.classList.remove('aqua-wireframe-open');

    await TestBed.configureTestingModule({
      imports: [WireframeReportarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(WireframeReportarComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.classList.remove('aqua-wireframe-open');
  });

  it('renderiza el wireframe como espejo de reportar con ciudadano logueado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(text).toContain('AquaComunidad');
    expect(text).toContain('María Ciudadana');
    expect(text).toContain('Reporta una');
    expect(text).toContain('incidencia');
    expect(text).toContain('Ubica el problema, adjunta evidencia y envía tu reporte para iniciar el seguimiento.');
    expect(text).toContain('Iniciar reporte');
    expect(text).toContain('Distrito');
    expect(text).toContain('Tipo de incidencia');
    expect(text).toContain('Fuga');
    expect(text).toContain('Baja presión');
    expect(text).toContain('Agua turbia');
    expect(text).toContain('Corte');
    expect(text).toContain('Seleccionar ubicación en mapa');
    expect(text).toContain('Dirección detectada');
    expect(text).toContain('Referencia');
    expect(text).toContain('Descripción');
    expect(text).toContain('Evidencia');
    expect(text).toContain('Adjuntar fotos');
    expect(text).toContain('Siguiente');
    expect(text).toContain('Usar mi ubicación');
    expect(text).toContain('Confirmar ubicación');
    expect(compiled.querySelector('.wf-workspace')).toBeTruthy();
    expect(compiled.querySelector('[aria-label="Mapa de ubicación"]')).toBeTruthy();
    expect(compiled.querySelector('.wf-map-canvas')).toBeTruthy();
  });

  it('activa el modo wireframe para ocultar widgets globales', () => {
    expect(document.body.classList.contains('aqua-wireframe-open')).toBe(true);
  });
});
