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

  protected orders: any[] = [];
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
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        // Se houver um pedido selecionado, atualiza com os dados novos da API
        if (this.selectedOrder) {
          const updated = this.orders.find(o => o.id === this.selectedOrder.id);
          if (updated) {
            this.viewOrder(updated);
          }
        }
      },
      error: (err) => console.error('Erro ao carregar pedidos:', err)
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

  protected copyPixCode(pixCode: string) {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código Pix Copia e Cola copiado com sucesso!');
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
}
