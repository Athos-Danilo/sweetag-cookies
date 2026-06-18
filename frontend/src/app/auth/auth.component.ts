import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  authForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  isSpinning = signal<boolean>(false);
  activeTab: 'login' | 'register' = 'login';

  isLoggedIn = signal<boolean>(false);
  userName = signal<string>('');

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  private readonly funNames = [
    'Paciente 404', 'Freud Anônimo', 'Jung Misterioso', 'Lacan Ansioso',
    'Skinner Com Fome', 'Id Descontrolado', 'Ego Faminto', 'Superego na Dieta', 'Pavlov Babando'
  ];

  ngOnInit(): void {
    this.checkLoginState();

    this.authForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      nome: [''],
      aceitaNotificacoes: [false]
    });
  }

  checkLoginState() {
    this.isLoggedIn.set(this.authService.isLoggedIn());
    if (this.isLoggedIn()) {
      const user = this.authService.getUser();
      this.userName.set(user?.nome || 'Paciente');
    }
  }

  setTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.authForm.reset({ whatsapp: '', nome: '', aceitaNotificacoes: false });

    const nomeControl = this.authForm.get('nome');
    if (tab === 'login') {
      nomeControl?.clearValidators();
    } else {
      nomeControl?.setValidators([Validators.required, Validators.minLength(2)]);
    }
    nomeControl?.updateValueAndValidity();
    this.authForm.setErrors(null);
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
    this.authForm.get('whatsapp')?.setValue(formatted, { emitEvent: false });
  }

  gerarNomeAutomatico() {
    this.isSpinning.set(true);
    const randomIndex = Math.floor(Math.random() * this.funNames.length);
    this.authForm.get('nome')?.setValue(this.funNames[randomIndex]);
    this.authForm.get('nome')?.markAsTouched();
    setTimeout(() => this.isSpinning.set(false), 500);
  }

  fazerLogin() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { whatsapp, nome, aceitaNotificacoes } = this.authForm.value;

    const authObservable = this.activeTab === 'login'
      ? this.authService.login(whatsapp)
      : this.authService.register(whatsapp, nome, aceitaNotificacoes);

    authObservable.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.checkLoginState(); // Fica na tela de perfil
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erro na autenticação', err);
        // Adiciona um erro customizado ao formulário para exibição na UI
        this.authForm.setErrors({ loginError: true });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.checkLoginState();
  }
}
