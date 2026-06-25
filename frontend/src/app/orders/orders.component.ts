import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { OrderService } from '../core/services/order.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  protected orderService = inject(OrderService);
  protected router = inject(Router);

  protected orders = signal<any[]>([]);
  selectedOrder: any = null;
  
  // Timer de contagem regressiva
  protected countdownText = signal<string>('');
  private timerSubscription: Subscription | null = null;

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  loadOrders() {
    console.log('Chamando getOrders()...');
    this.orderService.getOrders().subscribe({
      next: (data) => {
        console.log('PEDIDOS RECEBIDOS NO FRONTEND:', data);
        this.orders.set(data);
        // Se houver um pedido selecionado, atualiza com os dados novos da API
        if (this.selectedOrder) {
          const updated = this.orders().find(o => o.id === this.selectedOrder.id);
          if (updated) {
            this.viewOrder(updated);
          }
        }
      },
      error: (err) => {
        console.error('ERRO AO CARREGAR PEDIDOS:', err);
      }
    });
  }

  protected goBack() {
    if (this.selectedOrder) {
      this.selectedOrder = null;
      this.clearTimer();
      this.loadOrders();
    } else {
      this.router.navigate(['/']);
    }
  }
  
  protected viewOrder(order: any) {
    this.selectedOrder = order;
    this.clearTimer();

    // Se o pedido está aguardando pagamento e possui tempo limite, inicia o timer
    if (order.status === 'Aguardando' && order.expires_at) {
      this.startCountdown(order.expires_at);
    }
  }

  protected pixCopied = signal<boolean>(false);

  protected copyPixCode(pixCode: string) {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode).then(() => {
        this.pixCopied.set(true);
        setTimeout(() => this.pixCopied.set(false), 2000);
      }).catch(err => {
        console.error('Erro ao copiar código Pix:', err);
      });
    }
  }

  private startCountdown(expiresAtStr: string) {
    // Corrige fuso horário se necessário convertendo string UTC para objeto Date local
    const expiresAt = new Date(expiresAtStr).getTime();

    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance = expiresAt - now;

      if (distance < 0) {
        this.countdownText.set('EXPIRADO');
        this.selectedOrder.status = 'EXPIRADO';
        this.selectedOrder.status_step = 0;
        this.clearTimer();
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const minStr = minutes < 10 ? '0' + minutes : minutes;
        const secStr = seconds < 10 ? '0' + seconds : seconds;
        
        this.countdownText.set(`Sua reserva expira em: ${minStr}:${secStr}`);
      }
    });
  }

  private clearTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.countdownText.set('');
  }

  // Gera um nome divertido temático de psicologia para cada pedido
  getPsychologyTitle(orderId: number): string {
    const titles = [
      'Sessão Terapêutica',
      'Dose de Dopamina',
      'Reforço Positivo',
      'Terapia Intensiva',
      'Análise Sensorial',
      'Insight Adocicado',
      'Catarse de Chocolate',
      'Equilíbrio Emocional',
      'Terapia Cognitiva',
      'Resgate Interior'
    ];
    // Garante que o mesmo ID de pedido sempre retorne o mesmo título
    return titles[(orderId || 0) % titles.length];
  }
}
