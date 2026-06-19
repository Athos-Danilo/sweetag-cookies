import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  pixExpanded = signal<boolean>(false);
  copySuccess = signal<boolean>(false);

  pixKey = 'b9683c10-73d6-4eaa-bcd9-92e86df2a9ae';

  constructor(private router: Router) {}

  togglePix() {
    this.pixExpanded.update(v => !v);
  }

  copyPixKey(event: Event) {
    event.stopPropagation(); // Prevents collapsing the accordion when clicking copy
    navigator.clipboard.writeText(this.pixKey).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }).catch(err => {
      console.error('Falha ao copiar a chave: ', err);
      // Fallback
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }

  goBack() {
    this.router.navigate(['/']); // Redireciona para o profile ou home
  }
}
