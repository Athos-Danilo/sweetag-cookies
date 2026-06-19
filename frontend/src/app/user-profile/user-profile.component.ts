import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  userName = signal<string>('Paciente');
  userWhatsapp = signal<string>('');
  userBirthday = signal<string>('Adicionar data');
  notificationsEnabled = signal<boolean>(true);

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName.set(user.nome || 'Paciente');
      this.userWhatsapp.set(user.whatsapp || '');
      this.notificationsEnabled.set(user.aceitaNotificacoes ?? true);
    }
  }

  getInitials(): string {
    const name = this.userName();
    return name ? name.charAt(0).toUpperCase() : 'P';
  }

  goBack() {
    this.router.navigate(['/']); // Retorna para o perfil main
  }

  toggleNotifications() {
    this.notificationsEnabled.update(v => !v);
  }

  editProfile() {
    alert('Funcionalidade de edição será ativada na próxima etapa!');
  }

  deleteAccount() {
    const confirm = window.confirm('Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita.');
    if (confirm) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
