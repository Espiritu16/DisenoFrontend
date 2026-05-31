import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MisReportesComponent } from './mis-reportes.component';

describe('MisReportesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReportesComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('renderiza la plantilla publica de mis reportes', () => {
    const fixture = TestBed.createComponent(MisReportesComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(compiled.querySelector('app-aqua-header')).toBeTruthy();
    expect(compiled.querySelector('.reports-main')).toBeTruthy();
    expect(compiled.querySelector('.reports-shell')).toBeTruthy();
    expect(compiled.querySelector('app-aqua-footer')).toBeTruthy();
    expect(text).toContain('Consulta tus reportes');
    expect(text).toContain('Número de consulta');
    expect(text).toContain('Consultar');
    expect(text).toContain('Estado general');
    expect(text).toContain('Casos registrados');
    expect(text).toContain('Selecciona un reporte');
  });

  it('muestra el codigo consultado y centra el panel de reportes', () => {
    const fixture = TestBed.createComponent(MisReportesComponent);
    fixture.componentInstance.queryCode = 'AC-207956';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector<HTMLElement>('.reports-shell');
    const scrollSpy = vi.fn();

    expect(panel).toBeTruthy();
    panel!.scrollIntoView = scrollSpy;
    fixture.componentInstance.consultReport();

    expect(fixture.componentInstance.consultedCode).toBe('AC-207956');
  });
});
