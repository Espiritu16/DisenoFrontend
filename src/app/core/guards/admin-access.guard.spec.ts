import { TestBed } from '@angular/core/testing';
import { Router, UrlSegment } from '@angular/router';
import { AuthService } from '../api/auth.service';
import { adminCanMatchGuard } from './admin-access.guard';

describe('adminAccessGuard', () => {
  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite acceso para ADMIN', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { role: 'ADMIN' } },
        { provide: Router, useValue: routerMock }
      ]
    });

    const allowed = TestBed.runInInjectionContext(() =>
      adminCanMatchGuard({} as any, [new UrlSegment('administrador', {})])
    );
    expect(allowed).toBe(true);
  });

  it('bloquea acceso para CIUDADANO y redirige', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { role: 'CIUDADANO' } },
        { provide: Router, useValue: routerMock }
      ]
    });

    const allowed = TestBed.runInInjectionContext(() =>
      adminCanMatchGuard({} as any, [new UrlSegment('administrador', {}), new UrlSegment('dashboard', {})])
    );
    expect(allowed).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalled();
  });
});
