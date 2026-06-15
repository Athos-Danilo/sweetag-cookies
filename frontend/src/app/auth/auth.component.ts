import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  whatsapp = signal<string>('');
  nome = signal<string>('');
  aceitaNotificacoes = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

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

  gerarNomeAutomatico() {
    const randomIndex = Math.floor(Math.random() * this.funNames.length);
    this.nome.set(this.funNames[randomIndex]);
  }

  fazerLogin() {
    if (!this.whatsapp().trim() || !this.nome().trim()) {
      alert('Por favor, preencha seu WhatsApp e Nome.');
      return;
    }
    if (!this.aceitaNotificacoes()) {
      alert('Precisamos que você aceite receber notificações sobre o status do seu cookie!');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.login(this.whatsapp(), this.nome(), this.aceitaNotificacoes()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']); // redireciona pro catálogo
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erro no login', err);
        alert('Ocorreu um erro ao entrar no consultório. Tente novamente.');
      }
    });
  }
}
