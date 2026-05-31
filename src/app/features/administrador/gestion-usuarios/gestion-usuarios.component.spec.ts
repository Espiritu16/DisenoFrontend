import { of, throwError } from 'rxjs';
import { GestionUsuariosComponent } from './gestion-usuarios.component';
import { UsuariosService } from '../../../core/api/usuarios.service';

describe('GestionUsuariosComponent', () => {
  const usuariosService = {
    listar: vi.fn(),
    actualizarRolEstado: vi.fn()
  } as unknown as UsuariosService;
  const cdr = {
    detectChanges: vi.fn()
  } as any;

  function createComponent() {
    return new GestionUsuariosComponent(usuariosService, cdr);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar usuarios recibidos del backend', async () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(of([
      { id: 5, nombre: 'Admin Prueba', correo: 'admin@test.local', rol: 'ADMIN', estado: 'ACTIVO' },
      { id: 6, nombre: 'Operador Prueba', correo: 'operador@test.local', rol: 'OPERADOR', estado: 'ACTIVO' }
    ]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.usuariosFiltrados).toHaveLength(2);
    expect(component.usuariosFiltrados[0].nombre).toBe('Admin Prueba');
    await Promise.resolve();
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('debe mostrar error cuando falla la carga de usuarios', async () => {
    vi.mocked((usuariosService as any).listar).mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'fallo' } }))
    );

    const component = createComponent();
    component.loadUsuarios();

    expect(component.loading).toBe(false);
    expect(component.error.length).toBeGreaterThan(0);
    await Promise.resolve();
    expect(cdr.detectChanges).toHaveBeenCalled();
  });
});
