import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';
import { apiErrorMessage } from '../../core/api/api-error';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent implements OnChanges {
  @Input() initialView: 'login' | 'register' | 'recover' = 'login';
  @Output() closed = new EventEmitter<void>();

  modalView: 'login' | 'register' | 'recover' = 'login';
  recoverStep: 'request' | 'code' | 'reset' | 'done' = 'request';

  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;
  loginLoading = false;
  loginError = '';

  registerData = {
    nombre: '',
    apellidos: '',
    correoLocal: '',
    correoDominio: 'gmail.com',
    telefono: '',
    password: '',
    confirmPassword: ''
  };
  showRegisterPassword = false;
  showRegisterConfirmPassword = false;
  registerLoading = false;
  registerError = '';
  registerSuccess = '';

  recoverEmail = '';
  recoverLoading = false;
  recoverError = '';
  recoverSuccess = '';
  recoverCodeDigits = ['', '', '', '', '', ''];
  recoverNewPassword = '';
  recoverConfirmPassword = '';
  showRecoverNewPassword = false;
  showRecoverConfirmPassword = false;
  private recoveryToken = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialView']) {
      this.modalView = this.initialView;
      this.recoverStep = 'request';
      this.clearTransientMessages();
    }
  }

  closeModal(): void {
    this.closed.emit();
  }

  openView(view: 'login' | 'register' | 'recover'): void {
    this.modalView = view;
    this.clearTransientMessages();

    if (view === 'recover') {
      this.recoverStep = 'request';
      this.recoverEmail = this.loginEmail || this.recoverEmail;
      this.recoverCodeDigits = ['', '', '', '', '', ''];
      this.recoverNewPassword = '';
      this.recoverConfirmPassword = '';
    }
  }

  backToLogin(): void {
    this.modalView = 'login';
    this.recoverStep = 'request';
    this.clearTransientMessages();
  }

  submitLogin(): void {
    this.loginError = '';
    if (!this.loginEmail.trim() || !this.loginPassword.trim()) {
      this.loginError = 'Completa correo y contraseña.';
      return;
    }

    this.loginLoading = true;
    this.auth.login(this.normalizeEmail(this.loginEmail), this.loginPassword).subscribe({
      next: (session) => {
        this.loginLoading = false;
        this.closed.emit();
        const destino = session.rol === 'CIUDADANO' ? '/mis-reportes' : '/administrador/dashboard';
        void this.router.navigateByUrl(destino);
      },
      error: (error: unknown) => {
        this.loginLoading = false;
        this.loginError = apiErrorMessage(error);
      }
    });
  }

  submitRegister(): void {
    this.registerError = '';
    this.registerSuccess = '';

    const correo = this.normalizeEmail(this.buildRegisterEmail());
    if (!this.registerData.nombre.trim() || !this.registerData.apellidos.trim() || !this.registerData.correoLocal.trim() || !this.registerData.password || !this.registerData.confirmPassword) {
      this.registerError = 'Completa todos los campos obligatorios.';
      return;
    }

    if (this.registerData.password.length < 8) {
      this.registerError = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.registerError = 'Las contraseñas no coinciden.';
      return;
    }

    this.registerLoading = true;
    const nombreCompleto = `${this.registerData.nombre.trim()} ${this.registerData.apellidos.trim()}`.trim();
    this.auth.register(nombreCompleto, correo, this.registerData.password).subscribe({
      next: () => {
        this.registerLoading = false;
        this.registerSuccess = 'Cuenta creada. Ahora inicia sesión.';
        this.modalView = 'login';
        this.loginEmail = correo;
        this.loginPassword = '';
      },
      error: (error: unknown) => {
        this.registerLoading = false;
        const message = apiErrorMessage(error);
        this.registerError = message === 'El correo ya esta registrado'
          ? 'Ese correo ya está registrado. Inicia sesión o recupera tu contraseña.'
          : message;
      }
    });
  }

  requestRecoveryCode(): void {
    this.recoverError = '';
    this.recoverSuccess = '';

    if (!this.recoverEmail.trim()) {
      this.recoverError = 'Ingresa tu correo.';
      return;
    }

    this.recoverLoading = true;
    this.auth.requestRecoveryCode(this.normalizeEmail(this.recoverEmail)).subscribe({
      next: () => {
        this.recoverLoading = false;
        this.recoverSuccess = 'Te enviamos un código al correo.';
        this.recoverStep = 'code';
        this.recoverCodeDigits = ['', '', '', '', '', ''];
      },
      error: (error: unknown) => {
        this.recoverLoading = false;
        this.recoverError = apiErrorMessage(error);
      }
    });
  }

  onRecoveryCodeInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = (input.value || '').replace(/\D/g, '').slice(-1);
    this.recoverCodeDigits[index] = value;
    input.value = value;

    if (value && index < this.recoverCodeDigits.length - 1) {
      const next = document.getElementById(`recover-code-${index + 1}`) as HTMLInputElement | null;
      next?.focus();
      next?.select();
    }
  }

  onRecoveryCodeKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.recoverCodeDigits[index] && index > 0) {
      const prev = document.getElementById(`recover-code-${index - 1}`) as HTMLInputElement | null;
      prev?.focus();
      prev?.select();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      (document.getElementById(`recover-code-${index - 1}`) as HTMLInputElement | null)?.focus();
      return;
    }

    if (event.key === 'ArrowRight' && index < this.recoverCodeDigits.length - 1) {
      event.preventDefault();
      (document.getElementById(`recover-code-${index + 1}`) as HTMLInputElement | null)?.focus();
    }
  }

  onRecoveryCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!pasted) {
      return;
    }

    this.recoverCodeDigits = this.recoverCodeDigits.map((_, idx) => pasted[idx] || '');

    const focusIndex = Math.min(pasted.length, 5);
    const target = document.getElementById(`recover-code-${focusIndex}`) as HTMLInputElement | null;
    target?.focus();
  }

  goToRecoverResetStep(): void {
    this.recoverError = '';
    this.recoverSuccess = '';

    const code = this.recoverCodeDigits.join('');
    if (!/^\d{6}$/.test(code)) {
      this.recoverError = 'Ingresa el código completo de 6 dígitos.';
      return;
    }

    this.recoverLoading = true;
    this.auth.confirmRecoveryCode(this.normalizeEmail(this.recoverEmail), code).subscribe({
      next: (token) => {
        this.recoveryToken = token;
        this.recoverLoading = false;
        this.recoverStep = 'reset';
      },
      error: (error: unknown) => {
        this.recoverLoading = false;
        this.recoverError = apiErrorMessage(error);
      }
    });
  }

  confirmPasswordReset(): void {
    this.recoverError = '';
    this.recoverSuccess = '';

    if (!this.recoverNewPassword || !this.recoverConfirmPassword) {
      this.recoverError = 'Completa ambas contraseñas.';
      return;
    }

    if (this.recoverNewPassword.length < 8) {
      this.recoverError = 'La nueva contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.recoverNewPassword !== this.recoverConfirmPassword) {
      this.recoverError = 'Las contraseñas no coinciden.';
      return;
    }

    this.recoverLoading = true;
    this.auth.resetPassword(this.normalizeEmail(this.recoverEmail), this.recoveryToken, this.recoverNewPassword, this.recoverConfirmPassword).subscribe({
      next: () => {
        this.recoverLoading = false;
        this.recoverStep = 'done';
        this.recoverSuccess = 'Contraseña actualizada.';
        this.loginPassword = '';
      },
      error: (error: unknown) => {
        this.recoverLoading = false;
        this.recoverError = apiErrorMessage(error);
      }
    });
  }

  private clearTransientMessages(): void {
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.recoverError = '';
    this.recoverSuccess = '';
  }

  private buildRegisterEmail(): string {
    return `${this.registerData.correoLocal.trim()}@${this.registerData.correoDominio}`;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
