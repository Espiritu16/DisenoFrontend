import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../../core/api/api-error';
import { ApiRole, ApiUserStatus, UsuarioResponse } from '../../../core/api/api-models';
import { UsuariosService } from '../../../core/api/usuarios.service';

interface UsuarioVista {
  id: number;
  nombre: string;
  correo: string;
  rol: ApiRole;
  estado: ApiUserStatus;
  avatar: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: UsuarioVista[] = [];
  searchTerm = '';
  loading = false;
  error = '';

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.error = '';
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios.map((usuario) => this.toVista(usuario));
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = apiErrorMessage(error);
        this.loading = false;
      }
    });
  }

  get usuariosFiltrados(): UsuarioVista[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.usuarios;
    }
    return this.usuarios.filter((usuario) =>
      usuario.nombre.toLowerCase().includes(term)
      || usuario.correo.toLowerCase().includes(term)
      || this.roleLabel(usuario.rol).toLowerCase().includes(term)
      || this.statusLabel(usuario.estado).toLowerCase().includes(term)
    );
  }

  getRoleClass(rol: ApiRole): string {
    const roles: Record<ApiRole, string> = {
      ADMIN: 'role-admin',
      OPERADOR: 'role-operador',
      CIUDADANO: 'role-ciudadano'
    };
    return roles[rol];
  }

  getStatusClass(estado: ApiUserStatus): string {
    return estado === 'ACTIVO' ? 'status-active' : 'status-inactive';
  }

  roleLabel(rol: ApiRole): string {
    const labels: Record<ApiRole, string> = {
      ADMIN: 'Administrador',
      OPERADOR: 'Operador',
      CIUDADANO: 'Ciudadano'
    };
    return labels[rol];
  }

  statusLabel(estado: ApiUserStatus): string {
    return estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
  }

  onNuevoUsuario(): void {
    this.error = 'La creación de usuarios administrativos aún no tiene formulario en esta vista.';
  }

  onVerDetalles(usuario: UsuarioVista): void {
    this.error = `${usuario.nombre} - ${usuario.correo}`;
  }

  onEditar(usuario: UsuarioVista): void {
    const nuevoEstado: ApiUserStatus = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.usuariosService.actualizarRolEstado(usuario.id, usuario.rol, nuevoEstado).subscribe({
      next: (actualizado) => {
        this.usuarios = this.usuarios.map((item) => item.id === actualizado.id ? this.toVista(actualizado) : item);
      },
      error: (error: unknown) => {
        this.error = apiErrorMessage(error);
      }
    });
  }

  private toVista(usuario: UsuarioResponse): UsuarioVista {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      avatar: this.avatar(usuario.nombre)
    };
  }

  private avatar(nombre: string): string {
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('') || 'US';
  }
}
