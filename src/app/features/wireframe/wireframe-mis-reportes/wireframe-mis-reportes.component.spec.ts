import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WireframeMisReportesComponent } from './wireframe-mis-reportes.component';

describe('WireframeMisReportesComponent', () => {
  let fixture: ComponentFixture<WireframeMisReportesComponent>;

  beforeEach(async () => {
    document.body.classList.remove('aqua-wireframe-open');

    await TestBed.configureTestingModule({
      imports: [WireframeMisReportesComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(WireframeMisReportesComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.classList.remove('aqua-wireframe-open');
  });

  it('renderiza el wireframe como espejo de mis reportes con ciudadano logueado', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(text).toContain('AquaComunidad');
    expect(text).toContain('María Ciudadana');
    expect(text).toContain('Consulta tus');
    expect(text).toContain('reportes');
    expect(text).toContain('Revisa el estado, historial y avance de cada incidencia reportada en tu comunidad.');
    expect(text).toContain('Número de consulta');
    expect(text).toContain('Consultar');
    expect(text).toContain('Seguimiento');
    expect(text).toContain('Estado general');
    expect(text).toContain('Pendientes');
    expect(text).toContain('En atención');
    expect(text).toContain('Resueltos');
    expect(text).toContain('Reportes recientes');
    expect(text).toContain('Casos registrados');
    expect(text).toContain('Nuevo reporte');
    expect(text).toContain('Consulta REP-128');
    expect(text).toContain('Estado');
    expect(text).toContain('Distrito');
    expect(text).toContain('Dirección');
    expect(text).toContain('Fecha');
    expect(compiled.querySelector('.wf-shell')).toBeTruthy();
    expect(compiled.querySelector('.wf-footer')).toBeTruthy();
  });

  it('activa el modo wireframe para ocultar widgets globales', () => {
    expect(document.body.classList.contains('aqua-wireframe-open')).toBe(true);
  });
});
