import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthModalComponent } from './auth-modal.component';
import { AuthService } from '../../core/api/auth.service';

describe('AuthModalComponent', () => {
  const auth = {
    register: vi.fn(),
    login: vi.fn(),
    requestRecoveryCode: vi.fn(),
    confirmRecoveryCode: vi.fn(),
    resetPassword: vi.fn()
  } as unknown as AuthService;
  const router = {
    navigateByUrl: vi.fn()
  } as any;
  const cdr = {
    detectChanges: vi.fn()
  } as any;

  function createComponent() {
    return new AuthModalComponent(auth, router, cdr);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe volver a login cuando el registro público termina correctamente', async () => {
    vi.mocked((auth as any).register).mockReturnValue(of({
      id: 8,
      nombre: 'Registro Modal',
      correo: 'registro@gmail.com',
      rol: 'CIUDADANO',
      estado: 'ACTIVO'
    }));
    const component = createComponent();
    component.modalView = 'register';
    component.registerData = {
      nombre: 'Registro',
      correo: 'registro@gmail.com',
      password: 'Test123456',
      confirmPassword: 'Test123456'
    };

    component.submitRegister();

    expect(component.registerLoading).toBe(false);
    expect(component.modalView).toBe('login');
    expect(component.loginEmail).toBe('registro@gmail.com');
    await Promise.resolve();
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('debe mostrar error cuando el registro público falla', async () => {
    vi.mocked((auth as any).register).mockReturnValue(
      throwError(() => new HttpErrorResponse({
        status: 409,
        error: { message: 'El correo ya esta registrado' }
      }))
    );
    const component = createComponent();
    component.modalView = 'register';
    component.registerData = {
      nombre: 'Registro',
      correo: 'registro@gmail.com',
      password: 'Test123456',
      confirmPassword: 'Test123456'
    };

    component.submitRegister();

    expect(component.registerLoading).toBe(false);
    expect(component.registerError).toContain('correo ya está registrado');
    await Promise.resolve();
    expect(cdr.detectChanges).toHaveBeenCalled();
  });
});
