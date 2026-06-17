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

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Lista divertida de nomes para preenchimento automático
  private readonly funNames = [
    'Paciente 404',
    'Freud Anônimo',
    'Jung Misterioso',
    'Lacan Ansioso',
    'Skinner Com Fome',
    'Id Descontrolado',
    'Ego Faminto',
    'Superego na Dieta',
    'Pavlov Babando'
  ];

  ngOnInit(): void {
    this.authForm = this.fb.group({
      whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      nome: [''], // Inicialmente opcional (aba login)
      aceitaNotificacoes: [false]
    });
  }

  setTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    
    // Limpa os valores e estados do formulário
    this.authForm.reset({
      whatsapp: '',
      nome: '',
      aceitaNotificacoes: false
    });

    const nomeControl = this.authForm.get('nome');
    if (tab === 'login') {
      nomeControl?.clearValidators();
    } else {
      nomeControl?.setValidators([Validators.required, Validators.minLength(2)]);
    }
    nomeControl?.updateValueAndValidity();

    // Limpa qualquer erro geral
    this.authForm.setErrors(null);
  }

  // Máscara dinâmica para formatar em tempo de digitação (XX) XXXXX-XXXX
  onWhatsappInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
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
    const randomName = this.funNames[randomIndex];
    
    this.authForm.get('nome')?.setValue(randomName);
    this.authForm.get('nome')?.markAsTouched();
    
    // Mantém a animação de rotação ativa por 500ms para feedback visual
    setTimeout(() => {
      this.isSpinning.set(false);
    }, 500);
  }

  fazerLogin() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { whatsapp, nome, aceitaNotificacoes } = this.authForm.value;

    // Se for apenas login, enviamos dados vazios/default para o nome e notificações para compatibilidade com o backend
    const nomeEnvio = this.activeTab === 'login' ? '' : nome;
    const aceitaNotifEnvio = this.activeTab === 'login' ? false : aceitaNotificacoes;

    this.authService.login(whatsapp, nomeEnvio, aceitaNotifEnvio).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']); // redireciona pro catálogo
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erro no login', err);
        // Adiciona um erro customizado ao formulário para exibição na UI
        this.authForm.setErrors({ loginError: true });
      }
    });
  }
}
