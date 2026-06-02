import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

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

    // Simulação de login/cadastro rápido (persistência e redirecionamento depois)
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.router.navigate(['/']); // redireciona pro catálogo
    }, 1200);
  }
}
