import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private authService = inject(AuthService);
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private http = inject(HttpClient);
  private swPush = inject(SwPush);

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.connect();
    }
  }

  requestPushSubscription() {
    if (!this.swPush.isEnabled) {
      console.warn('Service Worker and Push are not supported or enabled.');
      this.showToast('Push Notifications não suportadas neste navegador.');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: environment.vapidPublicKey
    })
    .then(sub => {
      console.log('Push subscription success:', sub);
      this.sendSubscriptionToBackend(sub);
    })
    .catch(err => {
      console.error('Could not subscribe to notifications', err);
      this.showToast('Erro ao inscrever para notificações.');
    });
  }

  private sendSubscriptionToBackend(sub: any) {
    this.http.post(`${environment.apiUrl}/notifications/subscribe`, sub).subscribe({
      next: () => {
        console.log('Subscription saved on backend');
        this.showToast('Notificações ativadas com sucesso!');
      },
      error: (e) => {
        console.error('Error saving subscription', e);
        this.showToast('Erro ao salvar inscrição no servidor.');
      }
    });
  }

  connect() {
    const user = this.authService.getUser();
    const token = this.authService.getToken();
    if (!user || !token) return;

    // Convert http/https to ws/wss
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/ws/notifications/${user.id}?token=${token}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.showToast(data.message || 'Nova notificação!');
      } catch(e) {
        this.showToast(event.data);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.socket?.close();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
    }
  }

  showToast(message: string) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '80px'; // Above bottom nav
    toast.style.right = '20px';
    toast.style.backgroundColor = '#FF6B00'; // Brand color or dark
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    toast.style.opacity = '0';
    toast.style.fontFamily = 'Outfit, sans-serif';

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => { toast.style.opacity = '1'; }, 10);

    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }
}
