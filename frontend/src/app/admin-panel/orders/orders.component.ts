import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private ws: WebSocket | null = null;

  ngOnInit(): void {
    this.loadOrders();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  loadOrders(): void {
    this.loading.set(true);
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar pedidos', err);
        this.errorMessage.set('Falha ao carregar lista de pedidos.');
        this.loading.set(false);
      }
    });
  }

  connectWebSocket(): void {
    const token = this.authService.getToken();
    if (!token) return;

    let baseWsUrl = '';
    const api = environment.apiUrl;
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    if (api.startsWith('http://') || api.startsWith('https://')) {
      const url = new URL(api);
      baseWsUrl = `${wsProto}//${url.host}/api/ws/admin`;
    } else {
      baseWsUrl = `${wsProto}//localhost:8000/api/ws/admin`;
    }

    const wsUrl = `${baseWsUrl}?token=${token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === 'new_order') {
          // Busca o pedido real completo do backend para exibir na lista com todos os relacionamentos
          this.adminService.getOrders().subscribe({
            next: (data) => {
              this.orders.set(data);
              this.playAlertSound();
            }
          });
        }
      } catch (e) {
        console.error('Erro ao ler mensagem WebSocket', e);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed. Retrying in 5 seconds...');
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  playAlertSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('AudioContext falhou ao iniciar (bloqueio do navegador):', e);
    }
  }

  approvePix(orderId: number): void {
    this.adminService.approvePix(orderId).subscribe({
      next: (updatedOrder) => {
        // Atualiza a lista local com o pedido atualizado
        this.orders.update(prev => 
          prev.map(o => o.id === orderId ? { ...o, status: updatedOrder.status, status_step: updatedOrder.status_step } : o)
        );
      },
      error: (err) => {
        alert(err.error?.detail || 'Erro ao aprovar Pix.');
      }
    });
  }

  advanceStatus(order: any): void {
    let nextStatus = '';
    let nextStep = 0;

    // Lógica simples de progressão de status
    if (order.status_step === 2) {
      nextStatus = 'Em Preparação';
      nextStep = 3;
    } else if (order.status_step === 3) {
      nextStatus = 'Em Rota de Entrega';
      nextStep = 4;
    } else if (order.status_step === 4) {
      nextStatus = 'Concluído';
      nextStep = 5;
    } else {
      return;
    }

    this.adminService.updateOrderStatus(order.id, nextStatus, nextStep).subscribe({
      next: (updatedOrder) => {
        this.orders.update(prev => 
          prev.map(o => o.id === order.id ? { ...o, status: updatedOrder.status, status_step: updatedOrder.status_step } : o)
        );
      },
      error: (err) => {
        alert(err.error?.detail || 'Erro ao avançar status.');
      }
    });
  }
}
