import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  superadminAuthForm!: FormGroup;
  registerForm!: FormGroup;
  recoverForm!: FormGroup;

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);
  
  isFocused = false;
  isFocusedPassword = false;
  currentYear = new Date().getFullYear();

  private cookieClickCount = 0;
  private cookieClickTimeout: any = null;

  // Modais e fluxos
  showRegisterModal = signal<boolean>(false);
  registerStep = signal<'superadmin-auth' | 'register-form' | 'recovery-codes'>('superadmin-auth');
  isBootstrapMode = signal<boolean>(false);
  
  showRecoverModal = signal<boolean>(false);
  recoverStep = signal<'recover-form' | 'new-code'>('recover-form');

  recoveryCodes = signal<string[]>([]);
  newRecoveryCode = signal<string>('');

  isVerifyingSuperPassword = signal<boolean>(false);
  superPasswordError = signal<string>('');
  registerError = signal<string>('');
  recoverError = signal<string>('');

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.superadminAuthForm = this.fb.group({
      superadminPassword: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      nome: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.recoverForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      recoveryCode: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Se já estiver logado como admin, redireciona direto
    const currentUser = this.authService.getUser();
    if (this.authService.isLoggedIn() && currentUser?.is_admin) {
      this.redirect();
    }
  }

  passwordMatchValidator(form: any) {
    const pwd = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pwd === confirm ? null : { passwordMismatch: true };
  }

  formatWhatsappControl(form: FormGroup, controlName: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
    
    if (value.length > 11) value = value.substring(0, 11);
    
    let formatted = '';
    if (value.length > 0) {
      formatted = `(${value.substring(0, 2)}`;
      if (value.length > 2) {
        formatted += `) ${value.substring(2, 7)}`;
        if (value.length > 7) {
          formatted += `-${value.substring(7, 11)}`;
        }
      }
    }
    form.get(controlName)?.setValue(formatted, { emitEvent: false });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { whatsapp, password } = this.loginForm.value;

    this.authService.adminLogin(whatsapp, password).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.user && response.user.is_admin) {
          this.redirect();
        } else {
          this.authService.logout();
          this.errorMessage.set('Acesso negado. Este WhatsApp não pertence a um administrador.');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erro no login admin', err);
        const detail = err.error?.detail || 'Erro de conexão com o servidor. Tente novamente.';
        this.errorMessage.set(detail);
      }
    });
  }

  // Ações de Modal de Cadastro
  openRegisterModal() {
    this.superadminAuthForm.reset();
    this.registerForm.reset();
    this.superPasswordError.set('');
    this.registerError.set('');
    this.isBootstrapMode.set(false);

    // Verifica se estamos em modo bootstrap (sem nenhum admin supremo)
    this.authService.verifySuperPassword('').subscribe({
      next: (res) => {
        if (res.valid) {
          // Nenhum admin supremo cadastrado no sistema, entra em modo bootstrap
          this.isBootstrapMode.set(true);
          this.registerStep.set('register-form');
        } else {
          this.registerStep.set('superadmin-auth');
        }
        this.showRegisterModal.set(true);
      },
      error: () => {
        // Fallback padrão se der erro de API
        this.registerStep.set('superadmin-auth');
        this.showRegisterModal.set(true);
      }
    });
  }

  closeRegisterModal() {
    this.showRegisterModal.set(false);
  }

  onVerifySuperPassword() {
    if (this.superadminAuthForm.invalid) return;

    this.isVerifyingSuperPassword.set(true);
    this.superPasswordError.set('');

    const password = this.superadminAuthForm.value.superadminPassword;

    this.authService.verifySuperPassword(password).subscribe({
      next: (res) => {
        this.isVerifyingSuperPassword.set(false);
        if (res.valid) {
          this.registerStep.set('register-form');
        } else {
          this.superPasswordError.set('Senha de Administrador Supremo incorreta.');
        }
      },
      error: (err) => {
        this.isVerifyingSuperPassword.set(false);
        const detail = err.error?.detail || 'Erro ao validar a senha. Tente novamente.';
        this.superPasswordError.set(detail);
      }
    });
  }

  onRegisterAdmin() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.registerError.set('');

    const { whatsapp, nome, password } = this.registerForm.value;
    const superadminPassword = this.isBootstrapMode() 
      ? undefined 
      : this.superadminAuthForm.value.superadminPassword;

    this.authService.adminRegister(whatsapp, nome, password, superadminPassword).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.recovery_codes && response.recovery_codes.length > 0) {
          this.recoveryCodes.set(response.recovery_codes);
          this.registerStep.set('recovery-codes');
        } else {
          // Caso a API não retorne códigos (improvável), apenas fecha e atualiza
          this.closeRegisterModal();
          this.redirect();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const detail = err.error?.detail || 'Erro ao cadastrar administrador.';
        this.registerError.set(detail);
      }
    });
  }

  copyCodesToClipboard() {
    const text = "CÓDIGOS DE RECUPERAÇÃO SWEETAG COOKIES ADMIN:\n\n" + 
                 this.recoveryCodes().join('\n') + 
                 "\n\nGuarde esses códigos em um local seguro. Cada um só pode ser usado uma vez.";
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Códigos copiados para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar códigos:', err);
    });
  }

  finishRegistration() {
    this.closeRegisterModal();
    this.redirect();
  }

  // Ações de Recuperação de Senha
  openRecoverModal() {
    this.recoverForm.reset();
    this.recoverError.set('');
    this.recoverStep.set('recover-form');
    this.showRecoverModal.set(true);
  }

  closeRecoverModal() {
    this.showRecoverModal.set(false);
  }

  onRecoverPassword() {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.recoverError.set('');

    const { whatsapp, recoveryCode, newPassword } = this.recoverForm.value;

    this.authService.adminRecover(whatsapp, recoveryCode, newPassword).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.newRecoveryCode.set(response.new_recovery_code);
        this.recoverStep.set('new-code');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const detail = err.error?.detail || 'Erro ao redefinir senha. Verifique o código e o WhatsApp.';
        this.recoverError.set(detail);
      }
    });
  }

  copyNewCodeToClipboard() {
    const text = `NOVO CÓDIGO DE RECUPERAÇÃO SWEETAG COOKIES:\n${this.newRecoveryCode()}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Novo código copiado!');
    }).catch(err => {
      console.error('Erro ao copiar código:', err);
    });
  }

  onCookieClick() {
    this.cookieClickCount++;
    if (this.cookieClickTimeout) {
      clearTimeout(this.cookieClickTimeout);
    }

    if (this.cookieClickCount === 5) {
      this.cookieClickCount = 0;
      this.router.navigate(['/']);
    } else {
      this.cookieClickTimeout = setTimeout(() => {
        this.cookieClickCount = 0;
      }, 2000);
    }
  }

  private redirect() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}
