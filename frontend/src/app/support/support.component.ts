import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupportService } from '../core/services/support.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent {
  whatsappNumber = '5587996335634';
  
  supportForm: FormGroup;
  isSubmitting = signal(false);
  showForm = signal(false);
  submitSuccess = signal(false);

  faqs = [
    {
      question: 'Qual o prazo médio de entrega?',
      answer: 'Nosso prazo médio é de 30 a 50 minutos após a confirmação do pedido, dependendo da sua distância da nossa cozinha e do volume de pedidos da fornada.',
      open: false
    },
    {
      question: 'Posso agendar minha fornada para o dia seguinte?',
      answer: 'Sim! Durante o checkout, você pode escolher a opção "Agendar" e selecionar o melhor horário para receber seus cookies quentinhos.',
      open: false
    },
    {
      question: 'Têm opções sem glúten ou veganas?',
      answer: 'No momento, temos uma deliciosa opção de Cookie Vegano de Chocolate Amargo. Continuamos testando novas receitas para incluir opções sem glúten em breve!',
      open: false
    },
    {
      question: 'Meu pedido veio errado, e agora?',
      answer: 'Pedimos mil desculpas! Por favor, mande uma mensagem rápida pelo WhatsApp clicando no botão acima, e nossa equipe resolverá seu problema imediatamente.',
      open: false
    }
  ];

  constructor(private fb: FormBuilder, private supportService: SupportService) {
    this.supportForm = this.fb.group({
      category: ['', Validators.required],
      orderId: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    this.submitSuccess.set(false);
  }

  openWhatsApp() {
    const text = encodeURIComponent('Olá! Preciso de ajuda com meu pedido na Sweetag.');
    window.open(`https://wa.me/${this.whatsappNumber}?text=${text}`, '_blank');
  }

  submitTicket() {
    if (this.supportForm.invalid) return;

    this.isSubmitting.set(true);

    this.supportService.createTicket(this.supportForm.value).subscribe({
      next: (response) => {
        console.log('Ticket enviado:', response);
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.supportForm.reset();
        
        // Esconder a mensagem de sucesso depois de um tempo
        setTimeout(() => {
          this.toggleForm();
        }, 3000);
      },
      error: (error) => {
        console.error('Erro ao enviar ticket:', error);
        this.isSubmitting.set(false);
        // Em um app real, talvez mostrar um toast de erro
        alert('Ocorreu um erro ao enviar o chamado. Tente novamente mais tarde.');
      }
    });
  }
}
