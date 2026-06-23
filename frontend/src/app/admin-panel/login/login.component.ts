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
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]]
    });

    // Se já estiver logado como admin, redireciona direto
    const currentUser = this.authService.getUser();
    if (this.authService.isLoggedIn() && currentUser?.is_admin) {
      this.redirect();
    }
  }

  onWhatsappInput(event: Event) {
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
    this.loginForm.get('whatsapp')?.setValue(formatted, { emitEvent: false });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { whatsapp } = this.loginForm.value;

    this.authService.login(whatsapp).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.user && response.user.is_admin) {
          this.redirect();
        } else {
          // Desloga se não for admin para segurança
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

  private redirect() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}
