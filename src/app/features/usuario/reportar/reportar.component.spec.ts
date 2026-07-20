import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/api/auth.service';
import { ReportesService } from '../../../core/api/reportes.service';
import { UploadService } from '../../../core/api/upload.service';
import { ReportarComponent } from './reportar.component';

describe('ReportarComponent', () => {
  const uploadService = {
    subirReportes: vi.fn(() => of({ url: 'https://x/fuga.png', nombreArchivo: 'fuga.png' }))
  };
  const reportesService = {
    crear: vi.fn(() => of({
      id: 45,
      usuarioId: 10,
      tipo: 'Fuga',
      descripcion: 'Fuga visible en la vereda.',
      fotoUrl: 'https://x/fuga.png',
      fotoUrls: ['https://x/fuga.png'],
      lat: -12.0464,
      lng: -77.0428,
      direccion: 'Av. Principal 123',
      zona: 'Ate',
      posibleDuplicado: false,
      estado: 'PENDIENTE',
      fechaCreacion: '2026-05-30T15:00:00',
      fechaActualizacion: '2026-05-30T15:00:00'
    }))
  };
  const authService = {
    get token() {
      return 'token-test';
    }
  };

  beforeEach(async () => {
    uploadService.subirReportes.mockClear();
    reportesService.crear.mockClear();
    document.body.classList.remove('aqua-map-open');

    await TestBed.configureTestingModule({
      imports: [ReportarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UploadService, useValue: uploadService },
        { provide: ReportesService, useValue: reportesService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    document.body.classList.remove('aqua-map-open');
  });

  it('renderiza la base publica con body disponible para el formulario', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(compiled.querySelector('app-aqua-header')).toBeTruthy();
    expect(compiled.querySelector('.report-main')).toBeTruthy();
    expect(compiled.querySelector('.report-workspace')).toBeTruthy();
    expect(compiled.querySelector('.report-panel--form')).toBeTruthy();
    expect(compiled.querySelector('.report-panel--map')).toBeTruthy();
    expect(compiled.querySelector('app-aqua-footer')).toBeTruthy();
    expect(text).toContain('AquaComunidad');
    expect(text).toContain('Reportar');
    expect(text).toContain('Reporta una incidencia');
    expect(text).toContain('Iniciar reporte');
    expect(text).toContain('Distrito');
    expect(text).toContain('Selecciona distrito');
    expect(text).not.toContain('Cercado de Lima');
    expect(text).toContain('Tipo de incidencia');
    expect(text).toContain('Seleccionar ubicación en mapa');
    expect(text).toContain('Dirección detectada');
    expect(text).toContain('Evidencia');
    expect(text).toContain('Siguiente');
    expect(text).not.toContain('Datos del reporte');
    expect(text).not.toContain('Ubicación exacta');
  });

  it('abre y cierra el selector de mapa movil sin conservar el scroll bloqueado', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const openButton = compiled.querySelector<HTMLButtonElement>('.report-map-open');

    openButton?.click();
    fixture.detectChanges();

    expect(component.mapSheetOpen).toBe(true);
    expect(document.body.classList.contains('aqua-map-open')).toBe(true);
    expect(compiled.querySelector('.report-panel--map-open')).toBeTruthy();

    const closeButton = compiled.querySelector<HTMLButtonElement>('.report-map-close');
    closeButton?.click();
    fixture.detectChanges();

    expect(component.mapSheetOpen).toBe(false);
    expect(document.body.classList.contains('aqua-map-open')).toBe(false);
  });

  it('confirma ubicacion sin desplazar la pagina ni abrir teclado', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ReportarComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const addressInput = compiled.querySelector<HTMLInputElement>('#report-address');
      const focusSpy = vi.spyOn(addressInput as HTMLInputElement, 'focus');
      const scrollSpy = vi.fn();
      Object.defineProperty(addressInput, 'scrollIntoView', {
        configurable: true,
        value: scrollSpy
      });

      component.openMapSelector();
      component.confirmMapLocation();
      vi.runAllTimers();

      expect(component.mapSheetOpen).toBe(false);
      expect(document.body.classList.contains('aqua-map-open')).toBe(false);
      expect(focusSpy).not.toHaveBeenCalled();
      expect(scrollSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('abre el selector de distrito y actualiza la seleccion', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = compiled.querySelector<HTMLButtonElement>('.report-select__trigger');

    trigger?.click();
    fixture.detectChanges();

    const options = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.report-select__option'));
    const ateOption = options.find((option) => option.textContent?.trim() === 'Ate');

    expect(compiled.querySelector('.report-select__menu')).toBeTruthy();
    ateOption?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.distrito).toBe('Ate');
    expect(compiled.querySelector('.report-select__menu')).toBeNull();
  });

  it('bloquea el scroll de la pagina y desplaza la lista cuando el selector esta abierto', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = compiled.querySelector<HTMLButtonElement>('.report-select__trigger');

    trigger?.click();
    fixture.detectChanges();

    const menu = compiled.querySelector<HTMLElement>('.report-select__menu');
    const wheelEvent = new WheelEvent('wheel', { cancelable: true, deltaY: 80 });

    expect(menu).toBeTruthy();
    document.dispatchEvent(wheelEvent);

    expect(wheelEvent.defaultPrevented).toBe(true);
    expect(menu?.scrollTop).toBe(80);
  });

  it('muestra una vista previa modal al seleccionar una evidencia', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    fixture.componentInstance.evidenceImages = [
      {
        id: 'evidence-1',
        name: 'fuga.png',
        sizeLabel: '0.10 MB',
        previewUrl: 'blob://fuga',
        file: new File(['x'], 'fuga.png', { type: 'image/png' })
      }
    ];

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const evidenceCard = compiled.querySelector<HTMLButtonElement>('.report-evidence-preview');

    evidenceCard?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.report-modal')).toBeTruthy();
    expect(compiled.textContent).toContain('fuga.png');
  });

  it('permite quitar una evidencia seleccionada', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    const component = fixture.componentInstance;
    component.evidenceImages = [
      {
        id: 'evidence-1',
        name: 'fuga.png',
        sizeLabel: '0.10 MB',
        previewUrl: 'blob://fuga',
        file: new File(['x'], 'fuga.png', { type: 'image/png' })
      }
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const removeButton = compiled.querySelector<HTMLButtonElement>('.report-evidence-remove');

    removeButton?.click();
    fixture.detectChanges();

    expect(component.evidenceImages).toHaveLength(0);
    expect(compiled.textContent).toContain('Las fotos aparecerán aquí.');
  });

  it('muestra la validacion sin desplazar ni enfocar el campo con problema', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ReportarComponent);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const districtTrigger = compiled.querySelector<HTMLButtonElement>('.report-select__trigger');
      const scrollSpy = vi.fn();
      const focusSpy = vi.spyOn(districtTrigger as HTMLButtonElement, 'focus');
      Object.defineProperty(districtTrigger, 'scrollIntoView', {
        configurable: true,
        value: scrollSpy
      });

      const nextButton = compiled.querySelector<HTMLButtonElement>('.report-next');
      nextButton?.click();
      vi.runAllTimers();

      expect(fixture.componentInstance.submitMessage).toBe('Selecciona el distrito donde ocurre la incidencia.');
      expect(scrollSpy).not.toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('marca el campo con error en rojo y el campo completo en verde', () => {
    const errorFixture = TestBed.createComponent(ReportarComponent);
    errorFixture.detectChanges();

    const compiled = errorFixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.report-next')?.click();
    errorFixture.detectChanges();

    const districtField = compiled.querySelector('#report-district')?.closest('.report-field');
    expect(districtField?.classList.contains('report-field--error')).toBe(true);
    expect(compiled.querySelector('.report-feedback--error')?.textContent).toContain('Selecciona el distrito');

    const validFixture = TestBed.createComponent(ReportarComponent);
    validFixture.componentInstance.distrito = 'Cercado de Lima';
    validFixture.detectChanges();
    const validCompiled = validFixture.nativeElement as HTMLElement;
    const validDistrictField = validCompiled.querySelector('#report-district')?.closest('.report-field');

    expect(validDistrictField?.classList.contains('report-field--error')).toBe(false);
    expect(validDistrictField?.classList.contains('report-field--valid')).toBe(true);
  });

  it('muestra cada validacion pendiente sin mover automaticamente la vista', () => {
    vi.useFakeTimers();
    try {
      const locationFixture = TestBed.createComponent(ReportarComponent);
      const locationComponent = locationFixture.componentInstance;
      locationComponent.distrito = 'Cercado de Lima';
      locationFixture.detectChanges();
      const locationCompiled = locationFixture.nativeElement as HTMLElement;
      const mapButton = locationCompiled.querySelector<HTMLButtonElement>('.report-map-open');
      const mapScrollSpy = vi.fn();
      const mapFocusSpy = vi.spyOn(mapButton as HTMLButtonElement, 'focus');
      Object.defineProperty(mapButton, 'scrollIntoView', { configurable: true, value: mapScrollSpy });
      locationCompiled.querySelector<HTMLButtonElement>('.report-next')?.click();
      vi.runAllTimers();

      expect(locationComponent.submitMessage).toBe('Selecciona el punto exacto en el mapa.');
      expect(mapScrollSpy).not.toHaveBeenCalled();
      expect(mapFocusSpy).not.toHaveBeenCalled();

      const descriptionFixture = TestBed.createComponent(ReportarComponent);
      const descriptionComponent = descriptionFixture.componentInstance;
      descriptionComponent.distrito = 'Cercado de Lima';
      descriptionComponent.direccion = 'Av. Principal 123';
      descriptionFixture.detectChanges();
      const descriptionCompiled = descriptionFixture.nativeElement as HTMLElement;
      const descriptionInput = descriptionCompiled.querySelector<HTMLTextAreaElement>('#report-description');
      const descriptionScrollSpy = vi.fn();
      const descriptionFocusSpy = vi.spyOn(descriptionInput as HTMLTextAreaElement, 'focus');
      Object.defineProperty(descriptionInput, 'scrollIntoView', { configurable: true, value: descriptionScrollSpy });
      descriptionCompiled.querySelector<HTMLButtonElement>('.report-next')?.click();
      vi.runAllTimers();

      expect(descriptionComponent.submitMessage).toBe('Describe brevemente el problema observado.');
      expect(descriptionScrollSpy).not.toHaveBeenCalled();
      expect(descriptionFocusSpy).not.toHaveBeenCalled();

      const evidenceFixture = TestBed.createComponent(ReportarComponent);
      const evidenceComponent = evidenceFixture.componentInstance;
      evidenceComponent.distrito = 'Cercado de Lima';
      evidenceComponent.direccion = 'Av. Principal 123';
      evidenceComponent.descripcion = 'Fuga visible en la vereda.';
      evidenceFixture.detectChanges();
      const evidenceCompiled = evidenceFixture.nativeElement as HTMLElement;
      const evidenceArea = evidenceCompiled.querySelector<HTMLInputElement>('#report-evidence')?.closest<HTMLElement>('.report-field');
      const evidenceScrollSpy = vi.fn();
      Object.defineProperty(evidenceArea, 'scrollIntoView', { configurable: true, value: evidenceScrollSpy });
      evidenceCompiled.querySelector<HTMLButtonElement>('.report-next')?.click();
      vi.runAllTimers();

      expect(evidenceComponent.submitMessage).toBe('Adjunta al menos una foto de evidencia.');
      expect(evidenceScrollSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('permite pasar de formulario a resumen y luego a enviado', async () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    const component = fixture.componentInstance;
    component.distrito = 'Ate';
    component.tipo = 'Fuga';
    component.direccion = 'Av. Principal 123';
    component.referencia = 'Frente al parque';
    component.descripcion = 'Fuga visible en la vereda.';
    component.evidenceImages = [{
      id: 'evidence-1',
      name: 'fuga.png',
      sizeLabel: '0.10 MB',
      previewUrl: 'blob://fuga',
      file: new File(['x'], 'fuga.png', { type: 'image/png' })
    }];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nextButton = compiled.querySelector<HTMLButtonElement>('.report-next');

    nextButton?.click();
    fixture.detectChanges();

    expect(component.reportStep).toBe('summary');
    expect(compiled.textContent).toContain('Revisa tu reporte antes de enviarlo');
    expect(compiled.textContent).toContain('Av. Principal 123');
    expect(compiled.textContent).not.toContain('Coordenadas');

    const sendButton = compiled.querySelector<HTMLButtonElement>('.report-review__actions .report-next');

    sendButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.reportStep).toBe('sent');
    expect(component.submittedCode).toBe('REP-45');
    expect(uploadService.subirReportes).toHaveBeenCalledOnce();
    expect(reportesService.crear).toHaveBeenCalledOnce();
    expect(reportesService.crear).toHaveBeenCalledWith(expect.objectContaining({
      lat: Number(component.lat.toFixed(7)),
      lng: Number(component.lng.toFixed(7))
    }));
    expect(compiled.textContent).toContain('Tu incidencia fue registrada correctamente.');
    expect(compiled.textContent).toContain('Ver seguimiento');
  });

  it('permite retroceder desde el resumen al formulario', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    fixture.componentInstance.reportStep = 'summary';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector<HTMLButtonElement>('.report-review__actions .report-back');

    backButton?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.reportStep).toBe('form');
    expect(compiled.querySelector('.report-form')).toBeTruthy();
  });

  it('bloquea el scroll de la pagina cuando el puntero esta sobre el panel del mapa', () => {
    const fixture = TestBed.createComponent(ReportarComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const mapPanel = compiled.querySelector<HTMLElement>('.report-panel--map');
    const wheelEvent = new WheelEvent('wheel', { cancelable: true, deltaY: 100 });

    mapPanel?.dispatchEvent(wheelEvent);

    expect(wheelEvent.defaultPrevented).toBe(true);
  });
});
